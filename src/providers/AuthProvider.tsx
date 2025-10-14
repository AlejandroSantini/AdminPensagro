
import { useState, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext, type User, type AuthContextType } from "../context/AuthContext";
import authService from '../services/auth';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();


  // Login real: guarda cliente y token
  // Login: solo actualiza el estado en memoria, la persistencia la maneja el servicio
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authService.login({ email, password });
      setUser(res.user);
      setToken(res.token);
      navigate("/inicio");
    } catch (err) {
      setIsLoading(false);
      console.error('Error en login:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };


  // Logout: solo limpia el estado en memoria, la persistencia la maneja el servicio
  const logout = async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
  };

  // Al montar, inicializa el estado desde localStorage solo una vez
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch {
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } else {
      setUser(null);
      setToken(null);
    }
    setIsLoading(false);
  }, []);

  const value: AuthContextType & { token: string | null } = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}