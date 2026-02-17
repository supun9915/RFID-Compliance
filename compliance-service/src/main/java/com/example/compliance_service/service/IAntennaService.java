package com.example.compliance_service.service;

import com.example.compliance_service.dto.request.AntennaRequest;
import com.example.compliance_service.dto.response.AntennaResponse;

import java.util.List;

public interface IAntennaService {

    List<AntennaResponse> getAllAntennas();

    AntennaResponse getAntennaById(Long id);

    List<AntennaResponse> getAntennasByReaderId(Long readerId);

    AntennaResponse createAntenna(AntennaRequest request);

    AntennaResponse updateAntenna(Long id, AntennaRequest request);

    void deleteAntenna(Long id);
}
