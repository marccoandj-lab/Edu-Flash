
export type UserPlan = 'freemium' | 'pro';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  plan: UserPlan;
  api_calls_limit: number;
  api_calls_used: number;
  api_calls_left: number;
  api_calls_total_used: number;
  streak: number;
  last_activity_date: string | null;
  last_reset_date: string | null;
  created_at: string;
  wins: number;
  games_played: number;
  total_capital: number;
  character_usage: Record<string, any>;
}

export interface Flashcard {
  id: string;
  uid: string;
  question: string;
  answer: string;
  category: string;
  type: 'qa' | 'mcq' | 'tf';
  next_review: string;
  interval_days: number;
  ease_factor: number;
  correct_count: number;
  wrong_count: number;
  created_at: string;
}

export interface Scan {
  id: string;
  uid: string;
  imageUrl: string;
  status: 'processing' | 'completed' | 'failed';
  createdAt: string;
}

export interface AIAnalysis {
  id: string;
  uid: string;
  mode: 'summarize' | 'expand';
  content: string;
  originalFileName?: string;
  category: string;
  mastered?: boolean;
  createdAt: string;
}

export interface QuizQuestion {
    id: string;
    question: string;
    options?: string[];
    correctAnswer: string;
    type: 'mcq' | 'tf';
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

export interface VideoAnalysis {
    summary: string;
    key_points: string[];
    flashcards: Array<{ question: string; answer: string }>;
    topics: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
}
