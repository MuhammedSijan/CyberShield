// src/firebase/firebase.ts

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCzSZMVnk7M8ha-CXyWjka1eesScD7F_fQ",
    authDomain: "cybershield-io.firebaseapp.com",
    projectId: "cybershield-io",
    storageBucket: "cybershield-io.firebasestorage.app",
    messagingSenderId: "1044779465470",
    appId: "1:1044779465470:web:095f5f201df54b4acb03af",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;