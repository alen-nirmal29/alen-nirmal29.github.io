import { apiRequest } from '../lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://atb-tracker.onrender.com/api"

export async function fetchProjects() {
  const res = await apiRequest(`${API_BASE}/projects/`)
  const contentType = res.headers.get("content-type")
  if (!res.ok) throw new Error("Failed to fetch projects")
  if (contentType && contentType.includes("application/json")) {
    return res.json()
  } else {
    throw new Error("Backend did not return JSON")
  }
}

export async function createProject(data: { name: string; client?: string }) {
  const res = await apiRequest(`${API_BASE}/projects/`, {
    method: "POST",
    body: JSON.stringify({
      name: data.name,
      client_name: data.client || "",
      status: "Planning",
      progress: 0,
    }),
  })
  const contentType = res.headers.get("content-type")
  if (!res.ok) throw new Error("Failed to create project")
  if (contentType && contentType.includes("application/json")) {
    return res.json()
  } else {
    throw new Error("Backend did not return JSON")
  }
}

export async function updateProject(projectId: number, data: Partial<{ status: string; progress: number }>) {
  const res = await apiRequest(`${API_BASE}/projects/${projectId}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
  const contentType = res.headers.get("content-type")
  if (!res.ok) throw new Error("Failed to update project")
  if (contentType && contentType.includes("application/json")) {
    return res.json()
  } else {
    throw new Error("Backend did not return JSON")
  }
}

export async function deleteProject(projectId: number) {
  const res = await apiRequest(`${API_BASE}/projects/${projectId}/`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Failed to delete project")
}

export async function fetchCompletedTaskCount(params?: { project?: number; start?: string; end?: string }) {
  const url = new URL(`${API_BASE}/projects/tasks/completed-count/`)
  if (params) {
    if (params.project) url.searchParams.append('project', String(params.project))
    if (params.start) url.searchParams.append('start', params.start)
    if (params.end) url.searchParams.append('end', params.end)
  }
  const res = await apiRequest(url.toString())
  if (!res.ok) throw new Error('Failed to fetch completed task count')
  const data = await res.json()
  return data.completed_tasks
}

export async function fetchCompletedProjectCount(params?: { start?: string; end?: string }) {
  const url = new URL(`${API_BASE}/projects/completed-count/`)
  if (params) {
    if (params.start) url.searchParams.append('start', params.start)
    if (params.end) url.searchParams.append('end', params.end)
  }
  const res = await apiRequest(url.toString())
  if (!res.ok) throw new Error('Failed to fetch completed project count')
  const data = await res.json()
  return data.completed_projects
}

// TASKS API
export async function createTask(data: { title: string; project: number; status?: string; assigned_to?: string }) {
  const res = await apiRequest(`${API_BASE}/projects/tasks/`, {
    method: "POST",
    body: JSON.stringify({
      title: data.title,
      project: data.project,
      status: data.status || "Pending",
      assigned_to: data.assigned_to || "",
    }),
  });
  const contentType = res.headers.get("content-type");
  if (!res.ok) throw new Error("Failed to create task");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  } else {
    throw new Error("Backend did not return JSON");
  }
}

export async function updateTask(taskId: number, data: Partial<{ title: string; status: string; assigned_to: string }>) {
  const res = await apiRequest(`${API_BASE}/projects/tasks/${taskId}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  const contentType = res.headers.get("content-type");
  if (!res.ok) throw new Error("Failed to update task");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  } else {
    throw new Error("Backend did not return JSON");
  }
}

export async function deleteTask(taskId: number) {
  const res = await apiRequest(`${API_BASE}/projects/tasks/${taskId}/`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete task");
}

