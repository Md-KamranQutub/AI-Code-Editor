import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "ai-code-editor-5ad0f.firebaseapp.com",
  projectId: "ai-code-editor-5ad0f",
  storageBucket: "ai-code-editor-5ad0f.firebasestorage.app",
  messagingSenderId: "224487364132",
  appId: "1:224487364132:web:ea549c4f727dec1ffceab1",
  measurementId: "G-DP7MJYXND1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider(auth);