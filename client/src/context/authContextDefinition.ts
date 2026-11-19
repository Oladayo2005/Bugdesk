import { createContext } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
  isActive: boolean;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  updateUser: (updatedUser: Partial<User>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export default AuthContext;