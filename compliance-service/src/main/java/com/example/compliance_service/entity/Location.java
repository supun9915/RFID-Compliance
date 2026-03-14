package com.example.compliance_service.entity;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Location {

    private Double latitude;
    private Double longitude;
}

