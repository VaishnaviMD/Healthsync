import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/services/api';

interface User {
  id: string;
  name: string;
  email: string;
  healthGoal?: string;
  age?: number;
  height?: number;
  weight?: number;
  bmi?: number;
  dailyCalories?: number;
  surveyCompleted?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: object) => Promise<void>;
  logout: () => void;
  updateUser: (data: object) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(localStorage.getItem('medora_token'));

  useEffect(() => {
    const token = localStorage.getItem('medora_token');
    if (token) {
      authAPI.getProfile()
        .then(res => setUser(res.data))
        .catch(() => { localStorage.removeItem('medora_token'); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authAPI.login({ email, password });
    const tokenValue = res.data.token;
    localStorage.setItem('medora_token', tokenValue);
    setToken(tokenValue);
    setUser(res.data.user);
  };

  const register = async (data: object) => {
    const res = await authAPI.register(data);
    const tokenValue = res.data.token;
    localStorage.setItem('medora_token', tokenValue);
    setToken(tokenValue);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('medora_token');
    localStorage.removeItem('medora_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = async (data: object) => {
    const res = await authAPI.updateProfile(data);
    setUser(prev => ({ ...prev!, ...res.data }));
  };

  const refreshUser = async () => {
    const res = await authAPI.getProfile();
    setUser(res.data);
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, login, register, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
