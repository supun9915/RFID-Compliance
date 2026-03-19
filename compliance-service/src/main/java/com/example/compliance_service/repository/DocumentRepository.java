package com.example.compliance_service.repository;

import com.example.compliance_service.entity.Document;
import com.example.compliance_service.entity.DocumentType;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByVehicleId(Long vehicleId);

    List<Document> findByDocumentTypeId(Long documentTypeId);

    @Query("SELECT d FROM Document d WHERE d.vehicle.id = :vehicleId AND d.endDate < :date")
    List<Document> findExpiredDocuments(@Param("vehicleId") Long vehicleId, @Param("date") OffsetDateTime date);

    @Query("SELECT d FROM Document d WHERE d.vehicle.id = :vehicleId AND d.endDate >= :date")
    List<Document> findValidDocuments(@Param("vehicleId") Long vehicleId, @Param("date") OffsetDateTime date);

    @Query("SELECT d FROM Document d WHERE d.endDate BETWEEN :startDate AND :endDate")
    List<Document> findDocumentsExpiringSoon(@Param("startDate") OffsetDateTime startDate, @Param("endDate") OffsetDateTime endDate);

    boolean existsByVehicleIdAndDocumentTypeId(@NotNull(message = "Vehicle ID is required") Long vehicleId, @NotNull(message = "Document type ID is required") Long documentTypeId);

    DocumentType findDocumentTypeById(@NotNull(message = "Document type ID is required") Long documentTypeId);
}
