import { useState, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext, type User, type AuthContextType } from "../context/AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Login simulado: solo guarda un token dummy
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // TODO: Reemplazar por llamada real a la API cuando esté disponible
    await new Promise(resolve => setTimeout(resolve, 500));
    localStorage.setItem("token", "dummy-token");
    // setUser(...) // Cuando tengas el backend, setea el usuario real aquí
    setIsLoading(false);
    // Redirigir usando navigate (solo para desarrollo)
    navigate("/dashboard");
  };

  // Register simulado: solo guarda un token dummy
  const register = async (userData: { name: string; email: string; phone: string; password: string }) => {
    setIsLoading(true);
    // TODO: Reemplazar por llamada real a la API cuando esté disponible
    await new Promise(resolve => setTimeout(resolve, 500));
    localStorage.setItem("token", "dummy-token");
    // setUser(...) // Cuando tengas el backend, setea el usuario real aquí
    setIsLoading(false);
  };

  const logout = async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    // Limpiar solo el token (y usuario si lo usas)
    localStorage.removeItem("token");
    // localStorage.removeItem("authUser");
    setUser(null);
  };

  useEffect(() => {
    // TEMPORAL: acceso directo al dashboard en desarrollo
    let token = localStorage.getItem("token");
    if (!token) {
      localStorage.setItem("token", "dummy-token");
      token = "dummy-token";
    }
    // Cuando tengas el backend, aquí deberías validar el token y setear el usuario real
    // setUser(...)
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}