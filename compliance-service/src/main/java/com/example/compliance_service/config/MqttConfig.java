package com.example.compliance_service.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.integration.config.EnableIntegration;
import org.springframework.integration.channel.DirectChannel;
import org.springframework.integration.mqtt.core.DefaultMqttPahoClientFactory;
import org.springframework.integration.mqtt.core.MqttPahoClientFactory;
import org.springframework.integration.mqtt.inbound.MqttPahoMessageDrivenChannelAdapter;
import org.springframework.integration.mqtt.support.DefaultPahoMessageConverter;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageHandler;

/**
 * Configures the Eclipse Paho MQTT client and Spring Integration inbound adapter.
 * <p>
 * The FX9600 reader (with AN720 antenna) publishes tag-read events to the
 * configured topic.  This config subscribes to that topic and routes every
 * incoming message to the {@code mqttInputChannel}, where the
 * {@link com.example.compliance_service.mqtt.MqttDetectionListener} picks it up.
 */
@Slf4j
@Configuration
@EnableIntegration
@RequiredArgsConstructor
public class MqttConfig {

    private final MqttProperties mqttProperties;

    // ── Channel ──────────────────────────────────────────────────────────────

    @Bean
    public MessageChannel mqttInputChannel() {
        return new DirectChannel();
    }

    // ── Paho client factory ───────────────────────────────────────────────────

    @Bean
    public MqttPahoClientFactory mqttClientFactory() {
        DefaultMqttPahoClientFactory factory = new DefaultMqttPahoClientFactory();

        MqttConnectOptions options = new MqttConnectOptions();
        options.setServerURIs(new String[]{mqttProperties.getBrokerUrl()});
        options.setCleanSession(true);
        options.setAutomaticReconnect(true);
        options.setConnectionTimeout(10);
        options.setKeepAliveInterval(30);

        String username = mqttProperties.getUsername();
        String password = mqttProperties.getPassword();
        if (username != null && !username.isBlank()) {
            options.setUserName(username);
            options.setPassword(password != null ? password.toCharArray() : new char[0]);
        }

        factory.setConnectionOptions(options);
        log.info("MQTT client configured → broker: {}, topic: {}",
                mqttProperties.getBrokerUrl(), mqttProperties.getTopic());
        return factory;
    }

    // ── Inbound channel adapter (subscriber) ─────────────────────────────────

    @Bean
    public MqttPahoMessageDrivenChannelAdapter mqttInboundAdapter(
            MqttPahoClientFactory mqttClientFactory) {

        MqttPahoMessageDrivenChannelAdapter adapter =
                new MqttPahoMessageDrivenChannelAdapter(
                        mqttProperties.getBrokerUrl(),
                        mqttProperties.getClientId() + "-inbound",
                        mqttClientFactory,
                        mqttProperties.getTopic());

        adapter.setCompletionTimeout(5_000);
        adapter.setConverter(new DefaultPahoMessageConverter());
        adapter.setQos(mqttProperties.getQos());
        adapter.setOutputChannel(mqttInputChannel());
        return adapter;
    }

    // ── Outbound handler placeholder (wired in MqttDetectionListener) ────────

    /**
     * The real {@link MessageHandler} bean is defined in
     * {@link com.example.compliance_service.mqtt.MqttDetectionListener}.
     * Spring Integration will call it for every message that arrives on
     * {@code mqttInputChannel}.
     */
    @Bean
    @ServiceActivator(inputChannel = "mqttInputChannel")
    public MessageHandler mqttMessageHandler(
            com.example.compliance_service.mqtt.MqttDetectionListener listener) {
        return listener;
    }
}

