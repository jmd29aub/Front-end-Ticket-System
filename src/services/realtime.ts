import Echo from "laravel-echo";
import Pusher from "pusher-js";
import type { ChannelAuthorizationCallback } from "pusher-js";
import { BACKEND_BASE_URL } from "./authHeaders";

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

type RealtimeCleanup = () => void;
type RealtimeCallback = () => void;

export interface RealtimeNotificationPayload {
  id?: string;
  ticket_id: number | null;
  ticket_number?: string | null;
  type?: string | null;
  title?: string | null;
  message?: string | null;
  actor_name?: string | null;
  actor_role?: string | null;
  read_at?: string | null;
  created_at?: string | null;
}

interface BroadcastAuthResponse {
  auth: string;
  channel_data?: string;
}

interface PrivateChannelData {
  name: string;
}

let echoConnection: any = null;

function getCookie(name: string) {
  const cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];

  return cookieValue ? decodeURIComponent(cookieValue) : "";
}

async function ensureCsrfCookie() {
  await fetch(`${BACKEND_BASE_URL}/sanctum/csrf-cookie`, {
    credentials: "include",
  });
}

export function getRealtimeConnection() {
  if (echoConnection) {
    return echoConnection;
  }

  window.Pusher = Pusher;

  const reverbPort = Number(import.meta.env.VITE_REVERB_PORT || 8080);
  const reverbScheme = import.meta.env.VITE_REVERB_SCHEME || "http";

  echoConnection = new Echo({
    broadcaster: "reverb",
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST || "localhost",
    wsPort: reverbPort,
    wssPort: reverbPort,
    forceTLS: reverbScheme === "https",
    enabledTransports: ["ws", "wss"],

    authorizer: (channel: PrivateChannelData) => {
      return {
        authorize: (socketId: string, callback: ChannelAuthorizationCallback) => {
          void (async () => {
            try {
              await ensureCsrfCookie();

              const xsrfToken = getCookie("XSRF-TOKEN");

              const response = await fetch(`${BACKEND_BASE_URL}/broadcasting/auth`, {
                method: "POST",
                credentials: "include",
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                  "X-XSRF-TOKEN": xsrfToken,
                },
                body: JSON.stringify({
                  socket_id: socketId,
                  channel_name: channel.name,
                }),
              });

              const data: BroadcastAuthResponse = await response.json();

              if (!response.ok) {
                callback(new Error("Broadcast authentication failed."), null);
                return;
              }

              callback(null, data);
            } catch (error) {
              callback(error instanceof Error ? error : new Error("Broadcast authentication failed."), null);
            }
          })();
        },
      };
    },
  });

  return echoConnection;
}

export function listenToDashboardUpdates(
  userId: number,
  role: "client" | "support",
  onChange: RealtimeCallback,
): RealtimeCleanup {
  const echo = getRealtimeConnection();

  const channelName = role === "support" ? "support.tickets" : `user.${userId}.tickets`;

  echo
    .private(channelName)
    .listen(".ticket.created", onChange)
    .listen(".ticket.updated", onChange)
    .listen(".ticket.deleted", onChange)
    .listen(".comment.created", onChange);

  return () => {
    echo.leave(channelName);
  };
}

export function listenToTicketUpdates(
  ticketId: number,
  onChange: RealtimeCallback,
  onDeleted: RealtimeCallback,
): RealtimeCleanup {
  const echo = getRealtimeConnection();

  const channelName = `ticket.${ticketId}`;

  echo
    .private(channelName)
    .listen(".ticket.updated", onChange)
    .listen(".comment.created", onChange)
    .listen(".ticket.deleted", onDeleted);

  return () => {
    echo.leave(channelName);
  };
}

export function listenToUserNotifications(
  userId: number,
  onNotification: (notification: RealtimeNotificationPayload) => void,
): RealtimeCleanup {
  const echo = getRealtimeConnection();

  const channelName = `App.Models.User.${userId}`;

  echo.private(channelName).notification((notification: RealtimeNotificationPayload) => {
    onNotification(notification);
  });

  return () => {
    echo.leave(channelName);
  };
}

export function disconnectRealtime() {
  if (!echoConnection) {
    return;
  }

  echoConnection.disconnect();
  echoConnection = null;
}
