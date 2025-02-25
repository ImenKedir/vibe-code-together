'use client';
import p5 from 'p5';
import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch, faWarning } from '@fortawesome/free-solid-svg-icons';

type P5SketchFn = (p: p5) => void;
type P5 = (p: any) => { setup: () => void; draw: () => void };

export interface P5SketchProps {
  sketch: string | P5;
}

export function P5Sketch({ sketch }: P5SketchProps) {
  const p5Instance = useRef<p5 | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (p5Instance.current) {
        p5Instance.current.remove();
        p5Instance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    try {
      let sketchFn: P5SketchFn;

      if (typeof sketch === 'string') {
        // Evaluate the sketch string safely
        const fn = new Function(sketch)();
        if (typeof fn !== 'function') throw new Error('Sketch string must return a function');
        sketchFn = fn;
      } else {
        sketchFn = sketch;
      }

      // Create p5 instance
      p5Instance.current = new p5((p: any) => {
        try {
          sketchFn(p);
          // Ensure setup and draw are defined
          if (!p.setup || !p.draw) {
            throw new Error('Sketch must define setup() and draw() functions');
          }
        } catch (e) {
          if (e instanceof Error) throw new Error(`Error in sketch execution: ${e.message}`);
          throw new Error('Unknown error in sketch execution');
        }
      }, containerRef.current);
    } catch (e) {
      console.error('Error initializing p5 sketch:', e);
      setError(e instanceof Error ? e.message : 'Unknown error');
    }

    return () => {
      if (p5Instance.current) {
        p5Instance.current.remove();
        p5Instance.current = null;
      }
    };
  }, [sketch, mounted]);

  if (!mounted) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-gray-100">
        <FontAwesomeIcon icon={faCircleNotch} spin className="mr-2" />
        Loading P5.js...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded">
        <FontAwesomeIcon icon={faWarning} className="mr-2" />
        Failed to load P5.js sketch: {error}
      </div>
    );
  }

  return <div ref={containerRef} className="sketch-wrapper" />;
}
