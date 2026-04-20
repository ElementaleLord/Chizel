import { useEffect, useState } from 'react';
import { useAppState } from '../state/AppStateContext';

function formatTime(date: Date, use24HourTime: boolean) {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: !use24HourTime,
  }).format(date);
}

export function NavbarClock() {
  const { use24HourTime } = useAppState();
  const [currentTime, setCurrentTime] = useState(() => formatTime(new Date(), use24HourTime));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(formatTime(new Date(), use24HourTime));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [use24HourTime]);

  return (
    <div
      className="hidden min-w-[5.75rem] items-center justify-center rounded-md border border-border bg-secondary/60 px-3 py-1 text-sm font-medium tabular-nums text-foreground sm:flex"
      aria-label={`Local time ${currentTime}`}
    >
      {currentTime}
    </div>
  );
}
