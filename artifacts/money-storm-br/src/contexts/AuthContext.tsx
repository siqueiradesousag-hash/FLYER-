import { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { ref, set, get, update } from "firebase/database";
import { auth, db } from "@/lib/firebase";

const ADMIN_EMAIL = "moneystormbr@gmail.com";

export interface UserData {
  uid: string;
  email: string;
  balance: number;
  totalEarned: number;
  tasksToday: number;
  tasksTotal: number;
  isAdmin: boolean;
  role?: string;
  isVip: boolean;
  isBanned: boolean;
  isSuspect: boolean;
  fraudScore: number;
  createdAt: number;
  pixKey?: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, bonusCadastro?: number) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (firebaseUser: User) => {
    const uid = firebaseUser.uid;
    const email = firebaseUser.email ?? "";
    const userRef = ref(db, `users/${uid}`);
    const snap = await get(userRef);
    const isAdminByEmail = email === ADMIN_EMAIL;

    if (snap.exists()) {
      const raw = snap.val();
      const merged: UserData = {
        uid,
        email,
        balance: raw.balance ?? 0,
        totalEarned: raw.totalEarned ?? 0,
        tasksToday: raw.tasksToday ?? 0,
        tasksTotal: raw.tasksTotal ?? 0,
        isAdmin: raw.isAdmin === true || raw.role === "admin" || isAdminByEmail,
        role: raw.role,
        isVip: raw.isVip ?? false,
        isBanned: raw.isBanned ?? false,
        isSuspect: raw.isSuspect ?? false,
        fraudScore: raw.fraudScore ?? 0,
        createdAt: raw.createdAt ?? Date.now(),
        pixKey: raw.pixKey ?? "",
      };
      // auto-grant admin flag in DB for moneystormbr@gmail.com
      if (isAdminByEmail && !raw.isAdmin) {
        await update(userRef, { isAdmin: true, role: "admin" });
      }
      setUserData(merged);
    }
  };

  const refreshUserData = async () => {
    if (user) await fetchUserData(user);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchUserData(firebaseUser);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string, bonusCadastro = 0.25) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;
    const now = Date.now();
    const isAdminByEmail = email === ADMIN_EMAIL;
    await set(ref(db, `users/${uid}`), {
      email,
      balance: bonusCadastro,
      totalEarned: 0,
      tasksToday: 0,
      tasksTotal: 0,
      isAdmin: isAdminByEmail,
      role: isAdminByEmail ? "admin" : "user",
      isVip: false,
      isBanned: false,
      isSuspect: false,
      fraudScore: 0,
      createdAt: now,
      pixKey: "",
    });
    await set(ref(db, `transactions/${uid}/${now}`), {
      type: "bonus",
      amount: bonusCadastro,
      description: "Bônus de cadastro",
      status: "paid",
      timestamp: now,
    });
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, login, register, logout, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
