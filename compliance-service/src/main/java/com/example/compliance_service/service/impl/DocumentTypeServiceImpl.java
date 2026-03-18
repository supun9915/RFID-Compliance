package com.example.compliance_service.service.impl;

import com.example.compliance_service.dto.request.DocumentTypeRequest;
import com.example.compliance_service.dto.response.DocumentTypeResponse;
import com.example.compliance_service.entity.DocumentType;
import com.example.compliance_service.exception.ResourceNotFoundException;
import com.example.compliance_service.repository.DocumentTypeRepository;
import com.example.compliance_service.service.IDocumentTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentTypeServiceImpl implements IDocumentTypeService {

    private final DocumentTypeRepository documentTypeRepository;

    @Override
    public List<DocumentTypeResponse> getAllDocumentTypes() {
        return documentTypeRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public DocumentTypeResponse getDocumentTypeById(Long id) {
        DocumentType documentType = documentTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document type not found with id: " + id));
        return mapToResponse(documentType);
    }

    @Override
    @Transactional
    public DocumentTypeResponse createDocumentType(DocumentTypeRequest request) {
        DocumentType documentType = DocumentType.builder()
                .name(request.getName())
                .description(request.getDescription())
                .active(true)
                .deleted(false)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        DocumentType savedDocumentType = documentTypeRepository.save(documentType);
        return mapToResponse(savedDocumentType);
    }

    @Override
    @Transactional
    public DocumentTypeResponse updateDocumentType(Long id, DocumentTypeRequest request) {
        DocumentType documentType = documentTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document type not found with id: " + id));

        documentType.setName(request.getName());
        documentType.setDescription(request.getDescription());
        documentType.setUpdatedAt(OffsetDateTime.now());

        DocumentType updatedDocumentType = documentTypeRepository.save(documentType);
        return mapToResponse(updatedDocumentType);
    }

    @Override
    @Transactional
    public void deleteDocumentType(Long id) {
        if (!documentTypeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Document type not found with id: " + id);
        }
        documentTypeRepository.deleteById(id);
    }

    @Override
    @Transactional
    public DocumentTypeResponse activateDocumentType(Long id) {
        DocumentType documentType = documentTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document type not found with id: " + id));
        documentType.setActive(true);
        documentType.setUpdatedAt(OffsetDateTime.now());
        return mapToResponse(documentTypeRepository.save(documentType));
    }

    @Override
    @Transactional
    public DocumentTypeResponse deactivateDocumentType(Long id) {
        DocumentType documentType = documentTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document type not found with id: " + id));
        documentType.setActive(false);
        documentType.setUpdatedAt(OffsetDateTime.now());
        return mapToResponse(documentTypeRepository.save(documentType));
    }

    @Override
    @Transactional
    public void softDeleteDocumentType(Long id) {
        DocumentType documentType = documentTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document type not found with id: " + id));
        documentType.setActive(false);
        documentType.setDeleted(true);
        documentType.setUpdatedAt(OffsetDateTime.now());
        documentTypeRepository.save(documentType);
    }

    private DocumentTypeResponse mapToResponse(DocumentType documentType) {
        return DocumentTypeResponse.builder()
                .id(documentType.getId())
                .name(documentType.getName())
                .description(documentType.getDescription())
                .active(documentType.getActive())
                .deleted(documentType.getDeleted())
                .build();
    }
}
