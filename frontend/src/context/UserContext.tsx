import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@/types/user';
import type { Role } from '@/types/role';
import { getUsers, getRoles, login as apiLogin, type LoginResponse } from '@/lib/api';

interface UserContextType {
  currentUser: User | null;
  users: User[];
  roles: Role[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string) => Promise<void>;
  logout: () => void;
  getUserById: (userId: string) => User | undefined;
  getRoleById: (roleId: string) => Role | undefined;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data and check auth status
  useEffect(() => {
    const init = async () => {
      try {
        // Fetch metadata
        const [usersData, rolesData] = await Promise.all([getUsers(), getRoles()]);
        setUsers(usersData);
        setRoles(rolesData);

        // Check local storage for session
        const storedUserId = localStorage.getItem('user_id');
        if (storedUserId) {
          // Find user in the fetched list to restore session
          const user = usersData.find(u => u.id === storedUserId);
          if (user) {
            setCurrentUser(user);
            setIsAuthenticated(true);
          } else {
            // Invalid session
            localStorage.removeItem('user_id');
          }
        }
      } catch (error) {
        console.error("Failed to initialize UserContext:", error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const login = async (username: string) => {
    try {
      const data: LoginResponse = await apiLogin(username);

      // Map response to User object
      const user: User = {
        id: data.user_id,
        name: data.username,
        email: data.email,
        role: data.role,
        avatar: data.avatar,
        color: data.color,
        level: data.level ?? 1,
        experience: data.experience ?? 0
      };

      localStorage.setItem('user_id', user.id);
      setCurrentUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('user_id');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const getUserById = (userId: string): User | undefined => {
    return users.find((u) => u.id === userId);
  };

  const getRoleById = (roleId: string): Role | undefined => {
    return roles.find((r) => r.id === roleId);
  };

  const value: UserContextType = {
    currentUser,
    users,
    roles,
    isAuthenticated,
    isLoading,
    login,
    logout,
    getUserById,
    getRoleById,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// Hook to use UserContext
export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
}
