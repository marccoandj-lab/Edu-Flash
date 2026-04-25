import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  User
} from "firebase/auth";
import { auth, isConfigValid } from "../config/firebase";
import { userService } from "./userService";

export const authService = {
  // Sign up with email/password
  signUp: async (email: string, pass: string): Promise<User> => {
    if (!isConfigValid) throw new Error("Firebase is not configured.");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      await sendEmailVerification(userCredential.user);
      await userService.ensureProfile(userCredential.user.uid, email);
      return userCredential.user;
    } catch (err: any) {
      throw new Error(err.message);
    }
  },

  // Login with email/password
  login: async (email: string, pass: string): Promise<User> => {
    if (!isConfigValid) throw new Error("Firebase is not configured.");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      if (!userCredential.user.emailVerified) {
        throw new Error("Molimo verifikujte vaš email pre logovanja. Proverite inbox.");
      }
      await userService.ensureProfile(userCredential.user.uid, email);
      return userCredential.user;
    } catch (err: any) {
      throw new Error(err.message);
    }
  },

  // Google Login
  loginWithGoogle: async (): Promise<User> => {
    if (!isConfigValid) throw new Error("Firebase is not configured.");
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      await userService.ensureProfile(userCredential.user.uid, userCredential.user.email || "");
      return userCredential.user;
    } catch (err: any) {
      throw new Error(err.message);
    }
  },

  // Logout
  logout: async () => {
    if (!isConfigValid) return;
    return signOut(auth);
  },

  // State listener
  onAuthChange: (callback: (user: User | null) => void) => {
    if (!isConfigValid) return () => {};
    return onAuthStateChanged(auth, callback);
  }
};
