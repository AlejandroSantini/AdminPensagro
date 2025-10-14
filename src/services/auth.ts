import api from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}


export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  status?: string;
  created_at?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface ApiResponse<T> {
  status: boolean;
  data: T;
  message?: string;
}

class Auth {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('api/users/login', credentials);
      if (response.data.status) {
        const authData = response.data.data;
        // Guarda usuario y token por separado
        localStorage.setItem('user', JSON.stringify(authData.user));
        localStorage.setItem('token', authData.token);
        return authData;
      } else {
        throw new Error(response.data.message || 'Error en el login');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error de conexión');
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.warn('Error al hacer logout en el servidor:', error);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }

  getCurrentUser(): AuthResponse | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    return !!user && !!user.token;
  }
}

export default new Auth();