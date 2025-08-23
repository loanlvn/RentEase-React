/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile as fbUpdateProfile,
  updateEmail as fbUpdateEmail,
  updatePassword as fbUpdatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";
import { auth, db } from "../../services/firebaseConfig";

interface UserProfile {
  firstName: string;
  lastName: string;
  birthDate: string;
  email: string;
}

interface AuthContextProps {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  loadingProfile: boolean;
  error: string | null;
  register: (data: { firstName: string; lastName: string; birthDate: string; email: string; password: string }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: { firstName: string; lastName: string; birthDate: string; email: string; newPassword?: string }) => Promise<void>;
  reauth: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoading(false);
      if (user) {
        setLoadingProfile(true);
        try {
          const snap = await getDoc(doc(db, "users", user.uid));
          if (snap.exists()) {
            const data = snap.data() as DocumentData;
            setUserProfile({
              firstName: data.firstName,
              lastName: data.lastName,
              birthDate: data.birthDate,
              email: data.email,
            });
          }
        } catch (e: any) {
          setError(e.message);
        } finally {
          setLoadingProfile(false);
        }
      } else {
        setUserProfile(null);
        setLoadingProfile(false);
      }
    });
    return () => unsub();
  }, []);

  // register
  const register = async ({ firstName, lastName, birthDate, email, password }: { firstName: string; lastName: string; birthDate: string; email: string; password: string }) => {
    setError(null);
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await fbUpdateProfile(cred.user, { displayName: `${firstName} ${lastName}` });
    // create Firestore doc
    await setDoc(doc(db, "users", cred.user.uid), { firstName, lastName, birthDate, email });
  };

  // login
  const login = async (email: string, password: string) => {
    setError(null);
    await signInWithEmailAndPassword(auth, email, password);
  };

  // logout
  const logout = async () => {
    setError(null);
    await signOut(auth);
  };

  // update profile
  const updateUserProfile = async ({ firstName, lastName, birthDate, email, newPassword }: { firstName: string; lastName: string; birthDate: string; email: string; newPassword?: string }) => {
    if (!currentUser) throw new Error("Utilisateur non connecté");
    setError(null);
    // update auth
    if (email !== currentUser.email) await fbUpdateEmail(currentUser, email);
    if (newPassword) await fbUpdatePassword(currentUser, newPassword);
    await fbUpdateProfile(currentUser, { displayName: `${firstName} ${lastName}` });
    // update Firestore
    const userRef = doc(db, "users", currentUser.uid);
    await updateDoc(userRef, { firstName, lastName, birthDate, email });
    setUserProfile({ firstName, lastName, birthDate, email });
  };

  // reauthenticate
  const reauth = async (password: string) => {
    if (!currentUser || !currentUser.email) throw new Error("Utilisateur non connecté");
    const cred = EmailAuthProvider.credential(currentUser.email, password);
    await reauthenticateWithCredential(currentUser, cred);
  };

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, loading, loadingProfile, error, register, login, logout, updateUserProfile, reauth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
