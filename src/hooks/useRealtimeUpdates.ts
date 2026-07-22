"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getRealtimeUpdates,
  realtimeKeys,
  type RealtimeUpdate,
} from "@/lib/http/realtime";

export type { RealtimeUpdate } from "@/lib/http/realtime";

export function useRealtimeUpdates(onUpdate: (update: RealtimeUpdate) => void) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;
  const processedCountRef = useRef(0);
  const fallbackModeRef = useRef(false);
  const socketConnectedRef = useRef(false);
  const [fallbackMode, setFallbackMode] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    fallbackModeRef.current = fallbackMode;
  }, [fallbackMode]);

  useEffect(() => {
    socketConnectedRef.current = socketConnected;
  }, [socketConnected]);

  const query = useQuery({
    queryKey: realtimeKeys.updates(),
    queryFn: getRealtimeUpdates,
    enabled: fallbackMode,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
  const { refetch } = query;

  useEffect(() => {
    let mounted = true;
    let socket: import("socket.io-client").Socket | null = null;

    const activatePollingFallback = () => {
      if (!mounted || fallbackModeRef.current || socketConnectedRef.current) return;
      setFallbackMode(true);
      void refetch();
    };

    const connectSocket = async () => {
      try {
        const { io } = await import("socket.io-client");
        if (!mounted) return;

        const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;
        const socketOrigin = configuredApiUrl
          ? new URL(configuredApiUrl).origin
          : window.location.origin;

        socket = io(`${socketOrigin}/realtime`, {
          transports: ["websocket", "polling"],
          withCredentials: true,
          timeout: 6000,
          reconnection: true,
          reconnectionAttempts: Infinity,
        });

        socket.on("connect", () => {
          setSocketConnected(true);
          setFallbackMode(false);
        });

        socket.on("disconnect", () => {
          setSocketConnected(false);
          activatePollingFallback();
        });

        socket.on("connect_error", () => {
          setSocketConnected(false);
          activatePollingFallback();
        });

        socket.on("realtime:update", (payload: { updates?: RealtimeUpdate[] }) => {
          const updates = Array.isArray(payload?.updates) ? payload.updates : [];
          for (const update of updates) {
            onUpdateRef.current(update);
          }
        });
      } catch {
        activatePollingFallback();
      }
    };

    void connectSocket();

    return () => {
      mounted = false;
      socket?.disconnect();
    };
  }, [refetch]);

  useEffect(() => {
    if (!fallbackMode) return;

    const updates = query.data ?? [];
    const prev = processedCountRef.current;

    if (updates.length <= prev) {
      if (updates.length < prev) {
        processedCountRef.current = 0;
      }
      return;
    }

    for (let i = prev; i < updates.length; i++) {
      onUpdateRef.current(updates[i]!);
    }
    processedCountRef.current = updates.length;
  }, [fallbackMode, query.data]);

  return {
    connected: socketConnected || (fallbackMode && query.isSuccess && !query.isError),
  };
}
