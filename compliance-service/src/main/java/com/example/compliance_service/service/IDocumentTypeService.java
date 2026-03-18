package com.example.compliance_service.service;

import com.example.compliance_service.dto.request.DocumentTypeRequest;
import com.example.compliance_service.dto.response.DocumentTypeResponse;

import java.util.List;

public interface IDocumentTypeService {

    List<DocumentTypeResponse> getAllDocumentTypes();

    DocumentTypeResponse getDocumentTypeById(Long id);

    DocumentTypeResponse createDocumentType(DocumentTypeRequest request);

    DocumentTypeResponse updateDocumentType(Long id, DocumentTypeRequest request);

    void deleteDocumentType(Long id);

    DocumentTypeResponse activateDocumentType(Long id);

    DocumentTypeResponse deactivateDocumentType(Long id);

    void softDeleteDocumentType(Long id);
}
