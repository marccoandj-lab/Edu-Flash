import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../config/firebase";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  plan: 'freemium' | 'pro';
  solvesRemaining: number;
  lastReset: any;
}

const FREE_DAILY_LIMIT = 5;
const PRO_DAILY_LIMIT = 1000;

export const userService = {
  // Create or get user profile
  ensureProfile: async (uid: string, email: string, displayName?: string | null): Promise<UserProfile> => {
    const userRef = doc(db, "users", uid);
    try {
      const snap = await getDoc(userRef);
      
      // Ako ne postoji ime, izvuci iz mejla (npr marko.p@gmail.com -> Marko P)
      const fallbackName = email.split('@')[0].split(/[._-]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
      const finalName = displayName || fallbackName || "Student";

      if (!snap.exists()) {
        const newProfile: UserProfile = {
          uid,
          email,
          displayName: finalName,
          plan: 'freemium',
          solvesRemaining: FREE_DAILY_LIMIT,
          lastReset: serverTimestamp()
        };
        await setDoc(userRef, newProfile);
        return newProfile;
      }
      
      return snap.data() as UserProfile;
    } catch (err: any) {
      console.error("Firestore Error in ensureProfile:", err);
      return {
        uid,
        email,
        displayName: displayName || "Student",
        plan: 'freemium',
        solvesRemaining: 5,
        lastReset: new Date()
      };
    }
  },

  // Check and decrement quota
  useQuota: async (uid: string): Promise<boolean> => {
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);
    
    if (!snap.exists()) return false;
    
    const data = snap.data() as UserProfile;
    
    // Simple daily reset logic (could be more robust with actual timestamp check)
    // For now, if solvesRemaining > 0, allow and decrement
    if (data.solvesRemaining > 0) {
      await updateDoc(userRef, {
        solvesRemaining: increment(-1)
      });
      return true;
    }
    
    return false;
  },

  // Upgrade user
  upgradeToPro: async (uid: string) => {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      plan: 'pro',
      solvesRemaining: PRO_DAILY_LIMIT
    });
  }
};
