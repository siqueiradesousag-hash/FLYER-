import { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { ref, set, get, serverTimestamp } from "firebase/database";
import { auth, db } from "@/lib/firebase";

interface UserData {
  uid: string;
  email: string;
  balance: number;
  totalEarned: number;
  tasksToday: number;
  tasksTotal: number;
  isAdmin: boolean;
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
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (uid: string) => {
    const userRef = ref(db, `users/${uid}`);
    const snap = await get(userRef);
    if (snap.exists()) {
      setUserData({ uid, ...snap.val() } as UserData);
    }
  };

  const refreshUserData = async () => {
    if (user) await fetchUserData(user.uid);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchUserData(firebaseUser.uid);
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

  const register = async (email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;
    const now = Date.now();
    await set(ref(db, `users/${uid}`), {
      email,
      balance: 0.25,
      totalEarned: 0,
      tasksToday: 0,
      tasksTotal: 0,
      isAdmin: false,
      isVip: false,
      isBanned: false,
      isSuspect: false,
      fraudScore: 0,
      createdAt: now,
      pixKey: "",
    });
    await set(ref(db, `transactions/${uid}/${now}`), {
      type: "bonus",
      amount: 0.25,
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
