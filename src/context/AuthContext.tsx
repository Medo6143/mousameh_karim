"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { upsertUser, getUserByUid, type UserProfile } from "@/lib/firestore";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let unsubProfile: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        console.log("User logged in, checking profile:", firebaseUser.uid);
        
        try {
          // 1. Initial upsert/verification
          await upsertUser({
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || "مستخدم",
            photoURL: firebaseUser.photoURL || undefined,
          });

          // 2. Start real-time listener for profile data
          if (unsubProfile) unsubProfile(); 
          
          unsubProfile = onSnapshot(doc(db, "users", firebaseUser.uid), (docSnap) => {
            if (docSnap.exists()) {
              console.log("Profile updated via snapshot:", firebaseUser.uid);
              setProfile(docSnap.data() as UserProfile);
            }
          }, (error) => {
            console.error("Profile snapshot error:", error);
          });

        } catch (error) {
          console.warn("Auth sync process error:", error);
          // Fallback to one-time fetch if snapshot setup fails
          const existing = await getUserByUid(firebaseUser.uid);
          if (existing) setProfile(existing);
        }
      } else {
        // Clean up on logout
        if (unsubProfile) {
          unsubProfile();
          unsubProfile = null;
        }
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    await signInWithPopup(auth, provider);
  };

  const signOut = async () => {
    await fbSignOut(auth);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}
