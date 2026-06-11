import { useEffect, useRef, useCallback } from 'react';
import { BASE_URL } from '../appConstant';
import { useChatStore } from '../store/chatStore';
import type { WsEvent } from '../types/database';

const WS_URL = BASE_URL.replace(/^http/, 'ws');

const INITIAL_DELAY = 1000;
const MAX_DELAY = 30000;

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const retryDelay = useRef(INITIAL_DELAY);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmounted = useRef(false);

  const { setWsStatus, upsertMessage, seedHistory } = useChatStore();

  const connect = useCallback(() => {
    if (unmounted.current) return;

    setWsStatus('reconnecting');
    const ws = new WebSocket(`${WS_URL}/webhooks/ws/chat`);
    wsRef.current = ws;

    ws.onopen = () => {
      retryDelay.current = INITIAL_DELAY;
      setWsStatus('connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string) as WsEvent;
        if (data.type === 'history' && data.messages) {
          seedHistory(data.messages);
        } else if (data.type === 'new_message' && data.message) {
          upsertMessage(data.message);
        }
      } catch {
        // malformed frame — ignore
      }
    };

    ws.onclose = () => {
      if (unmounted.current) return;
      setWsStatus('disconnected');
      // Exponential back-off reconnect
      retryTimer.current = setTimeout(() => {
        retryDelay.current = Math.min(retryDelay.current * 2, MAX_DELAY);
        connect();
      }, retryDelay.current);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [setWsStatus, upsertMessage, seedHistory]);

  useEffect(() => {
    unmounted.current = false;
    connect();

    return () => {
      unmounted.current = true;
      if (retryTimer.current) clearTimeout(retryTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);
}
