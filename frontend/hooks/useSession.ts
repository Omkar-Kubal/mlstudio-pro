"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/adapters/api";

const PING_INTERVAL_MS = 60_000; // 60 seconds

/**
 * useSession — tracks per-user sessions in Firestore via the backend.
 *
 * - Called once at app root (AuthContext / layout)
 * - Fires POST /sessions/start on mount when user is authenticated
 * - Pings every 60s to keep the session alive + updates current_page
 * - Sends POST /sessions/{id}/end via sendBeacon on tab close
 */
export function useSession() {
    const { user } = useAuth();
    const sessionIdRef = useRef<string | null>(null);
    const pingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const getCurrentPage = () => {
        if (typeof window === "undefined") return undefined;
        // Strip query params / anchor for cleaner tracking
        return window.location.pathname;
    };

    const getDevice = () => {
        if (typeof window === "undefined") return "unknown";
        return navigator.userAgent.slice(0, 256);
    };

    const endSession = useCallback(() => {
        const id = sessionIdRef.current;
        if (!id) return;
        // sendBeacon is fire-and-forget and survives page close
        const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/sessions/${id}/end`;
        navigator.sendBeacon(url, new Blob([JSON.stringify({})], { type: "application/json" }));
        sessionIdRef.current = null;
    }, []);

    const ping = useCallback(async () => {
        const id = sessionIdRef.current;
        if (!id) return;
        try {
            await apiFetch(`/sessions/${id}/ping`, {
                method: "POST",
                body: JSON.stringify({ current_page: getCurrentPage() }),
            });
        } catch {
            // Ping failure is non-critical — don't throw
        }
    }, []);

    useEffect(() => {
        if (!user) {
            // User logged out — end any active session
            if (sessionIdRef.current) endSession();
            if (pingTimerRef.current) clearInterval(pingTimerRef.current);
            return;
        }

        // Start a new session
        const startSession = async () => {
            try {
                const result = await apiFetch<{ session_id: string }>("/sessions/start", {
                    method: "POST",
                    body: JSON.stringify({
                        device: getDevice(),
                        current_page: getCurrentPage(),
                    }),
                });
                sessionIdRef.current = result.session_id;

                // Begin 60-second keep-alive pings
                pingTimerRef.current = setInterval(ping, PING_INTERVAL_MS);
            } catch {
                // Session tracking failure should never interrupt the user
            }
        };

        startSession();

        // End session on tab/window close
        window.addEventListener("beforeunload", endSession);

        return () => {
            window.removeEventListener("beforeunload", endSession);
            if (pingTimerRef.current) clearInterval(pingTimerRef.current);
            endSession();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);   // Re-run if user changes (login / logout)

    return null;
}
