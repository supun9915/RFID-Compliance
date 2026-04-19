package com.example.compliance_service.controller;

import com.example.compliance_service.dto.request.VehiclePrintConfirmRequest;
import com.example.compliance_service.dto.request.VehiclePrintTemplateRequest;
import com.example.compliance_service.dto.response.ApiResponse;
import com.example.compliance_service.dto.response.VehiclePrintConfirmResponse;
import com.example.compliance_service.dto.response.VehiclePrintTemplateResponse;
import com.example.compliance_service.service.IVehiclePrintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicle-prints")
@RequiredArgsConstructor
public class VehiclePrintController {

    private final IVehiclePrintService vehiclePrintService;

    /**
     * Generate ZPL print templates for one or more vehicles.
     *
     * POST /api/vehicle-prints/templates
     * Body: { "registrationNumbers": ["ABC-1234", "XYZ-5678"] }
     *
     * - isPrinted = false → reuse current EPC
     * - isPrinted = true  → generate new EPC, persist it, return fresh ZPL
     */
    @PostMapping("/templates")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'OPERATOR')")
    public ResponseEntity<?> getVehiclePrintTemplates(
            @Valid @RequestBody VehiclePrintTemplateRequest request) {

        List<VehiclePrintTemplateResponse> templates =
                vehiclePrintService.getVehiclePrintTemplates(request);

        return ResponseEntity.ok(
                ApiResponse.success("Vehicle print templates generated successfully", templates));
    }

    /**
     * Confirm that a physical label has been successfully printed.
     *
     * POST /api/vehicle-prints/confirm
     * Body: { "vehicleNumber": "ABC-1234", "epc": "01000100..." }
     *
     * - EPC matches vehicle.epc  → update isPrinted=true, printDate, printBy on vehicle
     * - EPC is different         → archive old EPC to vehicle_print_history,
     *                              then update vehicle with new EPC + print details
     */
    @PostMapping("/confirm")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'OPERATOR')")
    public ResponseEntity<?> confirmPrint(
            @Valid @RequestBody VehiclePrintConfirmRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        VehiclePrintConfirmResponse response =
                vehiclePrintService.confirmPrint(request, userDetails.getUsername());

        return ResponseEntity.ok(
                ApiResponse.success("Vehicle print confirmed successfully", response));
    }
}
