// Firebase Configuration
// Setup Instructions:
// 1. Go to Firebase Console: https://console.firebase.google.com
// 2. Create new project or select existing
// 3. Enable Authentication > Sign-in method > Phone & Email
// 4. Add your domain to Authorized domains
// 5. Copy your config values below

import { initializeApp } from "firebase/app";
import {
    getAuth,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink,
    type ConfirmationResult
} from "firebase/auth";

// 🔥 Firebase Configuration
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

// ============================================
// 📱 PHONE AUTHENTICATION
// ============================================
let recaptchaVerifier: RecaptchaVerifier | null = null;

export function setupRecaptcha(buttonId: string): RecaptchaVerifier {
    if (recaptchaVerifier) {
        recaptchaVerifier.clear();
    }

    recaptchaVerifier = new RecaptchaVerifier(auth, buttonId, {
        size: "invisible",
        callback: () => {
            console.log("reCAPTCHA verified");
        },
        "expired-callback": () => {
            console.log("reCAPTCHA expired");
        },
    });

    return recaptchaVerifier;
}

export async function sendPhoneVerificationCode(
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

export async function verifyPhoneCode(
    confirmationResult: ConfirmationResult,
    code: string
) {
    return confirmationResult.confirm(code);
}

// ============================================
// 📧 EMAIL AUTHENTICATION
// ============================================
const actionCodeSettings = {
    url: typeof window !== 'undefined' ? `${window.location.origin}/register?emailVerified=true` : 'http://localhost:5173/register?emailVerified=true',
    handleCodeInApp: true,
};

export async function sendEmailVerificationLink(email: string): Promise<void> {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    // Save email to localStorage for verification later
    if (typeof window !== 'undefined') {
        window.localStorage.setItem('emailForSignIn', email);
    }
}

export function checkEmailSignInLink(): boolean {
    if (typeof window === 'undefined') return false;
    return isSignInWithEmailLink(auth, window.location.href);
}

export async function completeEmailSignIn(email: string) {
    if (typeof window === 'undefined') throw new Error('Not in browser');
    return signInWithEmailLink(auth, email, window.location.href);
}

export function getSavedEmailForSignIn(): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem('emailForSignIn');
}

export function clearSavedEmail(): void {
    if (typeof window !== 'undefined') {
        window.localStorage.removeItem('emailForSignIn');
    }
}

// Legacy exports for compatibility
export const sendVerificationCode = sendPhoneVerificationCode;
export const verifyCode = verifyPhoneCode;

export { RecaptchaVerifier, type ConfirmationResult };
