import { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { ref, set, get, update, runTransaction } from "firebase/database";
import { auth, db } from "@/lib/firebase";

const ADMIN_EMAIL = "moneystormbr@gmail.com";

function generateReferralCode(uid: string): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    const idx = (uid.charCodeAt(i % uid.length) + i * 7) % chars.length;
    code += chars[idx];
  }
  return code;
}

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
  referralCode?: string;
  referredBy?: string;
  referralCount?: number;
  cooldownEndsAt?: number;
  pendingBalance?: number;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, bonusCadastro?: number, referralCode?: string) => Promise<void>;
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
        referralCode: raw.referralCode ?? generateReferralCode(uid),
        referredBy: raw.referredBy,
        referralCount: raw.referralCount ?? 0,
        cooldownEndsAt: raw.cooldownEndsAt ?? 0,
        pendingBalance: raw.pendingBalance ?? 0,
      };
      if (isAdminByEmail && !raw.isAdmin) {
        await update(userRef, { isAdmin: true, role: "admin" });
      }
      // ensure referralCode is written
      if (!raw.referralCode) {
        await update(userRef, { referralCode: merged.referralCode });
        await set(ref(db, `referralCodes/${merged.referralCode}`), uid);
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

  const register = async (
    email: string,
    password: string,
    bonusCadastro = 0.25,
    referralCode?: string
  ) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;
    const now = Date.now();
    const isAdminByEmail = email === ADMIN_EMAIL;
    const myReferralCode = generateReferralCode(uid);

    // resolve referral
    let referrerUid: string | null = null;
    if (referralCode) {
      const codeSnap = await get(ref(db, `referralCodes/${referralCode.toUpperCase()}`));
      if (codeSnap.exists()) {
        referrerUid = codeSnap.val();
      }
    }

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
      referralCode: myReferralCode,
      referredBy: referrerUid ?? null,
      referralCount: 0,
      cooldownEndsAt: 0,
    });

    // write my referral code mapping
    await set(ref(db, `referralCodes/${myReferralCode}`), uid);

    // bonus tx
    await set(ref(db, `transactions/${uid}/${now}`), {
      type: "bonus",
      amount: bonusCadastro,
      description: "Bônus de cadastro",
      status: "paid",
      timestamp: now,
    });

    // credit referrer
    if (referrerUid) {
      const referBonusVal = 0.10; // configurable later
      await runTransaction(ref(db, `users/${referrerUid}/balance`), (cur) =>
        Math.round(((cur ?? 0) + referBonusVal) * 100) / 100
      );
      await runTransaction(ref(db, `users/${referrerUid}/referralCount`), (cur) => (cur ?? 0) + 1);
      const refTxNow = Date.now() + 1;
      await set(ref(db, `transactions/${referrerUid}/${refTxNow}`), {
        type: "referral",
        amount: referBonusVal,
        description: `Bônus de indicação (${email})`,
        status: "paid",
        timestamp: refTxNow,
      });
    }
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
