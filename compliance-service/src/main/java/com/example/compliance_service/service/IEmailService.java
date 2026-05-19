package com.example.compliance_service.service;

import com.example.compliance_service.dto.response.DetectionHistoryResponse;
import com.example.compliance_service.entity.ScanCenter;
import com.example.compliance_service.entity.User;
import com.example.compliance_service.entity.Vehicle;

import java.util.List;

public interface IEmailService {

    void sendDocumentExpiredNotification(Vehicle vehicle, User owner, ScanCenter scanCenter,
                                         List<DetectionHistoryResponse.DocumentValidationResult> expiredDocs,
                                         List<User> scanCenterUsers);

    void sendDocumentNearExpiryNotification(Vehicle vehicle, User owner,
                                            List<DetectionHistoryResponse.DocumentValidationResult> nearExpiryDocs);
}
