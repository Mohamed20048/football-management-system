import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Role } from '@/types/football';

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
  canManageTeams: boolean;
  canManagePlayers: boolean;
  canManageMatches: boolean;
  canManageEvents: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const { role } = useAuth();

  // Role is now managed by AuthContext from the database
  const canManageTeams = role === 'admin' || role === 'coach';
  const canManagePlayers = role === 'admin' || role === 'coach';
  const canManageMatches = role === 'admin';
  const canManageEvents = role === 'admin' || role === 'referee';

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole: () => {}, // No-op since role is managed by database
        canManageTeams,
        canManagePlayers,
        canManageMatches,
        canManageEvents,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
