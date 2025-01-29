'use client';

import React, { createContext, useEffect, useState } from 'react';
import { DiscordSDK } from '@discord/embedded-app-sdk';

export interface AuthUser {
  username: string;
  discriminator: string;
  id: string;
  public_flags: number;
  avatar?: string | null | undefined;
  global_name?: string | null | undefined;
}

export interface AuthData {
  access_token: string;
  user: AuthUser;
}

interface DiscordSDKContextValue {
  sdk: DiscordSDK | null;
  sdkReady: boolean;
  loggedIn: boolean;
  auth: AuthData | null;
  participants: Participant[];
}

export interface Participant {
  username: string;
  discriminator: string;
  id: string;
  bot: boolean;
  flags: number;
  avatar?: string | null | undefined;
  global_name?: string | null | undefined;
  avatar_decoration_data?:
    | {
        asset: string;
        skuId?: string | undefined;
      }
    | null
    | undefined;
  premium_type?: number | null | undefined;
  nickname?: string | undefined;
}

export const DiscordSDKContext = createContext<DiscordSDKContextValue>({
  sdk: null,
  sdkReady: false,
  loggedIn: false,
  auth: null,
  participants: [],
});

export default function PWAProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sdk, setSdk] = useState<DiscordSDK | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [auth, setAuth] = useState<AuthData | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);

  async function getParticipants(sdk: DiscordSDK) {
    const res = await sdk.commands.getInstanceConnectedParticipants();
    setParticipants(res.participants);
  }

  function handleParticipantsUpdate(payload: { participants: Participant[] }) {
    setParticipants(payload.participants);
  }

  useEffect(() => {
    async function setupSDK(sdk: DiscordSDK) {
      await sdk.ready();

      const { code } = await sdk.commands.authorize({
        client_id: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!,
        response_type: 'code',
        state: '',
        prompt: 'none',
        scope: ['identify', 'guilds', 'applications.commands'],
      });

      const response = await fetch('/.proxy/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
        }),
      });
      const { access_token } = await response.json();

      const auth = await sdk.commands.authenticate({
        access_token,
      });

      if (auth == null) {
        throw new Error('Authenticate command failed');
      }

      setAuth(auth);
      setLoggedIn(true);
      setSdkReady(true);

      // Run setup functions
      getParticipants(sdk);

      // Subscribe to events
      sdk.subscribe(
        'ACTIVITY_INSTANCE_PARTICIPANTS_UPDATE',
        handleParticipantsUpdate
      );
    }

    const discordSDK = new DiscordSDK(
      process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!
    );
    setSdk(discordSDK);

    setupSDK(discordSDK);
  }, []);

  return (
    <DiscordSDKContext.Provider
      value={{ sdk, sdkReady, loggedIn, auth, participants }}
    >
      {children}
    </DiscordSDKContext.Provider>
  );
}
