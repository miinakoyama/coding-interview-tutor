import { SupportedLanguage } from './interview-flow';

// Storage keys
const STORAGE_KEYS = {
  SETTINGS: 'coding-tutor-settings',
  RECENT_PROBLEMS: 'coding-tutor-recent-problems',
  FEEDBACK: 'coding-tutor-feedback',
} as const;

// Types
export interface UserSettings {
  defaultLanguage: SupportedLanguage;
  voiceEnabled: boolean;
  autoSpeakResponses: boolean;
}

export interface RecentProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  lastAccessedAt: number;
  completedSteps: string[];
}

export interface FeedbackEntry {
  problemId: string;
  rating: number;
  comment: string;
  timestamp: number;
}

// Default values
export const DEFAULT_SETTINGS: UserSettings = {
  defaultLanguage: 'python',
  voiceEnabled: true,
  autoSpeakResponses: false,
};

// Storage utilities
export const storage = {
  // Settings
  getSettings(): UserSettings {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!stored) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: Partial<UserSettings>): void {
    if (typeof window === 'undefined') return;
    try {
      const current = this.getSettings();
      localStorage.setItem(
        STORAGE_KEYS.SETTINGS,
        JSON.stringify({ ...current, ...settings })
      );
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  },

  // Recent problems
  getRecentProblems(): RecentProblem[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RECENT_PROBLEMS);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch {
      return [];
    }
  },

  addRecentProblem(problem: Omit<RecentProblem, 'lastAccessedAt' | 'completedSteps'>): void {
    if (typeof window === 'undefined') return;
    try {
      const problems = this.getRecentProblems();
      const existingIndex = problems.findIndex(p => p.id === problem.id);
      
      const newProblem: RecentProblem = {
        ...problem,
        lastAccessedAt: Date.now(),
        completedSteps: existingIndex >= 0 ? problems[existingIndex].completedSteps : [],
      };

      if (existingIndex >= 0) {
        problems.splice(existingIndex, 1);
      }
      
      problems.unshift(newProblem);
      
      // Keep only the 10 most recent
      const trimmed = problems.slice(0, 10);
      localStorage.setItem(STORAGE_KEYS.RECENT_PROBLEMS, JSON.stringify(trimmed));
    } catch (e) {
      console.error('Failed to save recent problem:', e);
    }
  },

  updateProblemProgress(problemId: string, completedStep: string): void {
    if (typeof window === 'undefined') return;
    try {
      const problems = this.getRecentProblems();
      const problem = problems.find(p => p.id === problemId);
      
      if (problem && !problem.completedSteps.includes(completedStep)) {
        problem.completedSteps.push(completedStep);
        problem.lastAccessedAt = Date.now();
        localStorage.setItem(STORAGE_KEYS.RECENT_PROBLEMS, JSON.stringify(problems));
      }
    } catch (e) {
      console.error('Failed to update problem progress:', e);
    }
  },

  // Feedback
  saveFeedback(feedback: Omit<FeedbackEntry, 'timestamp'>): void {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FEEDBACK);
      const feedbackList: FeedbackEntry[] = stored ? JSON.parse(stored) : [];
      
      feedbackList.push({
        ...feedback,
        timestamp: Date.now(),
      });
      
      localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(feedbackList));
    } catch (e) {
      console.error('Failed to save feedback:', e);
    }
  },
};

