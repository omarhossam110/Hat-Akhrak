"use server";

import { backendFetch } from "@/lib/backend/client";
import { getSessionToken } from "@/lib/auth/session";

export interface BackendNotification {
  id: string;
  type: string;
  data: Record<string, string | number | null>;
  readAt: string | null;
  createdAt: string;
}

export async function getNotifications(): Promise<BackendNotification[]> {
  const token = await getSessionToken();
  if (!token) return [];
  try {
    const res = await backendFetch<{ items: BackendNotification[] }>("/notifications", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.items;
  } catch {
    return [];
  }
}

export async function markNotificationReadAction(id: string): Promise<void> {
  const token = await getSessionToken();
  if (!token) return;
  try {
    await backendFetch(`/notifications/${encodeURIComponent(id)}/read`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    /* best-effort: the bell keeps its local state */
  }
}

export async function markAllNotificationsReadAction(): Promise<void> {
  const token = await getSessionToken();
  if (!token) return;
  try {
    await backendFetch("/notifications/read-all", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    /* best-effort */
  }
}
