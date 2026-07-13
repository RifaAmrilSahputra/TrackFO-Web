import { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../services/api';

function getSocketUrl(baseUrl) {
  try {
    const url = new URL(baseUrl);
    return `${url.protocol}//${url.host}`;
  } catch {
    return baseUrl.replace(/\/api\/?$/, '');
  }
}

export function useRealtimeTracking(gangguanId, enabled = false) {
  const [update, setUpdate] = useState(null);
  const [connected, setConnected] = useState(false);
  const socketUrl = useMemo(
    () => getSocketUrl(API_BASE_URL),
    []
  );
  const socketRef = useRef(null);

  useEffect(() => {
    if (!enabled || !gangguanId) {
      setConnected(false);
      return;
    }

    const token = localStorage.getItem('token');
    const socket = io(socketUrl, {
      auth: token ? { token } : undefined,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      if (gangguanId) {
        socket.emit('join', `gangguan:${gangguanId}`);
      }
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('tracking:update', (payload) => {
      if (!payload) return;
      if (payload.gangguanId && payload.gangguanId !== gangguanId) {
        return;
      }

      setUpdate((previous) => ({
        ...previous,
        ...payload,
      }));
    });

    socket.on('connect_error', (error) => {
      console.warn('Realtime tracking socket connect error:', error);
      setConnected(false);
    });

    socket.on('error', () => {
      setConnected(false);
    });

    return () => {
      socket.off();
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [enabled, gangguanId, socketUrl]);

  return { update, connected };
}
