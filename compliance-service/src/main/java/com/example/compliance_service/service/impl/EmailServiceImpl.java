package com.example.compliance_service.service.impl;

import com.example.compliance_service.dto.response.DetectionHistoryResponse;
import com.example.compliance_service.entity.ScanCenter;
import com.example.compliance_service.entity.User;
import com.example.compliance_service.entity.Vehicle;
import com.example.compliance_service.service.IEmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements IEmailService {

    private final JavaMailSender mailSender;

    @Value("${app.email.from}")
    private String fromAddress;

    @Async
    @Override
    public void sendDocumentExpiredNotification(Vehicle vehicle, User owner, ScanCenter scanCenter,
                                                List<DetectionHistoryResponse.DocumentValidationResult> expiredDocs,
                                                List<User> scanCenterUsers) {
        String subject = "ALERT: Expired Vehicle Documents - " + vehicle.getRegistrationNumber();
        String body = buildExpiredEmailBody(vehicle, owner, scanCenter, expiredDocs);

        List<String> recipients = new ArrayList<>();
        if (owner != null && owner.getEmail() != null) {
            recipients.add(owner.getEmail());
        }
        for (User u : scanCenterUsers) {
            if (u.getEmail() != null && !recipients.contains(u.getEmail())) {
                recipients.add(u.getEmail());
            }
        }

        for (String email : recipients) {
            sendHtmlEmail(email, subject, body);
        }
    }

    @Async
    @Override
    public void sendDocumentNearExpiryNotification(Vehicle vehicle, User owner,
                                                   List<DetectionHistoryResponse.DocumentValidationResult> nearExpiryDocs) {
        if (owner == null || owner.getEmail() == null) {
            return;
        }
        String subject = "NOTICE: Vehicle Documents Expiring Soon - " + vehicle.getRegistrationNumber();
        String body = buildNearExpiryEmailBody(vehicle, owner, nearExpiryDocs);
        sendHtmlEmail(owner.getEmail(), subject, body);
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Email sent to {}: {}", to, subject);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    private String buildExpiredEmailBody(Vehicle vehicle, User owner, ScanCenter scanCenter,
                                         List<DetectionHistoryResponse.DocumentValidationResult> expiredDocs) {
        String ownerName = owner != null ? owner.getFirstName() + " " + owner.getLastName() : "Vehicle Owner";
        String scanCenterName = scanCenter != null ? scanCenter.getName() : "N/A";

        String docRows = expiredDocs.stream()
                .filter(d -> "EXPIRED".equals(d.getStatus()) || "MISSING".equals(d.getStatus()))
                .map(d -> "<tr>" +
                        "<td style='padding:8px;border:1px solid #ddd;'>" + d.getDocumentTypeName() + "</td>" +
                        "<td style='padding:8px;border:1px solid #ddd;'>" + (d.getReferenceNumber() != null ? d.getReferenceNumber() : "-") + "</td>" +
                        "<td style='padding:8px;border:1px solid #ddd;color:#c0392b;font-weight:bold;'>" + d.getStatus() + "</td>" +
                        "<td style='padding:8px;border:1px solid #ddd;'>" + (d.getEndDate() != null ? d.getEndDate().toLocalDate() : "N/A") + "</td>" +
                        "<td style='padding:8px;border:1px solid #ddd;'>" + d.getStatusDetail() + "</td>" +
                        "</tr>")
                .collect(Collectors.joining());

        return "<html><body style='font-family:Arial,sans-serif;color:#333;'>" +
                "<div style='max-width:600px;margin:auto;padding:20px;'>" +
                "<h2 style='color:#c0392b;'>&#9888; Vehicle Document Compliance Alert</h2>" +
                "<p>Dear " + ownerName + ",</p>" +
                "<p>Your vehicle was detected at <strong>" + scanCenterName + "</strong> and one or more documents have <strong style='color:#c0392b;'>expired</strong>. Immediate action is required.</p>" +
                "<table style='border-collapse:collapse;width:100%;margin:16px 0;'>" +
                "<tr style='background:#f8d7da;'>" +
                "<th style='padding:10px;border:1px solid #ddd;text-align:left;'>Document Type</th>" +
                "<th style='padding:10px;border:1px solid #ddd;text-align:left;'>Reference No.</th>" +
                "<th style='padding:10px;border:1px solid #ddd;text-align:left;'>Status</th>" +
                "<th style='padding:10px;border:1px solid #ddd;text-align:left;'>Expiry Date</th>" +
                "<th style='padding:10px;border:1px solid #ddd;text-align:left;'>Details</th>" +
                "</tr>" +
                docRows +
                "</table>" +
                "<p><strong>Vehicle:</strong> " + vehicle.getRegistrationNumber() + "</p>" +
                "<p><strong>Detected at:</strong> " + scanCenterName + "</p>" +
                "<p style='color:#7f8c8d;font-size:12px;'>Please renew the above documents immediately to ensure compliance.</p>" +
                "</div></body></html>";
    }

    private String buildNearExpiryEmailBody(Vehicle vehicle, User owner,
                                            List<DetectionHistoryResponse.DocumentValidationResult> nearExpiryDocs) {
        String ownerName = owner.getFirstName() + " " + owner.getLastName();

        String docRows = nearExpiryDocs.stream()
                .filter(d -> "NEAR_EXPIRY".equals(d.getStatus()))
                .map(d -> "<tr>" +
                        "<td style='padding:8px;border:1px solid #ddd;'>" + d.getDocumentTypeName() + "</td>" +
                        "<td style='padding:8px;border:1px solid #ddd;'>" + (d.getReferenceNumber() != null ? d.getReferenceNumber() : "-") + "</td>" +
                        "<td style='padding:8px;border:1px solid #ddd;color:#e67e22;font-weight:bold;'>Expiring Soon</td>" +
                        "<td style='padding:8px;border:1px solid #ddd;'>" + (d.getEndDate() != null ? d.getEndDate().toLocalDate() : "N/A") + "</td>" +
                        "<td style='padding:8px;border:1px solid #ddd;'>" + d.getStatusDetail() + "</td>" +
                        "</tr>")
                .collect(Collectors.joining());

        return "<html><body style='font-family:Arial,sans-serif;color:#333;'>" +
                "<div style='max-width:600px;margin:auto;padding:20px;'>" +
                "<h2 style='color:#e67e22;'>&#128337; Vehicle Document Renewal Reminder</h2>" +
                "<p>Dear " + ownerName + ",</p>" +
                "<p>This is a friendly reminder that one or more documents for your vehicle <strong>" + vehicle.getRegistrationNumber() + "</strong> are <strong style='color:#e67e22;'>expiring soon</strong>.</p>" +
                "<table style='border-collapse:collapse;width:100%;margin:16px 0;'>" +
                "<tr style='background:#fff3cd;'>" +
                "<th style='padding:10px;border:1px solid #ddd;text-align:left;'>Document Type</th>" +
                "<th style='padding:10px;border:1px solid #ddd;text-align:left;'>Reference No.</th>" +
                "<th style='padding:10px;border:1px solid #ddd;text-align:left;'>Status</th>" +
                "<th style='padding:10px;border:1px solid #ddd;text-align:left;'>Expiry Date</th>" +
                "<th style='padding:10px;border:1px solid #ddd;text-align:left;'>Details</th>" +
                "</tr>" +
                docRows +
                "</table>" +
                "<p><strong>Vehicle:</strong> " + vehicle.getRegistrationNumber() + "</p>" +
                "<p style='color:#7f8c8d;font-size:12px;'>Please renew these documents before they expire to avoid compliance issues.</p>" +
                "</div></body></html>";
    }
}
