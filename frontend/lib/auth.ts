import { User } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000/api";

export interface AuthTokens {
  access: string;
  refresh: string;
}

export const auth = {
  // Get stored tokens
  getTokens(): AuthTokens | null {
    if (typeof window === 'undefined') return null;
    const access = localStorage.getItem('authToken');
    const refresh = localStorage.getItem('refreshToken');
    if (access && refresh) {
      return { access, refresh };
    }
    return null;
  },

  // Set tokens in localStorage
  setTokens(tokens: AuthTokens): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('authToken', tokens.access);
    localStorage.setItem('refreshToken', tokens.refresh);
  },

  // Clear tokens
  clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  },

  // Get stored user
  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Set user in localStorage
  setUser(user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Clear user
  clearUser(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('user');
  },

  // Login user
  async login(credentials: { email: string; password: string }): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await fetch(`${API_BASE}/users/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    const { tokens, user } = data;
    
    this.setTokens(tokens);
    this.setUser(user);
    
    return { user, tokens };
  },

  // Register new user
  async register(userData: { name: string; email: string; password: string }): Promise<{ user: User; tokens: AuthTokens }> {
    const nameParts = userData.name.trim().split(' ');
    const first_name = nameParts[0];
    const last_name = nameParts.slice(1).join(' ');
    
    const response = await fetch(`${API_BASE}/users/members/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name,
        last_name,
        email: userData.email,
        password: userData.password
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || error.detail || 'Registration failed');
    }

    const data = await response.json();
    const { tokens, member } = data;
    
    this.setTokens(tokens);
    this.setUser(member);
    
    return { user: member, tokens };
  },

  // Logout user
  logout(): void {
    this.clearTokens();
    this.clearUser();
    localStorage.removeItem('isAuthenticated');
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    const tokens = this.getTokens();
    const user = this.getUser();
    return !!(tokens && user && localStorage.getItem('isAuthenticated') === 'true');
  },

  // Get authorization header for API requests
  getAuthHeader(): { Authorization: string } | {} {
    const tokens = this.getTokens();
    if (tokens?.access) {
      return { Authorization: `Bearer ${tokens.access}` };
    }
    return {};
  },

  // Refresh token
  async refreshToken(): Promise<AuthTokens | null> {
    const tokens = this.getTokens();
    if (!tokens?.refresh) return null;

    try {
      const response = await fetch(`${API_BASE}/users/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: tokens.refresh }),
      });

      if (response.ok) {
        const newTokens = await response.json();
        this.setTokens(newTokens);
        return newTokens;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    // If refresh fails, logout user
    this.logout();
    return null;
  }
};

// API request wrapper with automatic token handling
export async function apiRequest(url: string, options: RequestInit = {}): Promise<Response> {
  const authHeader = auth.getAuthHeader();
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
      ...options.headers,
    },
  };

  let response = await fetch(url, config);

  // If unauthorized, try to refresh token and retry once
  if (response.status === 401) {
    try {
      await auth.refreshToken();
      const newAuthHeader = auth.getAuthHeader();
      config.headers = {
        ...config.headers,
        ...newAuthHeader,
      };
      response = await fetch(url, config);
    } catch (error) {
      // If refresh fails, redirect to login
      auth.logout();
      window.location.href = '/login';
      throw new Error('Authentication failed');
    }
  }

  return response;
} 