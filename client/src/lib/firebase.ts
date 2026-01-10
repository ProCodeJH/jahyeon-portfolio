// Firebase Configuration
// Setup Instructions:
// 1. Go to Firebase Console: https://console.firebase.google.com
// 2. Create new project or select existing
// 3. Enable Authentication > Sign-in method > Phone
// 4. Add your domain to Authorized domains
// 5. Copy your config values below

import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";

// 🔥 Firebase Configuration
// Replace with your actual Firebase config from Firebase Console
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD8ZD4p7swQ9xto0MDOIlZ_48bespYEKtU",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "jahyeon-portfolio.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "jahyeon-portfolio",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "jahyeon-portfolio.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "920680268286",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:920680268286:web:e41ac1cd66449fbade40af",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-W50MRKZJ86",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// For development, we can enable the auth emulator
// Uncomment below if using Firebase emulator
// connectAuthEmulator(auth, "http://localhost:9099");

// RecaptchaVerifier setup
let recaptchaVerifier: RecaptchaVerifier | null = null;

export function setupRecaptcha(buttonId: string): RecaptchaVerifier {
    if (recaptchaVerifier) {
        recaptchaVerifier.clear();
    }

    recaptchaVerifier = new RecaptchaVerifier(auth, buttonId, {
        size: "invisible",
        callback: () => {
            // reCAPTCHA solved - allow signInWithPhoneNumber
            console.log("reCAPTCHA verified");
        },
        "expired-callback": () => {
            // Response expired, reset reCAPTCHA
            console.log("reCAPTCHA expired");
        },
    });

    return recaptchaVerifier;
}

export async function sendVerificationCode(
    phoneNumber: string,
    recaptcha: RecaptchaVerifier
): Promise<ConfirmationResult> {
    // Format Korean phone number (add +82 if needed)
    let formattedPhone = phoneNumber;
    if (phoneNumber.startsWith("010") || phoneNumber.startsWith("011")) {
        formattedPhone = "+82" + phoneNumber.substring(1);
    } else if (!phoneNumber.startsWith("+")) {
        formattedPhone = "+82" + phoneNumber;
    }

    return signInWithPhoneNumber(auth, formattedPhone, recaptcha);
}

export async function verifyCode(
    confirmationResult: ConfirmationResult,
    code: string
) {
    return confirmationResult.confirm(code);
}

export { RecaptchaVerifier, type ConfirmationResult };
