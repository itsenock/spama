import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { User } from "../types";

export class AuthService {
  // Email/Password Authentication
  static async signUpWithEmail(
    email: string,
    password: string,
    name: string,
    phone: string
  ): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // Update profile
      await updateProfile(firebaseUser, { displayName: name });

      // Create user document in Firestore
      const userData: User = {
        id: firebaseUser.uid,
        name,
        phone,
        email,
        online: true,
        status: "Hey there! I am using WhatsApp.",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, "users", firebaseUser.uid), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return userData;
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    }
  }

  static async signInWithEmail(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // Update user's online status
      await this.updateUserStatus(firebaseUser.uid, true);

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (userDoc.exists()) {
        return userDoc.data() as User;
      } else {
        throw new Error("User data not found");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  }

  // Phone Authentication
  static async sendPhoneVerification(
    phoneNumber: string,
    recaptchaVerifier: RecaptchaVerifier
  ) {
    try {
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        recaptchaVerifier
      );
      return confirmationResult;
    } catch (error) {
      console.error("Phone verification error:", error);
      throw error;
    }
  }

  static async verifyPhoneCode(
    confirmationResult: any,
    verificationCode: string,
    name: string
  ): Promise<User> {
    try {
      const userCredential = await confirmationResult.confirm(verificationCode);
      const firebaseUser = userCredential.user;

      // Check if user already exists
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

      if (!userDoc.exists()) {
        // Create new user
        const userData: User = {
          id: firebaseUser.uid,
          name,
          phone: firebaseUser.phoneNumber || "",
          online: true,
          status: "Hey there! I am using WhatsApp.",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await setDoc(doc(db, "users", firebaseUser.uid), {
          ...userData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        return userData;
      } else {
        // Update existing user's online status
        await this.updateUserStatus(firebaseUser.uid, true);
        return userDoc.data() as User;
      }
    } catch (error) {
      console.error("Phone verification error:", error);
      throw error;
    }
  }

  // Sign out
  static async signOut(): Promise<void> {
    try {
      if (auth.currentUser) {
        await this.updateUserStatus(auth.currentUser.uid, false);
      }
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  }

  // Update user online status
  static async updateUserStatus(
    userId: string,
    online: boolean
  ): Promise<void> {
    try {
      await updateDoc(doc(db, "users", userId), {
        online,
        lastSeen: online ? null : serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Update status error:", error);
    }
  }

  // Update user profile
  static async updateUserProfile(
    userId: string,
    updates: Partial<User>
  ): Promise<void> {
    try {
      await updateDoc(doc(db, "users", userId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  }

  // Get current user data
  static async getCurrentUserData(): Promise<User | null> {
    try {
      if (!auth.currentUser) return null;

      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (userDoc.exists()) {
        return userDoc.data() as User;
      }
      return null;
    } catch (error) {
      console.error("Get user data error:", error);
      return null;
    }
  }

  // Auth state listener
  static onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  // Get current Firebase user
  static getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }
}
