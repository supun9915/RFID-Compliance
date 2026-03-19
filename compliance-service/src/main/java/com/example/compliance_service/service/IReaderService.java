package com.example.compliance_service.service;

import com.example.compliance_service.dto.request.ReadersRequest;
import com.example.compliance_service.dto.response.ReaderResponse;

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
}
