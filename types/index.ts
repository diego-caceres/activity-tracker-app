export type TodoStatus = 'pending' | 'done';

export interface Todo {
  id: string;
  title: string;
  status: TodoStatus;
  date: string; // YYYY-MM-DD
  isRecurring: boolean;
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
