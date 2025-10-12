// import { useState } from "react";
import Login from "../../components/auth/Login";

interface AuthPageProps {
  onAuthSuccess?: (data?: { email: string; password: string }) => void;
}

export default function Auth({ onAuthSuccess }: AuthPageProps) {
  const handleLogin = (email: string, password: string) => {
    if (onAuthSuccess) {
      onAuthSuccess({ email, password });
    }
  };

  return (
    <Login onLogin={handleLogin} />
  );
}