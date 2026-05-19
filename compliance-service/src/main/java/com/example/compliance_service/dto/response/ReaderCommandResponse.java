package com.example.compliance_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReaderCommandResponse {

    private Long readerId;
    private String readerName;
    private String mqttClientId;
    private String commandTopic;
    private String command;
    private String commandId;
    private String status;
    private String message;
}

