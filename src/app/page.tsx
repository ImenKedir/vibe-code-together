'use client';

import { DiscordSDKContext } from '@/lib/DiscordSDKProvider';
import {
  faCircleNotch,
  faUser,
  faWarning,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useContext } from 'react';
import { motion } from 'framer-motion';
import { UserGeneratorCard } from './components/UserGeneratorCard';

function LoadingScreen({ sdkReady }: { sdkReady: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <motion.h1
        className="text-5xl font-bold"
        initial={{ opacity: 0, y: '-100%' }}
        animate={{ opacity: 1, y: 0 }}
        layoutId="title"
      >
        GenTogether
      </motion.h1>
      <div className="mt-2">
        {!sdkReady ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faCircleNotch} className="animate-spin" />
            Loading...
          </motion.div>
        ) : (
          <div>
            <FontAwesomeIcon icon={faWarning} /> Failed to log in. Please
            restart the app.
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const { auth, loggedIn, sdkReady, participants } =
    useContext(DiscordSDKContext);

  if (!loggedIn || !auth?.user) {
    return (
      <div className="w-screen h-screen overflow-hidden">
        <LoadingScreen sdkReady={sdkReady} />
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-hidden">
      <div className="flex justify-center px-8 py-4">
        <div>
          <motion.h1 className="text-3xl font-bold" layoutId="title">
            GenTogether
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
      <div className="grid grid-cols-2 px-8 gap-8">
        <UserGeneratorCard key={auth.user.id} user={auth.user} />
        {participants
          .filter((participant) => participant.id !== auth.user.id)
          .map((participant) => (
            <UserGeneratorCard key={participant.id} user={participant} />
          ))}
      </div>
    </div>
  );
}
