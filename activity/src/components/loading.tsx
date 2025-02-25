import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch, faWarning } from '@fortawesome/free-solid-svg-icons';

export function LoadingScreen({ sdkReady }: { sdkReady: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <motion.h1
        className="text-5xl font-bold"
        initial={{ opacity: 0, y: '-100%' }}
        animate={{ opacity: 1, y: 0 }}
        layoutId="title"
      >
        Vibe Code P5.js Games Together
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
            <FontAwesomeIcon icon={faWarning} /> Failed to log in. Please restart the app.
          </div>
        )}
      </div>
    </div>
  );
}
