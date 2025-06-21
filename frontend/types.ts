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
