package com.example.compliance_service.service;

import com.example.compliance_service.dto.request.DetectionRequest;
import com.example.compliance_service.dto.response.DetectionHistoryResponse;

import java.util.List;

public interface IDetectionHistoryService {

    /**
     * Records a detection event triggered by an RFID reader.
     * Looks up vehicle, owner, scan-center and documents by EPC,
     * validates each document against its document-type duration,
     * then persists and returns the detection history record.
     *
     * @param request contains epc, readerModel or readerIpAddress
     * @return the persisted detection history response
     */
    DetectionHistoryResponse recordDetection(DetectionRequest request);

    /**
     * Get all detection history records.
     */
    List<DetectionHistoryResponse> getAllDetections();

    /**
     * Get detection history for a specific vehicle by ID.
     */
    List<DetectionHistoryResponse> getDetectionsByVehicleId(Long vehicleId);

    /**
     * Get detection history for a specific reader by ID.
     */
    List<DetectionHistoryResponse> getDetectionsByReaderId(Long readerId);

    /**
     * Get detection history by compliance status.
     */
    List<DetectionHistoryResponse> getDetectionsByStatus(String status);

    /**
     * Get a single detection history record by ID.
     */
    DetectionHistoryResponse getDetectionById(Long id);
}

