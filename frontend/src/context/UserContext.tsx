import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@/types/user';
import type { Role } from '@/types/role';
import { initialUsers, roles } from '@/lib/mockData';

interface UserContextType {
  currentUser: User;
  users: User[];
  roles: Role[];
  getUserById: (userId: string) => User | undefined;
  getRoleById: (roleId: string) => Role | undefined;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  // In a real app, currentUser would come from authentication
  // For now, we'll use the first user as the current user
  const currentUser = initialUsers[0];

  const getUserById = (userId: string): User | undefined => {
    return initialUsers.find((u) => u.id === userId);
  };

  const getRoleById = (roleId: string): Role | undefined => {
    return roles.find((r) => r.id === roleId);
  };

  const value: UserContextType = {
    currentUser,
    users: initialUsers,
    roles,
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
