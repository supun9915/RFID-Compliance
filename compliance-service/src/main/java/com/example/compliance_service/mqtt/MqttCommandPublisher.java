package com.example.compliance_service.mqtt;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * Service for publishing MQTT commands (start / stop) to a specific reader's
 * command topic.  A short-lived {@link MqttClient} is created per-reader using
 * the credentials stored in the {@code fix_reader} row, so each reader can
 * point at a different broker if needed.
 */
@Slf4j
@Service
public class MqttCommandPublisher {

    private final ObjectMapper objectMapper;

    @Autowired
    public MqttCommandPublisher(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * Builds the MQTT command topic for a given reader.
     * <p>
     * Current pattern: {@code cmd/mgm/<model>/<serialNumber>}
     * <br>
     * Extend this method (or add overloads) when new topic patterns are needed.
     *
     * @param model        Reader model identifier (e.g. {@code fx9600})
     * @param serialNumber Reader serial number (e.g. {@code 22361010554176})
     * @return Fully-qualified MQTT topic string
     */
    public String buildCommandTopic(String model, String serialNumber) {
        return String.format("cmd/mgm/%s/%s", model, serialNumber);
    }

    /**
     * Publish a start or stop command to the given reader's command topic.
     *
     * @param brokerUrl    MQTT broker URL (e.g. {@code ssl://host:8883})
     * @param clientId     Unique client ID to use for this publisher connection
     * @param username     Broker username (may be null)
     * @param password     Broker password (may be null)
     * @param qos          QoS level
     * @param topic        MQTT topic to publish to (use {@link #buildCommandTopic} to construct it)
     * @param command      {@code "start"} or {@code "stop"}
     * @param commandId    Arbitrary correlation ID supplied by the caller
     */
    public void publishCommand(String brokerUrl, String clientId, String username, String password, int qos,
                               String topic, String command, String commandId) throws MqttException {

        String publisherClientId = clientId + "-cmd-" + System.currentTimeMillis();

        MqttConnectOptions options = new MqttConnectOptions();
        options.setCleanSession(true);
        options.setConnectionTimeout(10);
        options.setAutomaticReconnect(false);
        if (username != null && !username.isBlank()) {
            options.setUserName(username);
            options.setPassword(password != null ? password.toCharArray() : new char[0]);
        }

        MqttClient client = new MqttClient(brokerUrl, publisherClientId,
                new org.eclipse.paho.client.mqttv3.persist.MemoryPersistence());
        try {
            client.connect(options);
            log.info("MQTT publisher connected → broker: {}, topic: {}", brokerUrl, topic);

            String payload = buildCommandPayload(command, commandId);
            MqttMessage mqttMessage = new MqttMessage(payload.getBytes());
            mqttMessage.setQos(qos);
            mqttMessage.setRetained(false);

            client.publish(topic, mqttMessage);
            log.info("✓ MQTT command published | command={} | commandId={} | topic={}",
                    command, commandId, topic);
        } finally {
            if (client.isConnected()) {
                client.disconnect();
            }
            client.close();
        }
    }

    private String buildCommandPayload(String command, String commandId) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("command", command);
            body.put("command_id", commandId);

            if ("start".equalsIgnoreCase(command)) {
                Map<String, Object> startPayload = new HashMap<>();
                startPayload.put("doNotPersistState", true);
                body.put("payload", startPayload);
            } else {
                body.put("payload", new HashMap<>());
            }

            return objectMapper.writeValueAsString(body);
        } catch (Exception e) {
            log.error("Failed to serialize MQTT command payload", e);
            return "{}";
        }
    }

    /**
     * Publish a set_gpo command to the given reader's command topic.
     *
     * @param port      GPO port number (1 = green/compliant, 2 = red/non-compliant)
     * @param state     GPO state (true = ON, false = OFF)
     * @param commandId Correlation ID
     */
    public void publishGpoCommand(String brokerUrl, String clientId, String username, String password, int qos,
                                  String topic, int port, boolean state, String commandId) throws MqttException {

        String publisherClientId = clientId + "-gpo-" + System.currentTimeMillis();

        MqttConnectOptions options = new MqttConnectOptions();
        options.setCleanSession(true);
        options.setConnectionTimeout(10);
        options.setAutomaticReconnect(false);
        if (username != null && !username.isBlank()) {
            options.setUserName(username);
            options.setPassword(password != null ? password.toCharArray() : new char[0]);
        }

        MqttClient client = new MqttClient(brokerUrl, publisherClientId,
                new org.eclipse.paho.client.mqttv3.persist.MemoryPersistence());
        try {
            client.connect(options);
            log.info("MQTT GPO publisher connected → broker: {}, topic: {}", brokerUrl, topic);

            String payload = buildGpoPayload(port, state, commandId);
            MqttMessage mqttMessage = new MqttMessage(payload.getBytes());
            mqttMessage.setQos(qos);
            mqttMessage.setRetained(false);

            client.publish(topic, mqttMessage);
            log.info("✓ GPO command published | port={} | state={} | commandId={} | topic={}",
                    port, state, commandId, topic);
        } finally {
            if (client.isConnected()) {
                client.disconnect();
            }
            client.close();
        }
    }

    private String buildGpoPayload(int port, boolean state, String commandId) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("command", "set_gpo");
            body.put("command_id", commandId);
            Map<String, Object> payload = new HashMap<>();
            payload.put("port", port);
            payload.put("state", state);
            body.put("payload", payload);
            return objectMapper.writeValueAsString(body);
        } catch (Exception e) {
            log.error("Failed to serialize GPO command payload", e);
            return "{}";
        }
    }
}
