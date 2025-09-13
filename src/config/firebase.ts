import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your Firebase config - Replace with your actual config
const firebaseConfig = {
  apiKey: "AIzaSyB_vY1F50HSfxdneJrhz8u4XS_7TSfuHcg",
  authDomain: "snapchatclone-ccdf9.firebaseapp.com",
  projectId: "snapchatclone-ccdf9",
  storageBucket: "snapchatclone-ccdf9.firebasestorage.app",
  messagingSenderId: "120609396467",
  appId: "1:120609396467:web:4ad84c7c8f8e442df40986",
  measurementId: "G-97Y00YL44L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  // If already initialized, get the existing instance
  auth = getAuth(app);
}

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

// Connect to emulators in development (optional)
if (__DEV__) {
  // Uncomment these lines if you want to use Firebase emulators
  // connectFirestoreEmulator(db, 'localhost', 8080);
  // connectAuthEmulator(auth, 'http://localhost:9099');
}

export { auth, db, storage };
export default app;