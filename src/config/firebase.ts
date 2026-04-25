import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const isConfigValid = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "your_api_key_here";

let app;
if (isConfigValid) {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} else {
    app = { options: {}, name: "[DEFAULT]" } as any;
    console.warn("Edu-Flash: Firebase ključevi nisu pronađeni. Aplikacija radi u MOCK modu.");
}

export const auth = isConfigValid ? getAuth(app) : ({} as any);
export const db = isConfigValid ? initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
}) : ({} as any);
export const storage = isConfigValid ? getStorage(app) : ({} as any);
export { isConfigValid };
