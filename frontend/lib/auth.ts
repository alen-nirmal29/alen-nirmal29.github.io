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
    console.log('AuthLib: getTokens() called. Access token found:', !!access, 'Refresh token found:', !!refresh);
    if (access && refresh) {
      return { access, refresh };
    }
    return null;
  },

  // Set tokens in localStorage
  setTokens(tokens: AuthTokens): void {
    if (typeof window === 'undefined') return;
    console.log('Setting tokens in storage:', { access: tokens.access ? 'present' : 'missing', refresh: tokens.refresh ? 'present' : 'missing' });
    localStorage.setItem('authToken', tokens.access);
    localStorage.setItem('refreshToken', tokens.refresh);
    localStorage.setItem('isAuthenticated', 'true');
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
    localStorage.setItem('isAuthenticated', 'true');
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
    localStorage.setItem('isAuthenticated', 'true');
    
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
    localStorage.setItem('isAuthenticated', 'true');
    
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
      const authHeader = { Authorization: `Bearer ${tokens.access}` };
      console.log('AuthLib: Created auth header:', authHeader);
      return authHeader;
    }
    console.log('AuthLib: Could not create auth header, no access token found.');
    return {};
  },

  // Refresh token
  async refreshToken(): Promise<AuthTokens | null> {
    const tokens = this.getTokens();
    if (!tokens?.refresh) {
      console.log('No refresh token available');
      return null;
    }

    try {
      console.log('Attempting token refresh...');
      const response = await fetch(`${API_BASE}/users/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: tokens.refresh }),
      });

      console.log('Token refresh response status:', response.status);

      if (response.ok) {
        const newTokens = await response.json();
        console.log('Token refresh successful');
        this.setTokens(newTokens);
        return newTokens;
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Token refresh failed:', errorData);
      }
    } catch (error) {
      console.error('Token refresh error:', error);
    }

    // If refresh fails, logout user
    console.log('Token refresh failed, logging out user');
    this.logout();
    return null;
  }
};

// API request wrapper with automatic token handling
export async function apiRequest(url: string, options: RequestInit = {}): Promise<Response> {
  // Get the auth token.
  const authHeader = auth.getAuthHeader();

  // Create a new Headers object.
  const headers = new Headers(options.headers);

  // Set the Authorization header if a token exists.
  if ('Authorization' in authHeader) {
    headers.set('Authorization', (authHeader as { Authorization: string }).Authorization);
  }

  // Set Content-Type for JSON, but don't override it if it's already set 
  // (e.g., for file uploads).
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  console.log(`Making API request to ${url} with method ${config.method || 'GET'}`);

  let response = await fetch(url, config);

  console.log(`Response from ${url}: ${response.status}`);

  // If unauthorized, try to refresh token and retry once
  if (response.status === 401) {
    console.log('Unauthorized, attempting token refresh...');
    try {
      const newTokens = await auth.refreshToken();
      if (newTokens) {
        const newAuthHeader = auth.getAuthHeader();
        config.headers = {
          ...headers,
          ...newAuthHeader,
        };
        console.log('Retrying with new token...');
        response = await fetch(url, config);
        console.log('Retry response status:', response.status);
      } else {
        // If refresh fails, redirect to login
        console.log('Token refresh failed, redirecting to login...');
        auth.logout();
        window.location.href = '/login';
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, redirect to login
      auth.logout();
      window.location.href = '/login';
      throw new Error('Authentication failed');
    }
  }

  return response;
} 