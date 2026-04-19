package com.example.compliance_service.service.impl;

import com.example.compliance_service.dto.request.VehiclePrintConfirmRequest;
import com.example.compliance_service.dto.request.VehiclePrintTemplateRequest;
import com.example.compliance_service.dto.response.EpcResponse;
import com.example.compliance_service.dto.response.VehiclePrintConfirmResponse;
import com.example.compliance_service.dto.response.VehiclePrintTemplateResponse;
import com.example.compliance_service.entity.User;
import com.example.compliance_service.entity.Vehicle;
import com.example.compliance_service.entity.VehiclePrintHistory;
import com.example.compliance_service.exception.ResourceNotFoundException;
import com.example.compliance_service.repository.UserRepository;
import com.example.compliance_service.repository.VehiclePrintHistoryRepository;
import com.example.compliance_service.repository.VehicleRepository;
import com.example.compliance_service.repository.VehicleSequenceRepository;
import com.example.compliance_service.service.IVehiclePrintService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VehiclePrintServiceImpl implements IVehiclePrintService {

    private final VehicleRepository vehicleRepository;
    private final VehiclePrintHistoryRepository vehiclePrintHistoryRepository;
    private final UserRepository userRepository;
    private final VehicleSequenceRepository vehicleSequenceRepository;

    // -----------------------------------------------------------------------
    // API 1: Get vehicle print templates for a list of registration numbers
    // -----------------------------------------------------------------------

    @Override
    @Transactional
    public List<VehiclePrintTemplateResponse> getVehiclePrintTemplates(VehiclePrintTemplateRequest request) {
        List<VehiclePrintTemplateResponse> responses = new ArrayList<>();

        for (String regNumber : request.getRegistrationNumbers()) {
            Vehicle vehicle = vehicleRepository.findByRegistrationNumber(regNumber)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Vehicle not found with registration number: " + regNumber));

            String epcToUse;

            if (Boolean.TRUE.equals(vehicle.getPrinted())) {
                // Already printed → generate a new EPC so a fresh label can be produced
                EpcResponse newEpc = generateEpc(
                        vehicle.getVehicleType() != null ? vehicle.getVehicleType().getId() : null,
                        vehicle.getVehicleModel() != null ? vehicle.getVehicleModel().getId() : null);
                epcToUse = newEpc.getEpc();

                // Persist the pending new EPC + updated serial back onto the vehicle so the
                // confirmPrint step can compare it later.
//                vehicle.setEpc(epcToUse);
//                vehicle.setNextSerialNumber(newEpc.getNextSerialNumber());
//                vehicle.setPrinted(false);   // reset so confirmPrint knows it is a fresh label
//                vehicle.setUpdatedAt(OffsetDateTime.now());
//                vehicleRepository.save(vehicle);
            } else {
                // Not yet printed → reuse the existing EPC
                epcToUse = vehicle.getEpc();
            }

            String zplCode = buildZpl(vehicle, epcToUse);

            String ownerName = "";
            if (vehicle.getOwner() != null) {
                ownerName = vehicle.getOwner().getFirstName() + " " + vehicle.getOwner().getLastName();
            }

            responses.add(VehiclePrintTemplateResponse.builder()
                    .vehicleId(vehicle.getId())
                    .registrationNumber(vehicle.getRegistrationNumber())
                    .vehicleNumber(vehicle.getVehicleNumber())
                    .chassisNumber(vehicle.getChassisNumber())
                    .registeredYear(vehicle.getRegisteredYear())
                    .ownerName(ownerName.trim())
                    .vehicleTypeName(vehicle.getVehicleType() != null ? vehicle.getVehicleType().getName() : null)
                    .vehicleModelName(vehicle.getVehicleModel() != null ? vehicle.getVehicleModel().getName() : null)
                    .epc(epcToUse)
                    .zplCode(zplCode)
                    .isPrinted(vehicle.getPrinted())
                    .build());
        }

        return responses;
    }

    // -----------------------------------------------------------------------
    // API 2: Confirm print – vehicle number + EPC
    // -----------------------------------------------------------------------

    @Override
    @Transactional
    public VehiclePrintConfirmResponse confirmPrint(VehiclePrintConfirmRequest request, String username) {

        Vehicle vehicle = vehicleRepository.findByVehicleNumber(request.getVehicleNumber())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Vehicle not found with vehicle number: " + request.getVehicleNumber()));

        User printBy = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        boolean newEpcGenerated = false;
        OffsetDateTime now = OffsetDateTime.now();

        if (request.getEpc().equals(vehicle.getEpc())) {
            // EPC matches the current vehicle EPC → just mark as printed
            vehicle.setPrinted(true);
            vehicle.setPrintDate(now);
            vehicle.setPrintBy(printBy);
            vehicle.setUpdatedAt(now);
        } else {
            // EPC is different → archive the old EPC to print history, then update vehicle
            VehiclePrintHistory history = VehiclePrintHistory.builder()
                    .epc(vehicle.getEpc())
                    .vehicle(vehicle)
                    .printDate(now)
                    .printBy(printBy)
                    .build();
            vehiclePrintHistoryRepository.save(history);

            // Update vehicle with the new EPC
            vehicle.setEpc(request.getEpc());
            vehicle.setPrinted(true);
            vehicle.setPrintDate(now);
            vehicle.setPrintBy(printBy);
            vehicle.setUpdatedAt(now);
            newEpcGenerated = true;
        }

        Vehicle saved = vehicleRepository.save(vehicle);

        return VehiclePrintConfirmResponse.builder()
                .vehicleId(saved.getId())
                .registrationNumber(saved.getRegistrationNumber())
                .vehicleNumber(saved.getVehicleNumber())
                .epc(saved.getEpc())
                .isPrinted(saved.getPrinted())
                .printDate(saved.getPrintDate())
                .printByUsername(printBy.getUsername())
                .newEpcGenerated(newEpcGenerated)
                .build();
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    /**
     * Generate a 96-bit (12-byte) EPC as a 24-character uppercase hex string.
     * Mirrors the logic in VehicleServiceImpl.
     */
    private EpcResponse generateEpc(Long vehicleTypeId, Long vehicleModelId) {
        // Read the current serial number from the vehicle_sequence table
        com.example.compliance_service.entity.VehicleSequence sequence =
                vehicleSequenceRepository.findTopByOrderByIdAsc()
                        .orElseGet(() -> vehicleSequenceRepository.save(
                                com.example.compliance_service.entity.VehicleSequence.builder()
                                        .serialNumber(1L)
                                        .build()));

        long nextSerial = sequence.getSerialNumber();

        long safeTypeId  = vehicleTypeId  != null ? vehicleTypeId  & 0xFFFFL : 0L;
        long safeModelId = vehicleModelId != null ? vehicleModelId & 0xFFFFL : 0L;
        long safeSerial  = nextSerial & 0xFFFFFFL;

        String epc = String.format("01%04X%04X00000000%06X", safeTypeId, safeModelId, safeSerial);

        // Increment and persist the serial number back to the sequence table
        sequence.setSerialNumber(nextSerial + 1);
        vehicleSequenceRepository.save(sequence);

        EpcResponse epcResponse = new EpcResponse();
        epcResponse.setEpc(epc);
        epcResponse.setNextSerialNumber(nextSerial + 1);
        return epcResponse;
    }

    /**
     * Build the ZPL label code by substituting vehicle data into the type's ZPL template.
     *
     * Supported placeholders in the stored zplCode template:
     *   {EPC}                – EPC hex string
     *   {REGISTRATION}       – registration number
     *   {VEHICLE_NUMBER}     – vehicle plate / number
     *   {CHASSIS}            – chassis number
     *   {YEAR}               – registered year
     *   {OWNER}              – owner full name
     *   {VEHICLE_TYPE}       – vehicle type name
     *   {VEHICLE_MODEL}      – vehicle model name
     *
     * If no template is stored on the VehicleType, a sensible default ZPL is generated.
     */
    private String buildZpl(Vehicle vehicle, String epc) {
        String ownerName = "";
        if (vehicle.getOwner() != null) {
            ownerName = (vehicle.getOwner().getFirstName() + " " + vehicle.getOwner().getLastName()).trim();
        }

        String typeName  = vehicle.getVehicleType()  != null ? vehicle.getVehicleType().getName()  : "";
        String modelName = vehicle.getVehicleModel() != null ? vehicle.getVehicleModel().getName() : "";

        // Use stored template if available
        if (vehicle.getVehicleType() != null
                && vehicle.getVehicleType().getZplCode() != null
                && !vehicle.getVehicleType().getZplCode().isBlank()) {

            return vehicle.getVehicleType().getZplCode()
                    .replace("{EPC}",              epc)
                    .replace("{REGISTRATION}",     nvl(vehicle.getRegistrationNumber()))
                    .replace("{VEHICLE_NUMBER}",   nvl(vehicle.getVehicleNumber()))
                    .replace("{CHASSIS}",          nvl(vehicle.getChassisNumber()))
                    .replace("{YEAR}",             vehicle.getRegisteredYear() != null ? vehicle.getRegisteredYear().toString() : "")
                    .replace("{OWNER}",            ownerName)
                    .replace("{VEHICLE_TYPE}",     typeName)
                    .replace("{VEHICLE_MODEL}",    modelName);
        }

        // Default ZPL template – RFID label with key vehicle data
        return String.format(
                "^XA\n" +
                "^MMT\n" +
                "^PW609\n" +
                "^LL0203\n" +
                "^LS0\n" +
                // EPC RFID write
                "^RFW,E^FD%s^FS\n" +
                // Title bar
                "^FO20,10^A0N,28,28^FDRFID Vehicle Label^FS\n" +
                // Registration Number
                "^FO20,50^A0N,24,24^FDReg No : %s^FS\n" +
                // Vehicle Number
                "^FO20,80^A0N,24,24^FDVehicle : %s^FS\n" +
                // Chassis
                "^FO20,110^A0N,20,20^FDChassis : %s^FS\n" +
                // Year
                "^FO20,135^A0N,20,20^FDYear    : %s^FS\n" +
                // Owner
                "^FO20,160^A0N,20,20^FDOwner   : %s^FS\n" +
                // Type / Model
                "^FO20,185^A0N,18,18^FD%s / %s^FS\n" +
                // EPC barcode
                "^FO400,50^BY2^BCN,60,N,N^FD%s^FS\n" +
                "^XZ",
                epc,
                nvl(vehicle.getRegistrationNumber()),
                nvl(vehicle.getVehicleNumber()),
                nvl(vehicle.getChassisNumber()),
                vehicle.getRegisteredYear() != null ? vehicle.getRegisteredYear().toString() : "N/A",
                ownerName,
                typeName,
                modelName,
                epc
        );
    }

    private String nvl(String value) {
        return value != null ? value : "";
    }
}

