package com.example.compliance_service.mqtt;

import com.example.compliance_service.config.MqttProperties;
import com.example.compliance_service.dto.request.DetectionRequest;
import com.example.compliance_service.dto.response.DetectionHistoryResponse;
import com.example.compliance_service.service.IDetectionHistoryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageHandler;
import org.springframework.messaging.MessagingException;
import org.springframework.stereotype.Component;

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

    /**
     * Invoked by Spring Integration for every MQTT message arriving on
     * {@code mqttInputChannel}.
     *
     * @param message the raw Spring Integration message; its payload is the
     *                UTF-8 string published by the FX9600 reader.
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
     * Format: {"data": {"idHex": "...", "antenna": 1, "peakRssi": -71, ...}, ...}
     */
    private void processCurrentFormat(FX9600TagReadPayload payload, String readerIp, String readerModel) {
        FX9600TagReadPayload.TagData data = payload.getData();
        String epc = data.getIdHex();

        if (epc == null || epc.isBlank()) {
            log.warn("Skipping tag event with blank idHex");
            return;
        }

        DetectionRequest request = DetectionRequest.builder()
                .epc(epc.trim().toUpperCase())
                .readerModel(readerModel)
                .readerIpAddress(readerIp)
                .build();

        try {
            DetectionHistoryResponse response = detectionHistoryService.recordDetection(request);
            if (response == null) {
                log.debug("EPC={} not registered in the system – detection ignored", epc.toUpperCase());
                return;
            }
            log.info("✓ Detection recorded | EPC={} | Status={} | Antenna={} | RSSI={} dBm | Reader={}",
                    epc.toUpperCase(),
                    response.getComplianceStatus(),
                    data.getAntenna(),
                    data.getPeakRssi(),
                    readerIp);
        } catch (Exception e) {
            log.error("✗ recordDetection failed for EPC={}: {}", epc, e.getMessage(), e);
        }
    }

    /**
     * Process legacy MQTT message format with multiple tag reads.
     * Format: {"tag_reads": [{"epc": "...", "antenna_port": 1, ...}], ...}
     */
    private void processLegacyFormat(FX9600TagReadPayload payload, String readerIp, String readerModel) {
        for (FX9600TagReadPayload.TagRead tagRead : payload.getTagReads()) {
            String epc = tagRead.getEpc();
            if (epc == null || epc.isBlank()) {
                log.warn("Skipping tag read with blank EPC");
                continue;
            }

            DetectionRequest request = DetectionRequest.builder()
                    .epc(epc.trim().toUpperCase())
                    .readerModel(readerModel)
                    .readerIpAddress(readerIp)
                    .build();

            try {
                DetectionHistoryResponse response = detectionHistoryService.recordDetection(request);
                if (response == null) {
                    log.debug("EPC={} not registered in the system – detection ignored", epc.toUpperCase());
                    continue;
                }
                log.info("✓ Detection recorded | EPC={} | Status={} | Reader={}",
                        epc.toUpperCase(),
                        response.getComplianceStatus(),
                        readerIp);
            } catch (Exception e) {
                // Log but continue processing remaining tags in the same batch
                log.error("✗ recordDetection failed for EPC={}: {}", epc, e.getMessage(), e);
            }
        }
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private String resolveReaderIp(FX9600TagReadPayload payload) {
        if (payload.getReaderIp() != null && !payload.getReaderIp().isBlank()) {
            return payload.getReaderIp().trim();
        }
        log.debug("reader_ip not present in payload, using fallback: {}",
                mqttProperties.getReaderIpFallback());
        return mqttProperties.getReaderIpFallback();
    }
}


