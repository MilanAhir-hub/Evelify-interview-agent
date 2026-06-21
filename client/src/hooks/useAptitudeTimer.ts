import { useState, useEffect, useRef, useCallback } from 'react';

interface UseAptitudeTimerReturn {
  remainingSeconds: number;
  formattedTime: string;
  isTimeUp: boolean;
  startTimer: () => void;
  stopTimer: () => void;
  getElapsedSeconds: () => number;
}

export function useAptitudeTimer(
  durationMinutes: number,
  onTimeUp: () => void
): UseAptitudeTimerReturn {
  const TOTAL_SECONDS = durationMinutes * 60;

  const [remainingSeconds, setRemainingSeconds] = useState(TOTAL_SECONDS);
  const [isRunning, setIsRunning] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const remainingRef = useRef(TOTAL_SECONDS);
  const onTimeUpRef = useRef(onTimeUp);
  const startTimeRef = useRef<number | null>(null);

  onTimeUpRef.current = onTimeUp;

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const stopTimer = useCallback(() => {
    clearTimer();
    setIsRunning(false);
  }, [clearTimer]);

  const startTimer = useCallback(() => {
    if (isRunning) return;

    startTimeRef.current = Date.now();
    setIsRunning(true);

    clearTimer();

    intervalRef.current = setInterval(() => {
      const newRemaining = remainingRef.current - 1;

      if (newRemaining <= 0) {
        clearTimer();
        remainingRef.current = 0;
        setRemainingSeconds(0);
        setIsRunning(false);
        onTimeUpRef.current();
        return;
      }

      remainingRef.current = newRemaining;
      setRemainingSeconds(newRemaining);
    }, 1000);
  }, [clearTimer, isRunning]);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  const getElapsedSeconds = useCallback(() => {
    return TOTAL_SECONDS - remainingRef.current;
  }, [TOTAL_SECONDS]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return {
    remainingSeconds,
    formattedTime,
    isTimeUp: remainingSeconds <= 0,
    startTimer,
    stopTimer,
    getElapsedSeconds,
  };
}
