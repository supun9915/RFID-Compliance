package com.example.compliance_service.service;

import com.example.compliance_service.dto.request.VehicleMakeRequest;
import com.example.compliance_service.dto.response.VehicleMakeResponse;

import java.util.List;

public interface IVehicleMakeService {

    List<VehicleMakeResponse> getAllVehicleMakes();

    VehicleMakeResponse getVehicleMakeById(Long id);

    VehicleMakeResponse createVehicleMake(VehicleMakeRequest request);

    VehicleMakeResponse updateVehicleMake(Long id, VehicleMakeRequest request);

    void deleteVehicleMake(Long id);
}
