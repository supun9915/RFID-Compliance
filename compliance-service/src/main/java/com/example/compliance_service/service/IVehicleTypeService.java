package com.example.compliance_service.service;

import com.example.compliance_service.dto.request.VehicleTypeRequest;
import com.example.compliance_service.dto.response.VehicleTypeResponse;

import java.util.List;

public interface IVehicleTypeService {

    List<VehicleTypeResponse> getAllVehicleTypes();

    VehicleTypeResponse getVehicleTypeById(Long id);

    VehicleTypeResponse createVehicleType(VehicleTypeRequest request);

    VehicleTypeResponse updateVehicleType(Long id, VehicleTypeRequest request);

    void deleteVehicleType(Long id);

    VehicleTypeResponse activateVehicleType(Long id);

    VehicleTypeResponse deactivateVehicleType(Long id);

    void softDeleteVehicleType(Long id);
}
