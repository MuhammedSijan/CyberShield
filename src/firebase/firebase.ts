// src/firebase/firebase.ts

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import {
    initializeAppCheck,
    ReCaptchaV3Provider,
} from "firebase/app-check";

// ---------------------------------------------------------
// Firebase configuration
// ---------------------------------------------------------

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// ---------------------------------------------------------
// Initialize Firebase
// ---------------------------------------------------------

const app = initializeApp(firebaseConfig);

// ---------------------------------------------------------
// Firebase App Check
//
// Development:
// Uses Firebase App Check Debug Token so localhost works.
//
// Production:
// Uses reCAPTCHA v3.
//
// IMPORTANT:
// The debug token must be registered in Firebase Console
// before App Check-enforced services will accept it.
// ---------------------------------------------------------

if (typeof window !== "undefined") {
    try {
        if (import.meta.env.DEV) {
            // Tell Firebase to generate/use a local debug token.
            // This is ONLY for local development.
            (self as typeof self & {
                FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean | string;
            }).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
        }

        const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

        if (!recaptchaSiteKey) {
            console.warn(
                "Firebase App Check: VITE_RECAPTCHA_SITE_KEY is missing."
            );
        } else {
            initializeAppCheck(app, {
                provider: new ReCaptchaV3Provider(recaptchaSiteKey),
                isTokenAutoRefreshEnabled: true,
            });

            console.info(
                `Firebase App Check initialized in ${import.meta.env.DEV ? "development" : "production"
                } mode.`
            );
        }
    } catch (error) {
        console.error(
            "Firebase App Check initialization failed:",
            error
        );
    }
}

// ---------------------------------------------------------
// Firebase Services
// ---------------------------------------------------------

export const auth = getAuth(app);

export const db = getFirestore(app);

export const functions = getFunctions(app, "us-central1");

// Environment-aware Emulator Connection
if (import.meta.env.DEV) {
    connectFunctionsEmulator(functions, "127.0.0.1", 5001);
    console.info("Connected Firebase Functions client to local emulator (127.0.0.1:5001)");
}

// ---------------------------------------------------------
// Default Firebase app
// ---------------------------------------------------------

export default app;