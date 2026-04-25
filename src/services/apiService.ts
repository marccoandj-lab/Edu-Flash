
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  increment,
  Timestamp,
  addDoc
} from "firebase/firestore";
import { db, isConfigValid } from "../config/firebase";
import { User, Flashcard, AIAnalysis, ChatMessage, VideoAnalysis } from "../types";
import { 
    generateFlashcardsWithGroq, 
    generateFlashcardsFromText, 
    analyzeContent, 
    askTutor, 
    generateQuizFromContent, 
    solveProblem, 
    analyzeYouTubeVideo 
} from "./aiService";

const updateStreakLogic = (user: User): Partial<User> => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    if (!user.last_activity_date) return { streak: 1, last_activity_date: todayStr };
    const lastDateStr = user.last_activity_date.split('T')[0];
    if (lastDateStr === todayStr) return {};
    const lastDate = new Date(lastDateStr);
    const diffDays = Math.floor(Math.abs(now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return { streak: (user.streak || 0) + 1, last_activity_date: todayStr };
    return { streak: 1, last_activity_date: todayStr };
};

export const apiService = {
  getUser: async (uid: string): Promise<User | null> => {
    if (!isConfigValid) {
        const local = localStorage.getItem('edu_user');
        if (!local) {
            const defaultUser: User = {
                uid: 'user123', email: 'student@example.com', displayName: 'Marko P.',
                plan: 'pro', api_calls_limit: 500, api_calls_used: 0, api_calls_left: 500,
                api_calls_total_used: 0, streak: 0, last_activity_date: null,
                last_reset_date: new Date().toISOString(), created_at: new Date().toISOString(),
                wins: 0, games_played: 0, total_capital: 0, character_usage: {}
            };
            localStorage.setItem('edu_user', JSON.stringify(defaultUser));
            return defaultUser;
        }
        return JSON.parse(local);
    }
    try {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        return userSnap.exists() ? userSnap.data() as User : null;
    } catch (e) { return null; }
  },

  getFlashcards: async (uid: string): Promise<Flashcard[]> => {
    if (!isConfigValid) {
        const local = localStorage.getItem('edu_cards');
        return local ? JSON.parse(local) : [];
    }
    try {
        const q = query(collection(db, "flashcards"), where("uid", "==", uid));
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Flashcard[];
    } catch (e) { return []; }
  },

  createFlashcards: async (uid: string, data: { imageBase64?: string, text?: string }): Promise<number> => {
    const user = await apiService.getUser(uid);
    if (!user || user.api_calls_used >= user.api_calls_limit) throw new Error("Quota exceeded.");

    let aiResult;
    try {
        if (data.imageBase64) aiResult = await generateFlashcardsWithGroq(data.imageBase64);
        else if (data.text) aiResult = await generateFlashcardsFromText(data.text);
        else return 0;
    } catch (err) { return 0; }

    let generatedPairs = aiResult.flashcards;
    const category = aiResult.category;

    if (generatedPairs.length === 0) return 0;
    if (user.plan === 'freemium' && generatedPairs.length > 10) generatedPairs = generatedPairs.slice(0, 10);

    const streakUpdates = updateStreakLogic(user);

    if (!isConfigValid) {
        const currentCards = JSON.parse(localStorage.getItem('edu_cards') || '[]');
        const newCards = generatedPairs.map(p => ({
            id: Math.random().toString(36).substr(2, 9),
            uid, question: p.question, answer: p.answer, category,
            type: 'qa', next_review: new Date().toISOString(),
            correct_count: 0, wrong_count: 0, ease_factor: 2.5, interval_days: 0,
            created_at: new Date().toISOString()
        }));
        localStorage.setItem('edu_cards', JSON.stringify([...currentCards, ...newCards]));
        localStorage.setItem('edu_user', JSON.stringify({ ...user, ...streakUpdates, api_calls_used: user.api_calls_used + 1, api_calls_left: user.api_calls_limit - (user.api_calls_used + 1), api_calls_total_used: user.api_calls_total_used + 1 }));
    } else {
        await updateDoc(doc(db, "users", uid), { ...streakUpdates, api_calls_used: increment(1), api_calls_total_used: increment(1) });
        for (const pair of generatedPairs) {
            await addDoc(collection(db, "flashcards"), { uid, question: pair.question, answer: pair.answer, category, next_review: Timestamp.now(), created_at: Timestamp.now(), correct_count: 0, wrong_count: 0, ease_factor: 2.5, interval_days: 0 });
        }
    }
    return generatedPairs.length;
  },

  performAnalysis: async (uid: string, mode: 'summarize' | 'expand', data: { imageBase64?: string, text?: string }, fileName?: string): Promise<string> => {
    const user = await apiService.getUser(uid);
    if (!user || user.api_calls_used >= user.api_calls_limit) throw new Error("Quota exceeded.");

    const aiResult = await analyzeContent(mode, data);
    const streakUpdates = updateStreakLogic(user);

    const newAnalysis: Omit<AIAnalysis, 'id'> = {
        uid, mode, content: aiResult.content, category: aiResult.category,
        originalFileName: fileName || (data.imageBase64 ? "Image Scan" : "Text Document"),
        createdAt: new Date().toISOString()
    };

    if (!isConfigValid) {
        const current = JSON.parse(localStorage.getItem('edu_analyses') || '[]');
        localStorage.setItem('edu_analyses', JSON.stringify([...current, { ...newAnalysis, id: Math.random().toString(36).substr(2, 9) }]));
        localStorage.setItem('edu_user', JSON.stringify({ ...user, ...streakUpdates, api_calls_used: user.api_calls_used + 1, api_calls_left: user.api_calls_limit - (user.api_calls_used + 1), api_calls_total_used: user.api_calls_total_used + 1 }));
    } else {
        await updateDoc(doc(db, "users", uid), { ...streakUpdates, api_calls_used: increment(1), api_calls_total_used: increment(1) });
        await addDoc(collection(db, "analyses"), newAnalysis);
    }
    return aiResult.content;
  },

  getAnalyses: async (uid: string): Promise<AIAnalysis[]> => {
    if (!isConfigValid) return JSON.parse(localStorage.getItem('edu_analyses') || '[]');
    try {
        const q = query(collection(db, "analyses"), where("uid", "==", uid));
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AIAnalysis[];
    } catch (e) { return []; }
  },

  deleteFlashcard: async (id: string): Promise<void> => {
    if (!isConfigValid) {
        const items = JSON.parse(localStorage.getItem('edu_cards') || '[]');
        localStorage.setItem('edu_cards', JSON.stringify(items.filter((i: any) => i.id !== id)));
    }
  },

  deleteAnalysis: async (id: string): Promise<void> => {
    if (!isConfigValid) {
        const items = JSON.parse(localStorage.getItem('edu_analyses') || '[]');
        localStorage.setItem('edu_analyses', JSON.stringify(items.filter((i: any) => i.id !== id)));
    }
  },

  updateFlashcard: async (id: string, updates: Partial<Flashcard>): Promise<void> => {
    if (!isConfigValid) {
        const items = JSON.parse(localStorage.getItem('edu_cards') || '[]');
        const idx = items.findIndex((i: any) => i.id === id);
        if (idx !== -1) { items[idx] = { ...items[idx], ...updates }; localStorage.setItem('edu_cards', JSON.stringify(items)); }
    } else { await updateDoc(doc(db, "flashcards", id), updates); }
  },

  updateAnalysis: async (id: string, updates: Partial<AIAnalysis>): Promise<void> => {
    if (!isConfigValid) {
        const items = JSON.parse(localStorage.getItem('edu_analyses') || '[]');
        const idx = items.findIndex((i: any) => i.id === id);
        if (idx !== -1) { items[idx] = { ...items[idx], ...updates }; localStorage.setItem('edu_analyses', JSON.stringify(items)); }
    }
  },

  chatWithTutor: async (uid: string, question: string, context: string, history: ChatMessage[]): Promise<string> => {
    const user = await apiService.getUser(uid);
    if (!user || user.api_calls_left <= 0) throw new Error("Quota exceeded.");
    const response = await askTutor(question, context, history);
    const streakUpdates = updateStreakLogic(user);
    if (!isConfigValid) { localStorage.setItem('edu_user', JSON.stringify({ ...user, ...streakUpdates, api_calls_left: user.api_calls_left - 1, api_calls_used: user.api_calls_used + 1 })); }
    else { await updateDoc(doc(db, "users", uid), { ...streakUpdates, api_calls_used: increment(1) }); }
    return response;
  },

  startQuiz: async (uid: string, text: string): Promise<any[]> => {
    const user = await apiService.getUser(uid);
    if (!user || user.api_calls_left <= 0) throw new Error("Quota exceeded.");
    const quiz = await generateQuizFromContent(text);
    const streakUpdates = updateStreakLogic(user);
    if (!isConfigValid) { localStorage.setItem('edu_user', JSON.stringify({ ...user, ...streakUpdates, api_calls_left: user.api_calls_left - 1, api_calls_used: user.api_calls_used + 1 })); }
    else { await updateDoc(doc(db, "users", uid), { ...streakUpdates, api_calls_used: increment(1) }); }
    return quiz;
  },

  solveProblemWithAI: async (uid: string, problem: string, imageBase64?: string): Promise<string> => {
    const user = await apiService.getUser(uid);
    if (!user || user.api_calls_left <= 0) throw new Error("Quota exceeded.");
    const solution = await solveProblem(problem, imageBase64);
    const streakUpdates = updateStreakLogic(user);
    if (!isConfigValid) { localStorage.setItem('edu_user', JSON.stringify({ ...user, ...streakUpdates, api_calls_left: user.api_calls_left - 1, api_calls_used: user.api_calls_used + 1 })); }
    else { await updateDoc(doc(db, "users", uid), { ...streakUpdates, api_calls_used: increment(1) }); }
    return solution;
  },

  processVideoWithAI: async (uid: string, url: string): Promise<VideoAnalysis> => {
    const user = await apiService.getUser(uid);
    if (!user || user.api_calls_left <= 0) throw new Error("Quota exceeded.");
    const result = await analyzeYouTubeVideo(url);
    const streakUpdates = updateStreakLogic(user);
    if (!isConfigValid) { localStorage.setItem('edu_user', JSON.stringify({ ...user, ...streakUpdates, api_calls_left: user.api_calls_left - 1, api_calls_used: user.api_calls_used + 1 })); }
    else { await updateDoc(doc(db, "users", uid), { ...streakUpdates, api_calls_used: increment(1) }); }
    return result;
  },

  requestNotificationPermission: async () => {
      if ("Notification" in window) return (await Notification.requestPermission()) === "granted";
      return false;
  }
};
