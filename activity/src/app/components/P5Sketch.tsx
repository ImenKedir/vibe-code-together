'use client';

import p5 from 'p5';
import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch, faWarning } from '@fortawesome/free-solid-svg-icons';

export interface P5SketchProps {
  sketch: string | ((p5: any) => { setup: () => void; draw: () => void });
}

export function P5Sketch({ sketch }: P5SketchProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);
  const p5Instance = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (p5Instance.current) {
        p5Instance.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    try {
      p5Instance.current = new p5((p: any) => {
        if (typeof sketch === 'string') {
          try {
            const sketchFn = new Function('return ' + sketch)();
            sketchFn(p);
          } catch (e) {
            console.error('Error evaluating sketch code:', e);
            setError(true);
          }
        } else {
          const sketchFn = sketch(p);
          p.setup = sketchFn.setup;
          p.draw = sketchFn.draw;
        }
      }, containerRef.current);
    } catch (e) {
      console.error('Error creating p5 instance:', e);
      setError(true);
    }

    return () => {
      if (p5Instance.current) {
        p5Instance.current.remove();
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
        Failed to load P5.js sketch
      </div>
    );
  }

  return <div ref={containerRef} className="sketch-wrapper" />;
} 