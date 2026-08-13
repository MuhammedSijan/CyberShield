"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callGeminiAI = callGeminiAI;
const firebase_functions_1 = require("firebase-functions");
/**
 * Sends a prompt to the Google Gemini API (gemini-2.5-flash) and returns the text response.
 * Uses process.env.GEMINI_API_KEY.
 * Forces JSON output if requested.
 */
async function callGeminiAI(prompt, systemInstruction, forceJson = true) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        firebase_functions_1.logger.error("GEMINI_API_KEY is not configured on the server.");
        throw new Error("Gemini AI API key not configured on server.");
    }
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const requestBody = {
        contents: [
            {
                parts: [
                    {
                        text: prompt
                    }
                ]
            }
        ],
        generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2048
        }
    };
    if (systemInstruction) {
        requestBody.systemInstruction = {
            parts: [
                {
                    text: systemInstruction
                }
            ]
        };
    }
    if (forceJson) {
        requestBody.generationConfig.responseMimeType = "application/json";
    }
    let retries = 2;
    let delay = 1000;
    while (retries >= 0) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                const errText = await response.text();
                firebase_functions_1.logger.error(`Gemini API returned error code ${response.status}: ${errText}`);
                if (response.status === 429 || response.status >= 500) {
                    if (retries > 0) {
                        retries--;
                        firebase_functions_1.logger.info(`Retrying Gemini request. Retries left: ${retries}. Backoff delay: ${delay}ms`);
                        await new Promise((resolve) => setTimeout(resolve, delay));
                        delay *= 2;
                        continue;
                    }
                }
                throw new Error(`Gemini API returned status ${response.status}`);
            }
            const json = await response.json();
            const textResponse = json?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!textResponse) {
                throw new Error("Empty content parts in Gemini response");
            }
            return textResponse;
        }
        catch (err) {
            if (err.name === "AbortError") {
                firebase_functions_1.logger.error("Gemini API call timed out after 15 seconds.");
                throw new Error("AI intelligence request timed out. Please try again.");
            }
            if (retries > 0) {
                retries--;
                firebase_functions_1.logger.warn(`Gemini call error: ${err.message || err}. Retrying in ${delay}ms...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
                delay *= 2;
                continue;
            }
            firebase_functions_1.logger.error("All Gemini retries exhausted. Failed to resolve query:", err);
            throw err;
        }
    }
    throw new Error("Failed to contact Gemini AI engine");
}
//# sourceMappingURL=gemini.js.map