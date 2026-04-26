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
  tokensRemaining?: number;
  streak?: number;
  lastReset: any;
}

const FREE_DAILY_LIMIT = 5;
const PRO_DAILY_LIMIT = 1000;
const FREE_MONTHLY_TOKENS = 250000;
const PRO_MONTHLY_TOKENS = 2500000;

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
          tokensRemaining: FREE_MONTHLY_TOKENS,
          lastReset: serverTimestamp()
        };
        await setDoc(userRef, newProfile);
        return newProfile;
      }
      
      const data = snap.data() as UserProfile;
      
      // Automatska migracija postojećih korisnika na token sistem
      if (data.tokensRemaining === undefined) {
         const initialTokens = data.plan === 'pro' ? PRO_MONTHLY_TOKENS : FREE_MONTHLY_TOKENS;
         await updateDoc(userRef, { tokensRemaining: initialTokens });
         data.tokensRemaining = initialTokens;
      }
      
      return data;
    } catch (err: any) {
      console.error("Firestore Error in ensureProfile:", err);
      return {
        uid,
        email,
        displayName: displayName || "Student",
        plan: 'freemium',
        solvesRemaining: 5,
        tokensRemaining: FREE_MONTHLY_TOKENS,
        lastReset: new Date()
      };
    }
  },

  // Check if has tokens
  hasTokens: async (uid: string): Promise<boolean> => {
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return false;
    
    const data = snap.data() as UserProfile;
    if (data.tokensRemaining === undefined) return true; // Ako još nije migriran
    
    return data.tokensRemaining > 0;
  },

  // Deduct actual tokens used
  deductTokens: async (uid: string, amount: number): Promise<void> => {
    if (!amount || amount <= 0) return;
    const userRef = doc(db, "users", uid);
    try {
      await updateDoc(userRef, {
        tokensRemaining: increment(-amount)
      });
    } catch (err) {
      console.error("Error deducting tokens:", err);
    }
  },

  // Upgrade user
  upgradeToPro: async (uid: string) => {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      plan: 'pro',
      solvesRemaining: PRO_DAILY_LIMIT,
      tokensRemaining: PRO_MONTHLY_TOKENS
    });
  }
};
