package com.example.compliance_service.service;

import com.example.compliance_service.dto.request.DocumentRequest;
import com.example.compliance_service.dto.response.DocumentResponse;

import java.util.List;

public interface IDocumentService {

    List<DocumentResponse> getAllDocuments();

    DocumentResponse getDocumentById(Long id);

    List<DocumentResponse> getDocumentsByVehicleId(Long vehicleId);

    List<DocumentResponse> getDocumentsByDocumentTypeId(Long documentTypeId);

    List<DocumentResponse> getExpiredDocumentsByVehicleId(Long vehicleId);

    List<DocumentResponse> getValidDocumentsByVehicleId(Long vehicleId);

    List<DocumentResponse> getDocumentsExpiringSoon(int days);

    DocumentResponse createDocument(DocumentRequest request);

    DocumentResponse updateDocument(Long id, DocumentRequest request);

    void deleteDocument(Long id);
}
