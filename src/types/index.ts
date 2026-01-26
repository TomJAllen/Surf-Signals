export type StudyMode = "identify" | "perform";

export interface Signal {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string | null;
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
