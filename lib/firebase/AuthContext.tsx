"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./init";
import {
  subscribeToPremiumStatus,
  SubscriptionStatus,
} from "./getPremiumStatus";

const AuthContext = createContext<{
  user: User | null;
  subscriptionStatus: SubscriptionStatus;
  isAuthLoading: boolean;
}>({ user: null, subscriptionStatus: "basic", isAuthLoading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionStatus>("basic");
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    let unsubscribeFromPremiumStatus = () => {};

    const unsubscribeFromAuth = onAuthStateChanged(auth, (firebaseUser) => {
      unsubscribeFromPremiumStatus();
      setUser(firebaseUser);
      setIsAuthLoading(false);

      if (!firebaseUser) {
        setSubscriptionStatus("basic");
        return;
      }

      unsubscribeFromPremiumStatus = subscribeToPremiumStatus(
        setSubscriptionStatus,
        firebaseUser.uid
      );
    });

    return () => {
      unsubscribeFromPremiumStatus();
      unsubscribeFromAuth();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, subscriptionStatus, isAuthLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
