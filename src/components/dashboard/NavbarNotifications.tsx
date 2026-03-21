'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Clock, ShieldAlert, Radio, Activity, CheckCircle2, MessageSquare } from 'lucide-react';
import { useSimulationStore } from '@/lib/store';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { TimelineEvent } from '@/data/mockIncident';

const eventIcon = (type: TimelineEvent['type']) => {
  switch (type) {
    case 'approval': return <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />;
    case 'alert': return <Radio size={16} className="text-amber-600 shrink-0 mt-0.5" />;
    case 'chat': return <MessageSquare size={16} className="text-blue-600 shrink-0 mt-0.5" />;
    case 'simulation': return <Activity size={16} className="text-slate-400 shrink-0 mt-0.5" />;
    case 'incident': return <ShieldAlert size={16} className="text-red-500 shrink-0 mt-0.5" />;
    default: return <Clock size={16} className="text-slate-400 shrink-0 mt-0.5" />;
  }
};

export default function NavbarNotifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [lastSeenCount, setLastSeenCount] = useState(0);
  const timeline = useSimulationStore(s => s.incident.timeline);
  const popoverRef = useRef<HTMLDivElement>(null);

  const unreadCount = Math.max(0, timeline.length - lastSeenCount);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const toggleOpen = () => {
    if (!isOpen) {
      setLastSeenCount(timeline.length); // mark as read
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button 
        onClick={toggleOpen}
        className="relative text-slate-500 hover:text-slate-800 transition-colors focus:outline-none flex items-center justify-center p-1 rounded-full hover:bg-slate-100"
        title="Notifications"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 rounded-full border-2 border-white shadow-sm text-[10px] font-bold text-white flex items-center justify-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-3 w-[360px] bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Bell size={16} className="text-slate-400" />
              Notifications
            </h3>
            <span className="text-xs text-slate-400 font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
               {timeline.length} Total
            </span>
          </div>
          
          <ScrollArea className="max-h-[400px] w-full bg-white">
            {timeline.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-500 flex flex-col items-center gap-3">
                <Bell size={32} className="text-slate-300 opacity-50" />
                No system alerts yet.
              </div>
            ) : (
              <div className="flex flex-col-reverse divide-y--[1px] divide-slate-50">
                {[...timeline].reverse().slice(0, 50).map(event => (
                  <div key={event.id} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50/80 transition-colors cursor-default">
                    <div className="mt-0.5">{eventIcon(event.type)}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-700 leading-snug font-medium mb-1.5 break-words">
                        {event.message}
                      </p>
                      <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">
                        {event.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
