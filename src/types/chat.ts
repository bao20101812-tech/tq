export type Role = 'user' | 'assistant';

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  rating?: 'like' | 'dislike';
  isStreaming?: boolean;
}

export type ResponseMode = 'precise' | 'balanced' | 'creative';

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  responseMode: ResponseMode;
  targetLanguage: string;
}

export type LanguageCode = 'vi' | 'en' | 'ja' | 'zh' | 'fr' | 'es' | 'ko' | 'de';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export interface AppSettings {
  uiLanguage: LanguageCode;
  responseLanguage: string; // 'auto' or LanguageCode
  responseMode: ResponseMode;
  customSystemInstruction: string;
  darkMode: boolean;
}

export interface UserPlan {
  tier: 'free' | 'pro_medium';
  questionsUsedToday: number;
  lastActiveDate: string; // YYYY-MM-DD
  maxDailyQuestions: number; // 20
  proExpiresAt?: number; // timestamp
  transactionId?: string;
  transactionDate?: number;
  paymentMethod?: string;
}

