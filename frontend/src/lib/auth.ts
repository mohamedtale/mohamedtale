import type { User } from '@/types';

export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
};

export const storeAuth = (user: User, accessToken: string, refreshToken: string) => {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

export const clearAuth = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

export const isAuthenticated = (): boolean => {
  return !!getStoredToken();
};

export const hasRole = (user: User | null, ...roles: string[]): boolean => {
  if (!user) return false;
  return roles.includes(user.role);
};

export const getRoleLevel = (role: string): number => {
  const levels: Record<string, number> = {
    system_admin: 4,
    department_manager: 3,
    section_head: 2,
    employee: 1,
  };
  return levels[role] || 0;
};

export const canAccess = (user: User | null, minRole: string): boolean => {
  if (!user) return false;
  return getRoleLevel(user.role) >= getRoleLevel(minRole);
};
