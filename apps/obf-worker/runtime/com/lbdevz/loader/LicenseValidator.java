package com.lbdevz.loader;

import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

/**
 * License validator — calls LBDevz API, returns Kserver half + metadata.
 * Embedded in every protected JAR.
 */
public class LicenseValidator {

    private final String scheme;
    private final String apiHost;
    private final int    apiPort;
    private final String licenseKey;
    private final String nonce;

    public LicenseValidator(String apiHost, int apiPort, String licenseKey) {
        this("http", apiHost, apiPort, licenseKey, null);
    }

    public LicenseValidator(String scheme, String apiHost, int apiPort,
                            String licenseKey, String nonce) {
        this.scheme     = (scheme == null || scheme.isBlank()) ? "http" : scheme;
        this.apiHost    = apiHost;
        this.apiPort    = apiPort;
        this.licenseKey = licenseKey;
        this.nonce      = nonce;
    }

    /** Result of a successful validate call. */
    public static final class ValidateResult {
        public final boolean valid;
        public final byte[]  keyHalf;       // Kserver — 32 bytes or null
        public final String  signature;     // Ed25519 base64 signature
        public final String  error;
        public final String  ownerName;     // License owner display name
        public final String  latestVersion; // Latest published version string
        public final String  product;       // Product name
        public final String  nonce;         // Echoed request nonce

        private ValidateResult(boolean valid, byte[] keyHalf, String signature,
                               String error, String ownerName,
                               String latestVersion, String product, String nonce) {
            this.valid         = valid;
            this.keyHalf       = keyHalf;
            this.signature     = signature;
            this.error         = error;
            this.ownerName     = ownerName;
            this.latestVersion = latestVersion;
            this.product       = product;
            this.nonce         = nonce;
        }

        public static ValidateResult ok(byte[] keyHalf, String sig,
                                        String ownerName, String latestVersion,
                                        String product, String nonce) {
            return new ValidateResult(true, keyHalf, sig, null,
                                      ownerName, latestVersion, product, nonce);
        }

        public static ValidateResult fail(String error) {
            return new ValidateResult(false, null, null, error, null, null, null, null);
        }
    }

    public ValidateResult validate() {
        try {
            String body = (nonce != null && !nonce.isBlank())
                ? "{\"licenseKey\":\"" + escapeJson(licenseKey) + "\",\"nonce\":\"" + escapeJson(nonce) + "\"}"
                : "{\"licenseKey\":\"" + escapeJson(licenseKey) + "\"}";
            URL url = new URI(scheme, null, apiHost, apiPort,
                "/api/v1/license/validate", null, null).toURL();

            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);
            conn.setConnectTimeout(10_000);
            conn.setReadTimeout(10_000);

            try (OutputStream os = conn.getOutputStream()) {
                os.write(body.getBytes(StandardCharsets.UTF_8));
            }

            int status = conn.getResponseCode();
            InputStream is = (status < 400) ? conn.getInputStream() : conn.getErrorStream();
            String resp = new String(is.readAllBytes(), StandardCharsets.UTF_8);

            if (status != 200) {
                String err = jsonGet(resp, "error");
                return ValidateResult.fail(err != null ? err : "HTTP " + status);
            }

            String validStr = jsonGet(resp, "valid");
            if (!"true".equals(validStr)) {
                String err = jsonGet(resp, "error");
                return ValidateResult.fail(err != null ? err : "License not valid");
            }

            String keyHalfB64    = jsonGet(resp, "keyHalf");
            String signature     = jsonGet(resp, "signature");
            String ownerName     = jsonGet(resp, "ownerName");
            String latestVersion = jsonGet(resp, "latestVersion");
            String product       = jsonGet(resp, "product");
            String respNonce     = jsonGet(resp, "nonce");

            byte[] keyHalf = null;
            if (keyHalfB64 != null && !keyHalfB64.isBlank()) {
                keyHalf = Base64.getDecoder().decode(keyHalfB64);
            }

            return ValidateResult.ok(keyHalf, signature, ownerName, latestVersion, product, respNonce);

        } catch (Exception e) {
            return ValidateResult.fail("Connection error: " + e.getMessage());
        }
    }

    // ─── Minimal JSON field extractor ────────────────────────────────────────

    static String jsonGet(String json, String field) {
        String key = "\"" + field + "\"";
        int i = json.indexOf(key);
        if (i < 0) return null;
        int c = json.indexOf(':', i + key.length());
        if (c < 0) return null;
        int s = c + 1;
        while (s < json.length() && (json.charAt(s) == ' ' || json.charAt(s) == '\t')) s++;
        if (s >= json.length()) return null;
        if (json.charAt(s) == '"') {
            int e = json.indexOf('"', s + 1);
            return e < 0 ? null : json.substring(s + 1, e);
        }
        if (json.charAt(s) == 'n') return null; // null value
        int e = s;
        while (e < json.length() && json.charAt(e) != ',' && json.charAt(e) != '}') e++;
        return json.substring(s, e).trim();
    }

    static String escapeJson(String s) {
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}