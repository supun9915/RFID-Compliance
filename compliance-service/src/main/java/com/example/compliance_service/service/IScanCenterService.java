package com.example.compliance_service.service;

import com.example.compliance_service.dto.request.ScanCenterRequest;
import com.example.compliance_service.dto.response.ScanCenterResponse;

import java.util.List;

public interface IScanCenterService {

    List<ScanCenterResponse> getAllScanCenters();

    List<ScanCenterResponse> getActiveScanCenters();

    ScanCenterResponse getScanCenterById(Long id);

    ScanCenterResponse getScanCenterByName(String name);

    ScanCenterResponse createScanCenter(ScanCenterRequest request);

    ScanCenterResponse updateScanCenter(Long id, ScanCenterRequest request);

    void deleteScanCenter(Long id);

    ScanCenterResponse activateScanCenter(Long id);

    ScanCenterResponse deactivateScanCenter(Long id);

    void softDeleteScanCenter(Long id);
}
