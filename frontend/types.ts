// Remove TeamMember and TeamGroup interfaces if not used elsewhere

export interface User {
  id: number;
  name: string;
  email: string;
  picture?: string;
  provider: string;
  email_verified: boolean;
  created_at?: string;
  firebase_uid?: string;
}

export interface Client {
  id: number | string;
  name: string;
  email?: string;
  address?: string;
  note?: string;
  currency?: string;
}

export interface Project {
  id: number;
  name: string;
  client: string; // For frontend consistency, always treat as a string.
  description: string;
  status: string;
  progress: number;
  template: string;
  createdDate: string;
  deadline: string;
  isBillable: boolean;
  billableRate: number;
  totalHours: number;
  billableHours: number;
  totalCost: number;
  recentActivity?: any[];
  team?: any[]; // Add the missing team property
  updated_at?: string; // Add the missing updated_at property
}
