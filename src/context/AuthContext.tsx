import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User as FirebaseUser } from "firebase/auth";
import { User } from "../types";
import { AuthService } from "../services/authService";

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    name: string,
    phone: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged(async (firebaseUser) => {
      console.log(
        "Auth state changed:",
        firebaseUser ? "User logged in" : "User logged out"
      );

      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userData = await AuthService.getCurrentUserData();
          setUser(userData);

          // Update online status
          await AuthService.updateUserStatus(firebaseUser.uid, true);
        } catch (error) {
          console.error("Error loading user data:", error);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const userData = await AuthService.signInWithEmail(email, password);
      setUser(userData);
      console.log("Sign in successful:", userData.name);
    } catch (error: any) {
      console.error("Sign in error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    phone: string
  ) => {
    try {
      setLoading(true);
      const userData = await AuthService.signUpWithEmail(
        email,
        password,
        name,
        phone
      );
      setUser(userData);
      console.log("Sign up successful:", userData.name);
    } catch (error: any) {
      console.error("Sign up error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await AuthService.signOut();
      setUser(null);
      setFirebaseUser(null);
      console.log("Sign out successful");
    } catch (error: any) {
      console.error("Sign out error:", error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (user) {
        await AuthService.updateUserProfile(user.id, updates);
        setUser({ ...user, ...updates });
      }
    } catch (error: any) {
      console.error("Update profile error:", error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
