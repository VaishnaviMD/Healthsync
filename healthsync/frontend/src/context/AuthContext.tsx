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
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: object) => Promise<void>;
  logout: () => void;
  updateUser: (data: object) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(localStorage.getItem('healthsync_token'));

  useEffect(() => {
    const token = localStorage.getItem('healthsync_token');
    if (token) {
      authAPI.getProfile()
        .then(res => setUser(res.data))
        .catch(() => { localStorage.removeItem('healthsync_token'); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authAPI.login({ email, password });
    const tokenValue = res.data.token;
    localStorage.setItem('healthsync_token', tokenValue);
    setToken(tokenValue);
    setUser(res.data.user);
  };

  const register = async (data: object) => {
    const res = await authAPI.register(data);
    localStorage.setItem('healthsync_token', res.data.token);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('healthsync_token');
    localStorage.removeItem('healthsync_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = async (data: object) => {
    const res = await authAPI.updateProfile(data);
    setUser(prev => ({ ...prev!, ...res.data }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
