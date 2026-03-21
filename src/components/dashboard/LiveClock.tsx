'use client';

import { useEffect, useState } from 'react';

/** Displays a live IST clock in the header — replaces the hardcoded timestamp. */
export default function LiveClock() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => setTime(
      new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        timeZone: 'Asia/Kolkata',
      })
    );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="text-[11px] font-mono font-medium text-slate-400 hidden sm:block tabular-nums">
      {time} IST
    </span>
  );
}
