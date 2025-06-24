import { apiRequest, API_BASE } from '../lib/auth';

const TIME_ENTRIES_ENDPOINT = `${API_BASE}/projects/time-entries/`;

export interface TimeEntry {
  id?: number;
  project: number;
  description: string;
  start_time: string; // "HH:MM:SS"
  end_time: string;   // "HH:MM:SS"
  duration: number;   // in minutes
  date: string;       // "YYYY-MM-DD"
  billable: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function fetchTimeEntries(): Promise<TimeEntry[]> {
  const res = await apiRequest(TIME_ENTRIES_ENDPOINT);
  if (!res.ok) throw new Error("Failed to fetch time entries");
  return res.json();
}

export async function createTimeEntry(entry: Omit<TimeEntry, "id" | "created_at" | "updated_at">): Promise<TimeEntry> {
  try {
    const res = await apiRequest(TIME_ENTRIES_ENDPOINT, {
      method: "POST",
      body: JSON.stringify(entry),
    });
    if (!res.ok) {
      let errorMsg = "Failed to create time entry";
      try {
        const errorData = await res.json();
        errorMsg += ": " + (errorData.detail || JSON.stringify(errorData));
      } catch {}
      throw new Error(errorMsg);
    }
    return res.json();
  } catch (err) {
    throw new Error("Network or server error while creating time entry: " + (err instanceof Error ? err.message : String(err)));
  }
}

export async function updateTimeEntry(id: number, entry: Partial<Omit<TimeEntry, "id" | "created_at" | "updated_at">>): Promise<TimeEntry> {
  const res = await apiRequest(`${API_BASE}/projects/time-entries/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(entry),
  });
  if (!res.ok) throw new Error("Failed to update time entry");
  return res.json();
}

export async function deleteTimeEntry(id: number): Promise<void> {
  const res = await apiRequest(`${API_BASE}/projects/time-entries/${id}/`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Failed to delete time entry");
}
