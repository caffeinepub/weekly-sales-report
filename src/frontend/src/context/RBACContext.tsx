import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Permission = "read" | "write" | "add" | "delete";

export type UserPermissions = {
  canRead: boolean;
  canWrite: boolean;
  canAdd: boolean;
  canDelete: boolean;
};

export type UserEntry = {
  principal: string;
  permissions: UserPermissions;
  addedAt: number;
  displayName?: string;
};

const ADMIN_KEY = "salespulse_admin_principal";
const USERS_KEY = "salespulse_users";

const ALL_PERMISSIONS: UserPermissions = {
  canRead: true,
  canWrite: true,
  canAdd: true,
  canDelete: true,
};

const DEFAULT_PERMISSIONS: UserPermissions = {
  canRead: true,
  canWrite: false,
  canAdd: false,
  canDelete: false,
};

function loadAdminPrincipal(): string | null {
  try {
    return localStorage.getItem(ADMIN_KEY);
  } catch {
    return null;
  }
}

function loadUsers(): UserEntry[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as UserEntry[];
  } catch {
    return [];
  }
}

function saveUsers(users: UserEntry[]): void {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    // ignore storage errors
  }
}

type RBACContextType = {
  registerUser: (principal: string) => void;
  getMyPermissions: (principal: string) => UserPermissions;
  isAdmin: (principal: string) => boolean;
  getAllUsers: () => UserEntry[];
  setUserPermissions: (principal: string, permissions: UserPermissions) => void;
  setUserDisplayName: (principal: string, displayName: string) => void;
  adminPrincipal: string | null;
};

const RBACContext = createContext<RBACContextType | undefined>(undefined);

export function RBACProvider({ children }: { children: ReactNode }) {
  const [adminPrincipal, setAdminPrincipal] = useState<string | null>(
    loadAdminPrincipal,
  );
  const [users, setUsers] = useState<UserEntry[]>(loadUsers);

  // Persist users to localStorage on change
  useEffect(() => {
    saveUsers(users);
  }, [users]);

  const registerUser = useCallback((principal: string) => {
    setAdminPrincipal((prevAdmin) => {
      let newAdmin = prevAdmin;
      if (!prevAdmin) {
        // First user becomes admin
        localStorage.setItem(ADMIN_KEY, principal);
        newAdmin = principal;
      }
      setUsers((prev) => {
        const exists = prev.some((u) => u.principal === principal);
        if (exists) return prev;
        const isThisAdmin = newAdmin === principal;
        const newEntry: UserEntry = {
          principal,
          permissions: isThisAdmin ? ALL_PERMISSIONS : DEFAULT_PERMISSIONS,
          addedAt: Date.now(),
        };
        return [...prev, newEntry];
      });
      return newAdmin;
    });
  }, []);

  const getMyPermissions = useCallback(
    (principal: string): UserPermissions => {
      if (principal === adminPrincipal) return ALL_PERMISSIONS;
      const user = users.find((u) => u.principal === principal);
      return user?.permissions ?? DEFAULT_PERMISSIONS;
    },
    [adminPrincipal, users],
  );

  const isAdminFn = useCallback(
    (principal: string): boolean => {
      return principal === adminPrincipal;
    },
    [adminPrincipal],
  );

  const getAllUsers = useCallback((): UserEntry[] => {
    return users;
  }, [users]);

  const setUserPermissions = useCallback(
    (principal: string, permissions: UserPermissions) => {
      setUsers((prev) => {
        const exists = prev.some((u) => u.principal === principal);
        if (!exists) {
          // Add user if not present
          return [...prev, { principal, permissions, addedAt: Date.now() }];
        }
        return prev.map((u) =>
          u.principal === principal ? { ...u, permissions } : u,
        );
      });
    },
    [],
  );

  const setUserDisplayName = useCallback(
    (principal: string, displayName: string) => {
      setUsers((prev) =>
        prev.map((u) =>
          u.principal === principal
            ? { ...u, displayName: displayName.trim() }
            : u,
        ),
      );
    },
    [],
  );

  const value = useMemo<RBACContextType>(
    () => ({
      registerUser,
      getMyPermissions,
      isAdmin: isAdminFn,
      getAllUsers,
      setUserPermissions,
      setUserDisplayName,
      adminPrincipal,
    }),
    [
      registerUser,
      getMyPermissions,
      isAdminFn,
      getAllUsers,
      setUserPermissions,
      setUserDisplayName,
      adminPrincipal,
    ],
  );

  return <RBACContext.Provider value={value}>{children}</RBACContext.Provider>;
}

export function useRBAC(): RBACContextType {
  const ctx = useContext(RBACContext);
  if (!ctx) {
    throw new Error("useRBAC must be used within a RBACProvider");
  }
  return ctx;
}
