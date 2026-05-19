package com.example.compliance_service.service;

import com.example.compliance_service.dto.request.ReadersRequest;
import com.example.compliance_service.dto.request.ReaderCommandRequest;
import com.example.compliance_service.dto.response.ReaderResponse;
import com.example.compliance_service.dto.response.ReaderCommandResponse;

import java.util.List;

public interface IReaderService {

    List<ReaderResponse> getAllReaders();

    ReaderResponse activateReader(Long id);

    ReaderResponse deactivateReader(Long id);

    // ── Scan-center-scoped operations ──────────────────────────────────────────

    /** List all readers that belong to the given scan center. */
    List<ReaderResponse> getReadersByScanCenter(Long scanCenterId);

    /** Get a single reader by its id, scoped to a scan center. */
    ReaderResponse getReaderByScanCenterAndId(Long scanCenterId, Long readerId);

    /** Create a reader and associate it with the given scan center. */
    ReaderResponse createReaderForScanCenter(Long scanCenterId, ReadersRequest request);

    /** Update a reader that belongs to the given scan center. */
    ReaderResponse updateReaderForScanCenter(Long scanCenterId, Long readerId, ReadersRequest request);

    /** Soft-delete a reader that belongs to the given scan center. */
    void deleteReaderForScanCenter(Long scanCenterId, Long readerId);

    /**
     * Send a start or stop command to the reader via MQTT.
     *
     * @param readerId the reader id
     * @param request  command details (command and command_id)
     * @return response with reader and command info
     */
    ReaderCommandResponse sendReaderCommand(Long readerId, ReaderCommandRequest request);
}
