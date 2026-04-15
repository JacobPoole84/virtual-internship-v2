"use client";

import { auth, db } from "./init";
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

export type SubscriptionStatus = "basic" | "premium-plus";

const PREMIUM_SUBSCRIPTION_STATUSES = ["trialing", "active"] as const;

function resolveUserId(userId?: string): string | null {
  if (userId) {
    return userId;
  }

  return auth.currentUser?.uid ?? null;
}

export async function getPremiumStatus(
  userId?: string
): Promise<SubscriptionStatus> {
  const resolvedUserId = resolveUserId(userId);

  if (!resolvedUserId) {
    return "basic";
  }

  const subscriptionsRef = collection(
    db,
    "customers",
    resolvedUserId,
    "subscriptions"
  );
  const activeSubscriptionQuery = query(
    subscriptionsRef,
    where("status", "in", [...PREMIUM_SUBSCRIPTION_STATUSES])
  );

  const snapshot = await getDocs(activeSubscriptionQuery);

  return snapshot.empty ? "basic" : "premium-plus";
}

export function subscribeToPremiumStatus(
  onStatusChange: (status: SubscriptionStatus) => void,
  userId?: string
): () => void {
  const resolvedUserId = resolveUserId(userId);

  if (!resolvedUserId) {
    onStatusChange("basic");
    return () => {};
  }

  const subscriptionsRef = collection(
    db,
    "customers",
    resolvedUserId,
    "subscriptions"
  );
  const activeSubscriptionQuery = query(
    subscriptionsRef,
    where("status", "in", [...PREMIUM_SUBSCRIPTION_STATUSES])
  );

  return onSnapshot(activeSubscriptionQuery, (snapshot) => {
    onStatusChange(snapshot.empty ? "basic" : "premium-plus");
  });
}