"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type BroadcastHandlers = Record<string, (payload: any) => void>;

type Options = {
  /** Channel name, e.g. `snippet:${id}`. Pass null to disable (no subscription). */
  channel: string | null;
  /** Track presence on this channel to count live participants. */
  presence?: boolean;
  /** Stable presence key (e.g. user id). Falls back to a random anon key. */
  presenceKey?: string;
  /** Map of broadcast event name → handler. */
  onBroadcast?: BroadcastHandlers;
};

/**
 * Thin wrapper around a Supabase Realtime channel.
 *
 * Uses Presence + Broadcast (pub/sub) rather than Postgres Changes, so it works
 * regardless of where the application database lives — the app's Prisma DB is
 * not the Supabase project's Postgres, so Postgres Changes are not available.
 *
 * Returns the live participant count (when `presence` is on) and a `broadcast`
 * function to emit events to other subscribers.
 */
export function useRealtimeChannel({ channel, presence = false, presenceKey, onBroadcast }: Options) {
  const [viewerCount, setViewerCount] = useState(0);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Keep the latest handlers without forcing a resubscribe.
  const handlersRef = useRef<BroadcastHandlers | undefined>(onBroadcast);
  handlersRef.current = onBroadcast;

  useEffect(() => {
    if (!channel) return;

    const supabase = createClient();
    const key = presenceKey || `anon-${Math.random().toString(36).slice(2)}`;
    const ch = supabase.channel(channel, { config: { presence: { key } } });

    if (presence) {
      ch.on("presence", { event: "sync" }, () => {
        setViewerCount(Object.keys(ch.presenceState()).length);
      });
    }

    const events = handlersRef.current ? Object.keys(handlersRef.current) : [];
    for (const event of events) {
      ch.on("broadcast", { event }, (msg) => handlersRef.current?.[event]?.(msg.payload));
    }

    ch.subscribe(async (status) => {
      if (status === "SUBSCRIBED" && presence) {
        await ch.track({ online_at: new Date().toISOString() });
      }
    });

    channelRef.current = ch;
    return () => {
      supabase.removeChannel(ch);
      channelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel, presence, presenceKey]);

  const broadcast = useCallback((event: string, payload: unknown) => {
    channelRef.current?.send({ type: "broadcast", event, payload });
  }, []);

  return { viewerCount, broadcast };
}
