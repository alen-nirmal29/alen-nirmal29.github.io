import { apiRequest, API_BASE } from '../lib/auth';

const POMODORO_ENDPOINT = `${API_BASE}/pomodoros/`;

export interface PomodoroSession {
  id?: number;
  start_time: string; // ISO string
  end_time: string;   // ISO string
  duration: number;   // in minutes
  break_duration?: number;
  cycles?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export async function createPomodoroSession(session: Omit<PomodoroSession, "id" | "created_at" | "updated_at">): Promise<PomodoroSession> {
  const res = await apiRequest(POMODORO_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(session),
  });
  if (!res.ok) throw new Error("Failed to create pomodoro session");
  return res.json();
}

export async function fetchPomodoroSessions(): Promise<PomodoroSession[]> {
  const res = await apiRequest(POMODORO_ENDPOINT);
  if (!res.ok) throw new Error("Failed to fetch pomodoro sessions");
  return res.json();
} 