'use client';
import { useContext } from 'react';
import { motion } from 'framer-motion';
import { Chat } from '@/components/chat';
import { generateUUID } from '@/lib/utils';
import { P5Sketch } from '@/components/p5-sketch';
import { LoadingScreen } from '@/components/loading';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset } from '@/components/ui/sidebar';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { DiscordSDKContext } from '@/lib/DiscordSDKProvider';
import { bouncingShapeSketch } from '@/sketches/bouncing-shape';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Home() {
  const id = generateUUID();
  const { auth, loggedIn, sdkReady } = useContext(DiscordSDKContext);

  if (!loggedIn || !auth?.user) {
    return (
      <div className="w-screen h-screen overflow-hidden">
        <LoadingScreen sdkReady={sdkReady} />
      </div>
    );
  }

  return (
    <>
      <AppSidebar username="beatsbyanax@gmail.com" />
      <SidebarInset>
        <Chat id={id} initialMessages={[]} isReadonly={false} />
      </SidebarInset>
    </>
  );
}
