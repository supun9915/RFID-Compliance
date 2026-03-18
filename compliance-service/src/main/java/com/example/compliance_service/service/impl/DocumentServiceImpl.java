package com.example.compliance_service.service.impl;

import com.example.compliance_service.dto.request.DocumentRequest;
import com.example.compliance_service.dto.response.DocumentResponse;
import com.example.compliance_service.dto.response.DocumentTypeResponse;
import com.example.compliance_service.entity.Document;
import com.example.compliance_service.entity.DocumentType;
import com.example.compliance_service.entity.Vehicle;
import com.example.compliance_service.exception.ResourceNotFoundException;
import com.example.compliance_service.exception.UserAlreadyExistsException;
import com.example.compliance_service.repository.DocumentRepository;
import com.example.compliance_service.repository.DocumentTypeRepository;
import com.example.compliance_service.repository.VehicleRepository;
import com.example.compliance_service.service.IDocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentServiceImpl implements IDocumentService {

    private final DocumentRepository documentRepository;
    private final VehicleRepository vehicleRepository;
    private final DocumentTypeRepository documentTypeRepository;

    @Override
    public List<DocumentResponse> getAllDocuments() {
        return documentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public DocumentResponse getDocumentById(Long id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + id));
        return mapToResponse(document);
    }

    @Override
    public List<DocumentResponse> getDocumentsByVehicleId(Long vehicleId) {
        return documentRepository.findByVehicleId(vehicleId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<DocumentResponse> getDocumentsByDocumentTypeId(Long documentTypeId) {
        return documentRepository.findByDocumentTypeId(documentTypeId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<DocumentResponse> getExpiredDocumentsByVehicleId(Long vehicleId) {
        return documentRepository.findExpiredDocuments(vehicleId, OffsetDateTime.now()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<DocumentResponse> getValidDocumentsByVehicleId(Long vehicleId) {
        return documentRepository.findValidDocuments(vehicleId, OffsetDateTime.now()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<DocumentResponse> getDocumentsExpiringSoon(int days) {
        OffsetDateTime startDate = OffsetDateTime.now();
        OffsetDateTime endDate = startDate.plusDays(days);
        return documentRepository.findDocumentsExpiringSoon(startDate, endDate).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public DocumentResponse createDocument(DocumentRequest request) {
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + request.getVehicleId()));

        DocumentType documentType = documentTypeRepository.findById(request.getDocumentTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Document type not found with id: " + request.getDocumentTypeId()));

        // Check document type uniqueness for the same vehicle
        if (documentRepository.existsByVehicleIdAndDocumentTypeId(request.getVehicleId(), request.getDocumentTypeId())) {
            throw new UserAlreadyExistsException("Document of this type already exists for the vehicle");
        }

        // Create 10-digit random reference number if not provided
        if (request.getReferenceNumber() == null || request.getReferenceNumber().isEmpty()) {
            request.setReferenceNumber(String.valueOf((long) (Math.random() * 1_000_000_0000L)));
        }


        Document document = Document.builder()
                .vehicle(vehicle)
                .documentType(documentType)
                .referenceNumber(request.getReferenceNumber())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .imageUrl(request.getImageUrl())
                .active(true)
                .deleted(false)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        Document savedDocument = documentRepository.save(document);
        return mapToResponse(savedDocument);
    }

    @Override
    @Transactional
    public DocumentResponse updateDocument(Long id, DocumentRequest request) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + id));

        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + request.getVehicleId()));

        DocumentType documentType = documentTypeRepository.findById(request.getDocumentTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Document type not found with id: " + request.getDocumentTypeId()));

        document.setVehicle(vehicle);
        document.setDocumentType(documentType);
        document.setReferenceNumber(request.getReferenceNumber());
        document.setStartDate(request.getStartDate());
        document.setEndDate(request.getEndDate());
        document.setImageUrl(request.getImageUrl());
        document.setUpdatedAt(OffsetDateTime.now());

        Document updatedDocument = documentRepository.save(document);
        return mapToResponse(updatedDocument);
    }

    @Override
    @Transactional
    public void deleteDocument(Long id) {
        if (!documentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Document not found with id: " + id);
        }
        documentRepository.deleteById(id);
    }

    @Override
    @Transactional
    public DocumentResponse activateDocument(Long id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + id));
        document.setActive(true);
        document.setUpdatedAt(OffsetDateTime.now());
        return mapToResponse(documentRepository.save(document));
    }

    @Override
    @Transactional
    public DocumentResponse deactivateDocument(Long id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + id));
        document.setActive(false);
        document.setUpdatedAt(OffsetDateTime.now());
        return mapToResponse(documentRepository.save(document));
    }

    @Override
    @Transactional
    public void softDeleteDocument(Long id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + id));
        document.setActive(false);
        document.setDeleted(true);
        document.setUpdatedAt(OffsetDateTime.now());
        documentRepository.save(document);
    }

    private DocumentResponse mapToResponse(Document document) {
        DocumentTypeResponse documentTypeResponse = null;
        if (document.getDocumentType() != null) {
            documentTypeResponse = DocumentTypeResponse.builder()
                    .id(document.getDocumentType().getId())
                    .name(document.getDocumentType().getName())
                    .description(document.getDocumentType().getDescription())
                    .active(document.getDocumentType().getActive())
                    .deleted(document.getDocumentType().getDeleted())
                    .build();
        }

        return DocumentResponse.builder()
                .id(document.getId())
                .vehicleId(document.getVehicle() != null ? document.getVehicle().getId() : null)
                .vehicleRegistrationNumber(document.getVehicle() != null ? document.getVehicle().getRegistrationNumber() : null)
                .documentType(documentTypeResponse)
                .referenceNumber(document.getReferenceNumber())
                .startDate(document.getStartDate())
                .endDate(document.getEndDate())
                .imageUrl(document.getImageUrl())
                .active(document.getActive())
                .deleted(document.getDeleted())
                .createdAt(document.getCreatedAt())
                .updatedAt(document.getUpdatedAt())
                .build();
    }
}
