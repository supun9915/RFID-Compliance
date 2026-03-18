package com.example.compliance_service.service;

import com.example.compliance_service.dto.request.ReaderRequest;
import com.example.compliance_service.dto.response.ReaderResponse;

import java.util.List;

public interface IReaderService {

    List<ReaderResponse> getAllReaders();

    ReaderResponse getReaderById(Long id);

    ReaderResponse getReaderByName(String name);

    ReaderResponse getReaderByIpAddress(String ipAddress);

    ReaderResponse createReader(ReaderRequest request);

    ReaderResponse updateReader(Long id, ReaderRequest request);

    void deleteReader(Long id);

    ReaderResponse activateReader(Long id);

    ReaderResponse deactivateReader(Long id);

    void softDeleteReader(Long id);
}
