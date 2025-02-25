import { AuthUser, Participant } from '@/lib/DiscordSDKProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { useContext, useEffect, useState } from 'react';
import { GenerationResult, getGeneration, startGeneration } from '@/lib/api';
import { motion } from 'framer-motion';
import { SharedStateContext } from '@/lib/SharedStateProvider';

export function UserGeneratorCard({
  user,
  self = false,
  channelId,
}: {
  user: Participant | AuthUser;
  self?: boolean;
  channelId: string;
}) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const { userStates, socket } = useContext(SharedStateContext);
  const userState = userStates.get(user.id);

  useEffect(() => {
    if (!self && userState != null) {
      if (userState.loadingPercentage != 0) {
        setLoading(true);
        setProgress(userState.loadingPercentage);
      } else {
        setLoading(false);
      }

      setPrompt(userState.prompt);
      setResult(
        userState.imageUrl
          ? {
              sample: userState.imageUrl,
              prompt: userState.prompt,
              seed: 0,
              start_time: 0,
              end_time: 0,
              duration: 0,
            }
          : null
      );
    }
  }, [userState, self]);

  // Upon changes to the state, update the server
  useEffect(() => {
    if (self) {
      socket?.emit('updateState', channelId, user.id, {
        prompt: prompt || '',
        imageUrl: result?.sample || '',
        loadingPercentage: loading ? progress || 0 : 0,
      });
    }
  }, [self, channelId, socket, progress, result, prompt, user.id, loading]);

  async function generate() {
    if (loading) {
      return;
    }

    // Reset the state upon a new generation
    setLoading(true);
    setError(null);
    setProgress(0);

    // Start the generation
    const { id, error } = await startGeneration(prompt, 1440, 960);
    if (error != null) {
      setError(error);
      setLoading(false);
      return;
    }

    // Poll the generation status until it's done
    const interval = setInterval(async () => {
      const generation = await getGeneration(id);

      if (generation.status != 'Pending') {
        // Either done or failed

        if (generation.result != null) {
          // Success
          const result = generation.result;
          result.sample = result.sample.replace('https://delivery-us1.bfl.ai/', '/.proxy/gen/');
          setResult(result);
        } else {
          // Failed: either moderation or error
          setError(generation.status);
        }

        clearInterval(interval);
        setLoading(false);
        return;
      } else {
        // Still generating
        if (generation.progress != null) {
          setProgress(generation.progress);
        }
      }
    }, 500);

    // Cleanup the interval when the component unmounts
    return () => clearInterval(interval);
  }

  return (
    <motion.div
      className="rounded-lg border border-white/10"
      layoutId={user.id}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2 border-b border-white/10 p-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
          alt={user.username}
          className="w-6 h-6 rounded-full"
        />
        <div>{user.username}</div>
      </div>
      <div className="p-2">
        <div className="bg-white/10 aspect-[1440/960] rounded-lg w-full relative">
          {loading || error != null ? (
            <div className="absolute inset-0 flex items-center justify-center backdrop-blur-md rounded-lg">
              <div className="flex items-center gap-2">
                {loading ? (
                  <FontAwesomeIcon icon={faCircleNotch} className="animate-spin" />
                ) : (
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                )}
                <div>{loading ? `${progress * 100}%` : error}</div>
              </div>
            </div>
          ) : null}
          {result != null && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={result.sample}
              alt={result.prompt}
              className="w-full rounded-lg"
              width={1440}
              height={960}
            ></img>
          )}
        </div>
        <div className="flex items-center font-mono pt-2 p-1">
          <div className="text-green-500">&gt;</div>
          <input
            className="bg-transparent outline-none border-none ml-2 flex-grow"
            placeholder={self ? 'What do you want to generate?' : ''}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            disabled={loading || !self}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                generate();
              }
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
