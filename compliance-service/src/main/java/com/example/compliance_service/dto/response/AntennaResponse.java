package com.example.compliance_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AntennaResponse {

    private Long id;
    private Long readerId;
    private String readerName;
    private Integer antennaPort;
    private String name;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
