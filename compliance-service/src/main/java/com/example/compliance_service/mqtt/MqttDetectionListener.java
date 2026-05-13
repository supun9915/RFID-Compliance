package com.example.compliance_service.mqtt;

import com.example.compliance_service.config.MqttProperties;
import com.example.compliance_service.dto.request.DetectionRequest;
import com.example.compliance_service.dto.response.DetectionHistoryResponse;
import com.example.compliance_service.entity.Reader;
import com.example.compliance_service.repository.ReaderRepository;
import com.example.compliance_service.service.IDetectionHistoryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageHandler;
import org.springframework.messaging.MessagingException;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * Listens to MQTT messages published by the Zebra FX9600 RFID reader
 * (connected to an AN720 antenna) via HiveMQ broker.
 *
 * <p>For each tag-read event the listener builds a {@link DetectionRequest}
 * and delegates to {@link IDetectionHistoryService#recordDetection(DetectionRequest)}.
 *
 * <p>The bean is wired as a Spring Integration {@link MessageHandler} by
 * {@link com.example.compliance_service.config.MqttConfig#mqttMessageHandler}.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class MqttDetectionListener implements MessageHandler {

    private final IDetectionHistoryService detectionHistoryService;
    private final ObjectMapper objectMapper;
    private final MqttProperties mqttProperties;
    private final ReaderRepository readerRepository;
    private final MqttCommandPublisher mqttCommandPublisher;

    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);

    /** EPC prefix that identifies managed vehicle tags */
    private static final String VALID_EPC_PREFIX = "05";

    /**
     * Invoked by Spring Integration for every MQTT message arriving on
     * {@code mqttInputChannel}.
     */
    @Override
    public void handleMessage(Message<?> message) throws MessagingException {
        String rawPayload = message.getPayload().toString();
        log.debug("MQTT message received: {}", rawPayload);

        FX9600TagReadPayload tagReadPayload;
        try {
            tagReadPayload = objectMapper.readValue(rawPayload, FX9600TagReadPayload.class);
        } catch (Exception e) {
            log.error("Failed to parse MQTT payload: {}\nRaw: {}", e.getMessage(), rawPayload);
            return;
        }

        // Resolve reader details from payload; fall back to configured defaults
        String readerIp = resolveReaderIp(tagReadPayload);
        String readerModel = mqttProperties.getReaderModel();

        // Check for current format (single tag event with data.idHex)
        if (tagReadPayload.getData() != null && tagReadPayload.getData().getIdHex() != null) {
            processCurrentFormat(tagReadPayload, readerIp, readerModel);
        }
        // Check for legacy format (multiple tag reads)
        else if (tagReadPayload.getTagReads() != null && !tagReadPayload.getTagReads().isEmpty()) {
            processLegacyFormat(tagReadPayload, readerIp, readerModel);
        }
        else {
            log.warn("MQTT payload contained no recognizable tag data – skipping");
        }
    }

    /**
     * Process current MQTT message format with single tag event.
     */
    private void processCurrentFormat(FX9600TagReadPayload payload, String readerIp, String readerModel) {
        FX9600TagReadPayload.TagData data = payload.getData();
        String epc = data.getIdHex();

        if (epc == null || epc.isBlank()) {
            log.warn("Skipping tag event with blank idHex");
            return;
        }

        String normalizedEpc = epc.trim().toUpperCase();

        // Only process EPCs that start with "05" (managed vehicle tags)
        if (!normalizedEpc.startsWith(VALID_EPC_PREFIX.toUpperCase())) {
            log.debug("EPC={} does not start with '{}' – ignoring", normalizedEpc, VALID_EPC_PREFIX);
            return;
        }

        DetectionRequest request = DetectionRequest.builder()
                .epc(normalizedEpc)
                .readerModel(readerModel)
                .readerIpAddress(readerIp)
                .build();

        try {
            DetectionHistoryResponse response = detectionHistoryService.recordDetection(request);
            boolean isNonCompliant = (response == null);
            if (response == null) {
                log.debug("EPC={} not registered in the system – triggering non-compliant GPO", normalizedEpc);
            } else {
                log.info("✓ Detection recorded | EPC={} | Status={} | Antenna={} | RSSI={} dBm | Reader={}",
                        normalizedEpc,
                        response.getComplianceStatus(),
                        data.getAntenna(),
                        data.getPeakRssi(),
                        readerIp);
                String status = response.getComplianceStatus();
                // NON_COMPLIANT = EXPIRED or UNKNOWN; COMPLIANT = VALID or NEAR_EXPIRY
                isNonCompliant = "EXPIRED".equalsIgnoreCase(status) || "UNKNOWN".equalsIgnoreCase(status);
            }
            triggerGpoSignal(readerIp, isNonCompliant);
        } catch (Exception e) {
            log.error("✗ recordDetection failed for EPC={}: {}", normalizedEpc, e.getMessage(), e);
        }
    }

    /**
     * Process legacy MQTT message format with multiple tag reads.
     */
    private void processLegacyFormat(FX9600TagReadPayload payload, String readerIp, String readerModel) {
        for (FX9600TagReadPayload.TagRead tagRead : payload.getTagReads()) {
            String epc = tagRead.getEpc();
            if (epc == null || epc.isBlank()) {
                log.warn("Skipping tag read with blank EPC");
                continue;
            }

            String normalizedEpc = epc.trim().toUpperCase();

            // Only process EPCs that start with "05"
            if (!normalizedEpc.startsWith(VALID_EPC_PREFIX.toUpperCase())) {
                log.debug("EPC={} does not start with '{}' – ignoring", normalizedEpc, VALID_EPC_PREFIX);
                continue;
            }

            DetectionRequest request = DetectionRequest.builder()
                    .epc(normalizedEpc)
                    .readerModel(readerModel)
                    .readerIpAddress(readerIp)
                    .build();

            try {
                DetectionHistoryResponse response = detectionHistoryService.recordDetection(request);
                boolean isNonCompliant = (response == null);
                if (response == null) {
                    log.debug("EPC={} not registered in the system – triggering non-compliant GPO", normalizedEpc);
                } else {
                    log.info("✓ Detection recorded | EPC={} | Status={} | Reader={}",
                            normalizedEpc,
                            response.getComplianceStatus(),
                            readerIp);
                    String status = response.getComplianceStatus();
                    isNonCompliant = "EXPIRED".equalsIgnoreCase(status) || "UNKNOWN".equalsIgnoreCase(status);
                }
                triggerGpoSignal(readerIp, isNonCompliant);
            } catch (Exception e) {
                log.error("✗ recordDetection failed for EPC={}: {}", normalizedEpc, e.getMessage(), e);
            }
        }
    }

    /**
     * Send a GPO pulse to the reader:
     *  - Non-compliant (not in DB, expired): port 2 ON → wait 3 s → port 2 OFF
     *  - Compliant (valid / near-expiry):    port 1 ON → wait 3 s → port 1 OFF
     */
    private void triggerGpoSignal(String readerIp, boolean isNonCompliant) {
        // Look up the reader to get MQTT credentials and serial number
        Optional<Reader> readerOpt = readerRepository.findByIpAddress(readerIp);
        if (readerOpt.isEmpty()) {
            log.warn("Cannot send GPO command – no reader found for IP: {}", readerIp);
            return;
        }

        Reader reader = readerOpt.get();
        String brokerUrl  = reader.getMqttBrokerUrl()  != null ? reader.getMqttBrokerUrl()  : mqttProperties.getBrokerUrl();
        String clientId   = reader.getMqttClientId()   != null ? reader.getMqttClientId()   : mqttProperties.getClientId();
        String username   = reader.getMqttUsername()   != null ? reader.getMqttUsername()   : mqttProperties.getUsername();
        String password   = reader.getMqttPassword()   != null ? reader.getMqttPassword()   : mqttProperties.getPassword();
        int    qos        = reader.getMqttQos()        != null ? reader.getMqttQos()        : mqttProperties.getQos();
        String serialNumber = reader.getSerialNumber();
        String model        = reader.getModel() != null ? reader.getModel().toLowerCase() : "fx9600";

        String topic = mqttCommandPublisher.buildCommandTopic(model, serialNumber);
        int port = isNonCompliant ? 2 : 1;
        String commandId = "abcd1324";

        // Send ON
        try {
            mqttCommandPublisher.publishGpoCommand(brokerUrl, clientId, username, password, qos,
                    topic, port, true, commandId);
        } catch (Exception e) {
            log.error("Failed to publish GPO ON command (port={}) to reader {}: {}", port, readerIp, e.getMessage(), e);
        }

        // Schedule OFF after 3 seconds
        scheduler.schedule(() -> {
            try {
                mqttCommandPublisher.publishGpoCommand(brokerUrl, clientId, username, password, qos,
                        topic, port, false, commandId);
            } catch (Exception e) {
                log.error("Failed to publish GPO OFF command (port={}) to reader {}: {}", port, readerIp, e.getMessage(), e);
            }
        }, 3, TimeUnit.SECONDS);
    }

    // ── helpers ──────────────────────────��───────────────────────────────────

    private String resolveReaderIp(FX9600TagReadPayload payload) {
        if (payload.getReaderIp() != null && !payload.getReaderIp().isBlank()) {
            return payload.getReaderIp().trim();
        }
        log.debug("reader_ip not present in payload, using fallback: {}",
                mqttProperties.getReaderIpFallback());
        return mqttProperties.getReaderIpFallback();
    }
}

