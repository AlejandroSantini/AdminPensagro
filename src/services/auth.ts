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

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  token: string;
  refreshToken?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class Auth {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/users/login', credentials);
      
      if (response.data.success) {
        const authData = response.data.data;
        localStorage.setItem('user', JSON.stringify(authData));
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

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', userData);
      
      if (response.data.success) {
        const authData = response.data.data;
        localStorage.setItem('user', JSON.stringify(authData));
        return authData;
      } else {
        throw new Error(response.data.message || 'Error en el registro');
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
    }
  }

  async verifyToken(): Promise<AuthResponse> {
    const response = await api.get<ApiResponse<AuthResponse>>('/auth/verify');
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error('Token no válido');
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/refresh');
    
    if (response.data.success) {
      const authData = response.data.data;
      localStorage.setItem('user', JSON.stringify(authData));
      return authData;
    } else {
      throw new Error('Error al refrescar token');
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