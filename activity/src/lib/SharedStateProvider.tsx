'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { DiscordSDKContext } from './DiscordSDKProvider';
import { io, Socket } from 'socket.io-client';

interface UserState {
  prompt: string;
  imageUrl: string;
  loadingPercentage: number;
}

interface SharedStateContextValue {
  userStates: Map<string, UserState>;
  socket: Socket | null;
}

export const SharedStateContext = createContext<SharedStateContextValue>({
  userStates: new Map(),
  socket: null,
});

export function SharedStateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sdk } = useContext(DiscordSDKContext);

  const [userStates, setUserStates] = useState<Map<string, UserState>>(
    new Map()
  );
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socket = io('/', { path: '/.proxy/ws/socket.io' });
    setSocket(socket);

    socket.on('connect', () => {
      console.log('Connected to websocket server');
    });

    socket.on('gameStateUpdate', (state: Record<string, UserState>) => {
      setUserStates(new Map(Object.entries(state)));
    });

    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    if (sdk && socket) {
      socket.emit('join', sdk.channelId);
    }
  }, [sdk, socket]);

  return (
    <SharedStateContext.Provider value={{ userStates, socket }}>
      {children}
    </SharedStateContext.Provider>
  );
}
