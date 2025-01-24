import { AuthData } from '@/lib/DiscordSDKProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleNotch,
  faExclamationTriangle,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { GenerationResult, getGeneration, startGeneration } from '@/lib/api';

export function UserGeneratorCard({ user }: { user: AuthData['user'] }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [progress, setProgress] = useState<number>(0);

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
          result.sample = result.sample.replace(
            'https://delivery-us1.bfl.ai/',
            '/.proxy/gen/'
          );
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
    <div className="rounded-lg border border-white/10">
      <div className="flex items-center gap-2 border-b border-white/10 p-2">
        <FontAwesomeIcon icon={faUser} />
        <div>{user.username}</div>
      </div>
      <div className="p-2">
        <div className="bg-white/10 aspect-[] rounded-lg w-full relative">
          {loading || error != null ? (
            <div className="absolute inset-0 flex items-center justify-center backdrop-blur-md rounded-lg">
              <div className="flex items-center gap-2">
                {loading ? (
                  <FontAwesomeIcon
                    icon={faCircleNotch}
                    className="animate-spin"
                  />
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
            placeholder="What do you want to generate?"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                generate();
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
