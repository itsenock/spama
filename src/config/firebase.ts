import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB_vY1F50HSfxdneJrhz8u4XS_7TSfuHcg",
  authDomain: "snapchatclone-ccdf9.firebaseapp.com",
  projectId: "snapchatclone-ccdf9",
  storageBucket: "snapchatclone-ccdf9.firebasestorage.app",
  messagingSenderId: "120609396467",
  appId: "1:120609396467:web:4ad84c7c8f8e442df40986",
  measurementId: "G-97Y00YL44L",
};

// Only initialize if no apps exist (prevents hot reload issues)
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
