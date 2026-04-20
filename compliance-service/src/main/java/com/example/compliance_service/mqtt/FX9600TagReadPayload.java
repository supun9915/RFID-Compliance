package com.example.compliance_service.mqtt;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

/**
 * Represents the JSON payload published by the Zebra FX9600 RFID reader
 * over MQTT after each antenna scan.
 *
 * <p>Supports two payload formats:
 * <p>Format 1 (Legacy):
 * <pre>
 * {
 *   "reader_ip"  : "192.168.1.100",
 *   "reader_name": "FX9600-A1B2C3",
 *   "tag_reads"  : [
 *     { "epc": "E28011702000020A12345678", "antenna_port": 1, "peak_rssi": -45 }
 *   ]
 * }
 * </pre>
 *
 * <p>Format 2 (Current - Single tag event):
 * <pre>
 * {
 *   "data": {
 *     "antenna": 1,
 *     "eventNum": 0,
 *     "format": "epc",
 *     "idHex": "e280699500007003a33462c4",
 *     "peakRssi": -71,
 *     "reads": 1
 *   },
 *   "timestamp": "2025-09-12T01:46:31.120+0000",
 *   "type": "SIMPLE"
 * }
 * </pre>
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class FX9600TagReadPayload {

    // ── Legacy format fields ──────────────────────────────────────────────────

    /** IP address of the FX9600 reader that published this message */
    @JsonProperty("reader_ip")
    private String readerIp;

    /** Optional reader hostname / name configured on the device */
    @JsonProperty("reader_name")
    private String readerName;

    /** One or more tag reads captured by the AN720 antenna (legacy format) */
    @JsonProperty("tag_reads")
    private List<TagRead> tagReads;

    // ── Current format fields ─────────────────────────────────────────────────

    /** Single tag read data (current format) */
    @JsonProperty("data")
    private TagData data;

    /** Event timestamp */
    @JsonProperty("timestamp")
    private String timestamp;

    /** Event type (e.g., "SIMPLE") */
    @JsonProperty("type")
    private String type;

    // ── Legacy format nested class ────────────────────────────────────────────

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TagRead {

        /** Electronic Product Code read from the RFID tag */
        @JsonProperty("epc")
        private String epc;

        /** Antenna port number on the FX9600 (AN720 is typically port 1) */
        @JsonProperty("antenna_port")
        private Integer antennaPort;

        /** Received signal strength indicator in dBm */
        @JsonProperty("peak_rssi")
        private Double peakRssi;
    }

    // ── Current format nested class ───────────────────────────────────────────

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TagData {

        /** Antenna port number (1-based) */
        @JsonProperty("antenna")
        private Integer antenna;

        /** Event sequence number */
        @JsonProperty("eventNum")
        private Integer eventNum;

        /** Tag ID format (e.g., "epc") */
        @JsonProperty("format")
        private String format;

        /** Electronic Product Code in hexadecimal */
        @JsonProperty("idHex")
        private String idHex;

        /** Peak RSSI (Received Signal Strength Indicator) in dBm */
        @JsonProperty("peakRssi")
        private Integer peakRssi;

        /** Number of reads */
        @JsonProperty("reads")
        private Integer reads;
    }
}

