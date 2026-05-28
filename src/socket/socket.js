/**
 * SoundForge — Socket.io Client
 *
 * Singleton socket instance used throughout the application for
 * real-time collaboration (grid sync, room management, user presence).
 *
 * The socket is created with autoConnect: false so the app can
 * explicitly connect after the user joins a room. Import this
 * module and call socket.connect() when ready.
 *
 * Environment variable:
 *   VITE_API_URL — backend URL (defaults to http://localhost:3001)
 */

import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const socket = io(SOCKET_URL, {
  /* Prefer WebSocket; fall back to polling only if necessary */
  transports: ['websocket'],

  /* Don't connect until the app explicitly calls socket.connect() */
  autoConnect: false,

  /* Reconnection strategy */
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 8000,

  /* Timeouts */
  timeout: 10000,
});

/* ── Debug logging (dev only) ──────────────────────────────────────────── */
if (import.meta.env.DEV) {
  socket.onAny((event, ...args) => {
    console.debug(`[socket] ← ${event}`, ...args);
  });

  socket.on('connect', () => {
    console.debug('[socket] connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.debug('[socket] disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.warn('[socket] connection error:', err.message);
  });

  socket.on('reconnect_attempt', (attempt) => {
    console.debug(`[socket] reconnect attempt #${attempt}`);
  });

  socket.on('reconnect', (attempt) => {
    console.debug(`[socket] reconnected after ${attempt} attempt(s)`);
  });

  socket.on('reconnect_failed', () => {
    console.error('[socket] reconnection failed — giving up');
  });
}

export default socket;
