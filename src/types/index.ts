export type StudyMode = "identify" | "perform";
export type SignalCategory = "beach-to-water" | "water-to-beach";

export interface Signal {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  videoUrl?: string | null;
  category: SignalCategory;
}

export interface AttemptStats {
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
}

export interface SignalWithStats extends Signal {
  stats: AttemptStats;
}

export interface DashboardStats {
  overall: AttemptStats;
  byMode: {
    identify: AttemptStats;
    perform: AttemptStats;
  };
  recentAttempts: RecentAttempt[];
}

export interface RecentAttempt {
  id: string;
  signalName: string;
  mode: StudyMode;
  correct: boolean;
  createdAt: string;
}

export interface StudySession {
  id: string;
  mode: StudyMode;
  category: SignalCategory | null;
  totalCount: number;
  correctCount: number;
  completedAt: string | null;
  createdAt: string;
}

export interface SessionConfig {
  mode: StudyMode;
  category: SignalCategory | null;
  count: number; // 5, 10, or total signals
}
