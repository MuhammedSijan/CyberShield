"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUrlSecurityVT = checkUrlSecurityVT;
exports.checkFileHashVT = checkFileHashVT;
const firebase_functions_1 = require("firebase-functions");
/**
 * Checks a URL against VirusTotal v3 API.
 * Uses process.env.VIRUSTOTAL_API_KEY.
 */
async function checkUrlSecurityVT(url) {
    const apiKey = process.env.VIRUSTOTAL_API_KEY;
    if (!apiKey) {
        firebase_functions_1.logger.warn("VIRUSTOTAL_API_KEY is not configured on the server.");
        return { success: false, maliciousCount: 0, suspiciousCount: 0, harmlessCount: 0, totalEngines: 0, error: "VirusTotal API key not configured" };
    }
    try {
        // VirusTotal v3 requires URL identifiers to be base64 encoded (without padding)
        const base64Url = Buffer.from(url)
            .toString("base64")
            .replace(/=/g, "");
        const response = await fetch(`https://www.virustotal.com/api/v3/urls/${base64Url}`, {
            method: "GET",
            headers: {
                "x-apikey": apiKey,
                "Accept": "application/json"
            }
        });
        if (response.status === 404) {
            // URL has not been analyzed before
            firebase_functions_1.logger.info(`URL not found in VirusTotal database: ${url}. Attempting to submit for scanning.`);
            // Submit URL for scan
            const submitResponse = await fetch("https://www.virustotal.com/api/v3/urls", {
                method: "POST",
                headers: {
                    "x-apikey": apiKey,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({ url }).toString()
            });
            if (!submitResponse.ok) {
                return { success: false, maliciousCount: 0, suspiciousCount: 0, harmlessCount: 0, totalEngines: 0, error: "Not analyzed and scan submission failed" };
            }
            return { success: true, maliciousCount: 0, suspiciousCount: 0, harmlessCount: 0, totalEngines: 0, error: "New URL submitted for VirusTotal background scanning" };
        }
        if (!response.ok) {
            const errText = await response.text();
            firebase_functions_1.logger.error(`VirusTotal URL lookup failed: Code ${response.status}. Details: ${errText}`);
            return { success: false, maliciousCount: 0, suspiciousCount: 0, harmlessCount: 0, totalEngines: 0, error: `VirusTotal error ${response.status}` };
        }
        const json = await response.json();
        const stats = json?.data?.attributes?.last_analysis_stats;
        const malicious = stats?.malicious ?? 0;
        const suspicious = stats?.suspicious ?? 0;
        const harmless = stats?.harmless ?? 0;
        const undetected = stats?.undetected ?? 0;
        const total = malicious + suspicious + harmless + undetected;
        return {
            success: true,
            maliciousCount: malicious,
            suspiciousCount: suspicious,
            harmlessCount: harmless,
            totalEngines: total,
            scanDate: json?.data?.attributes?.last_analysis_date
                ? new Date(json.data.attributes.last_analysis_date * 1000).toISOString()
                : undefined
        };
    }
    catch (error) {
        firebase_functions_1.logger.error("Error calling VirusTotal URL API:", error);
        return { success: false, maliciousCount: 0, suspiciousCount: 0, harmlessCount: 0, totalEngines: 0, error: error?.message || "Internal network error" };
    }
}
/**
 * Checks a file's SHA-256 hash against VirusTotal v3 API.
 */
async function checkFileHashVT(hash) {
    const apiKey = process.env.VIRUSTOTAL_API_KEY;
    if (!apiKey) {
        return { success: false, maliciousCount: 0, suspiciousCount: 0, harmlessCount: 0, totalEngines: 0, error: "VirusTotal API key not configured" };
    }
    try {
        const response = await fetch(`https://www.virustotal.com/api/v3/files/${hash}`, {
            method: "GET",
            headers: {
                "x-apikey": apiKey,
                "Accept": "application/json"
            }
        });
        if (response.status === 404) {
            return { success: true, maliciousCount: 0, suspiciousCount: 0, harmlessCount: 0, totalEngines: 0, error: "File hash unknown to VirusTotal" };
        }
        if (!response.ok) {
            return { success: false, maliciousCount: 0, suspiciousCount: 0, harmlessCount: 0, totalEngines: 0, error: `VirusTotal error ${response.status}` };
        }
        const json = await response.json();
        const stats = json?.data?.attributes?.last_analysis_stats;
        const malicious = stats?.malicious ?? 0;
        const suspicious = stats?.suspicious ?? 0;
        const harmless = stats?.harmless ?? 0;
        const undetected = stats?.undetected ?? 0;
        const total = malicious + suspicious + harmless + undetected;
        return {
            success: true,
            maliciousCount: malicious,
            suspiciousCount: suspicious,
            harmlessCount: harmless,
            totalEngines: total,
            scanDate: json?.data?.attributes?.last_analysis_date
                ? new Date(json.data.attributes.last_analysis_date * 1000).toISOString()
                : undefined
        };
    }
    catch (error) {
        firebase_functions_1.logger.error("Error calling VirusTotal File API:", error);
        return { success: false, maliciousCount: 0, suspiciousCount: 0, harmlessCount: 0, totalEngines: 0, error: error?.message || "Internal network error" };
    }
}
//# sourceMappingURL=vt.js.map