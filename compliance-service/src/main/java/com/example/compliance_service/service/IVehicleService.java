package com.example.compliance_service.service;

import com.example.compliance_service.dto.request.VehicleRequest;
import com.example.compliance_service.dto.response.VehicleResponse;

import java.util.List;

public interface IVehicleService {

    List<VehicleResponse> getAllVehicles();

    VehicleResponse getVehicleById(Long id);

    VehicleResponse getVehicleByEpc(String epc);

    VehicleResponse getVehicleByRegistrationNumber(String registrationNumber);

    List<VehicleResponse> getVehiclesByOwnerId(Long ownerId);

    VehicleResponse createVehicle(VehicleRequest request);

    VehicleResponse updateVehicle(Long id, VehicleRequest request);

    void deleteVehicle(Long id);
}
