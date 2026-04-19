package com.example.compliance_service.service;

import com.example.compliance_service.dto.request.VehiclePrintConfirmRequest;
import com.example.compliance_service.dto.request.VehiclePrintTemplateRequest;
import com.example.compliance_service.dto.response.VehiclePrintConfirmResponse;
import com.example.compliance_service.dto.response.VehiclePrintTemplateResponse;

import java.util.List;

public interface IVehiclePrintService {

    /**
     * Generate ZPL print templates for a list of vehicle registration numbers.
     * If a vehicle is already printed (isPrinted = true), a new EPC is generated.
     * If not yet printed (isPrinted = false), the current EPC is used.
     */
    List<VehiclePrintTemplateResponse> getVehiclePrintTemplates(VehiclePrintTemplateRequest request);

    /**
     * Confirm that a label has been printed.
     * - If the supplied EPC matches the current vehicle EPC: update isPrinted, printDate, printBy on vehicle.
     * - If the supplied EPC is different (re-print scenario): archive old EPC to vehicle_print_history,
     *   then update vehicle with the new EPC, isPrinted=true, printDate, printBy.
     */
    VehiclePrintConfirmResponse confirmPrint(VehiclePrintConfirmRequest request, String username);
}

