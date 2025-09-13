import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
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
  // Sign up with email and password
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

      // Update Firebase profile
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
    } catch (error: any) {
      console.error("Sign up error:", error);
      throw new Error(error.message || "Failed to create account");
    }
  }

  // Sign in with email and password
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
        const userData = userDoc.data() as User;
        return {
          ...userData,
          id: firebaseUser.uid,
        };
      } else {
        // If user document doesn't exist, create one
        const userData: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || "User",
          phone: "",
          email: firebaseUser.email || "",
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
      }
    } catch (error: any) {
      console.error("Sign in error:", error);
      throw new Error(error.message || "Failed to sign in");
    }
  }

  // Sign out
  static async signOut(): Promise<void> {
    try {
      if (auth.currentUser) {
        await this.updateUserStatus(auth.currentUser.uid, false);
      }
      await signOut(auth);
    } catch (error: any) {
      console.error("Sign out error:", error);
      throw new Error(error.message || "Failed to sign out");
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
    } catch (error: any) {
      console.error("Update profile error:", error);
      throw new Error(error.message || "Failed to update profile");
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
