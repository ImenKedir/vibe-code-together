'use client';
import { useContext } from 'react';
import { motion } from 'framer-motion';
import { P5Sketch } from './components/P5Sketch';
import { LoadingScreen } from './components/Loading';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { DiscordSDKContext } from '@/lib/DiscordSDKProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { bouncingShapeSketch } from './sketches/bouncing-shape';

export default function Home() {
  const { auth, loggedIn, sdkReady } = useContext(DiscordSDKContext);

  if (!loggedIn || !auth?.user) {
    return (
      <div className="w-screen h-screen overflow-hidden">
        <LoadingScreen sdkReady={sdkReady} />
      </div>
    );
  }

  return (
    <div className="">
      <div className="flex justify-center px-8 py-4">
        <div>
          <motion.h1 className="text-3xl font-bold" layoutId="title">
            Vibe Code P5.js Games Together
          </motion.h1>
        </div>
        <motion.div
          className="ml-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <FontAwesomeIcon icon={faUser} /> {auth.user.username}
        </motion.div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 px-8 gap-8">
        <P5Sketch sketch={bouncingShapeSketch} />
      </div>
    </div>
  );
}
