package com.example.compliance_service.service;

import com.example.compliance_service.dto.request.VehicleModelRequest;
import com.example.compliance_service.dto.response.VehicleModelResponse;

import java.util.List;

public interface IVehicleModelService {

    List<VehicleModelResponse> getAllVehicleModels();

    List<VehicleModelResponse> getVehicleModelsByMakeId(Long makeId);

    VehicleModelResponse getVehicleModelById(Long id);

    VehicleModelResponse createVehicleModel(VehicleModelRequest request);

    VehicleModelResponse updateVehicleModel(Long id, VehicleModelRequest request);

    void deleteVehicleModel(Long id);
}
