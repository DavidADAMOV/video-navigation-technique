import { useState, useEffect, useRef, useCallback } from 'react';

/** This personalized hook handles the HTML `setInterval` function
 * 
 * @param {Function} callback the callback function of the interval
 * @param {number} delay the delay *in seconds* of the interval
 * @returns {{start: Function, stop:Function, isActive: boolean;}} an object that contains 2 functions (`start` : starts the interval , `stop` : stops the interval) and 1 boolean (`isActive` : checks if the interval is active)
 */
export default function useInterval(callback: () => void, delay: number) {
  const savedCallback = useRef<() => void>();
  const [isActive, setIsActive] = useState(false);
  const intervalId = useRef<NodeJS.Timeout | null>(null);

  // Remember the latest callback if it changes.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval when isActive is true
  useEffect(() => {
    if (isActive) {
      const tick = () => {
        if (savedCallback.current) {
          savedCallback.current();
        }
      };
      intervalId.current = setInterval(tick, delay);
      return () => {
        if (intervalId.current) {
          clearInterval(intervalId.current);
        }
      };
    }
  }, [isActive, delay]);

  // Function to start the interval
  const start = useCallback(() => {
    setIsActive(true);
  }, []);

  // Function to stop the interval
  const stop = useCallback(() => {
    if (intervalId.current) {
      clearInterval(intervalId.current);
    }
    setIsActive(false);
  }, []);

  return { start, stop, isActive };
}