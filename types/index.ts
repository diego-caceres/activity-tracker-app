export type TodoStatus = 'pending' | 'done';

export interface Todo {
  id: string;
  title: string;
  status: TodoStatus;
  date: string; // YYYY-MM-DD
  createdAt: number;
}

export interface HabitDefinition {
  id: string;
  name: string;
  type: 'healthy' | 'unhealthy';
  score: number; // e.g., +1, +5, -1, -5
  icon?: string; // emoji or icon name
}

export interface HabitEvent {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
  scoreSnapshot: number; // Store score at time of event in case def changes
}

export interface DailyScore {
  date: string;
  score: number;
}

export interface DailyNote {
  date: string;
  content: string;
  updatedAt: number;
}

// --- Goals ---

export type GoalType =
  | 'daily_score'
  | 'weekly_score'
  | 'streak'
  | 'habit_count'
  | 'todo_completion'
  | 'habit_frequency';

export type GoalPeriod = 'daily' | 'weekly' | 'monthly' | 'custom';
export type GoalStatus = 'active' | 'completed' | 'archived';

export interface Goal {
  id: string;
  type: GoalType;
  title: string;
  description?: string;
  target: number;
  period: GoalPeriod;
  startDate: string;
  endDate?: string;
  habitId?: string;
  status: GoalStatus;
  createdAt: number;
  updatedAt: number;
  achievedAt?: number;
  currentProgress?: number;
}

export interface GoalProgress {
  goalId: string;
  date: string;
  progress: number;
  isAchieved: boolean;
  checkedAt: number;
}

export interface GoalAchievement {
  id: string;
  goalId: string;
  achievedDate: string;
  achievedAt: number;
  finalProgress: number;
  goalSnapshot: Goal;
}
