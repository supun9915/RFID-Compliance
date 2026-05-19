package com.example.compliance_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReaderCommandRequest {

    @NotBlank(message = "command_id is required")
    private String commandId;

    @NotBlank(message = "command is required")
    @Pattern(regexp = "start|stop", message = "command must be 'start' or 'stop'")
    private String command;
}

