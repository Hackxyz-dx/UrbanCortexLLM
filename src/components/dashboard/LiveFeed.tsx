'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, Radio, TriangleAlert, Info } from 'lucide-react';
import { useEffect, useState } from 'react';

type FeedItem = { id: string; source: string; text: string; time: string; type: 'alert' | 'info' | 'critical' };

const mockInitialFeeds: FeedItem[] = [
  { id: 'f1', source: 'CCTV-45', text: 'Queue length extended past Market St.', time: 'Just now', type: 'critical' },
  { id: 'f2', source: 'Waze API', text: 'Heavy congestion reported on adjacent local roads.', time: '1 min ago', type: 'alert' },
  { id: 'f3', source: 'Police Hub', text: 'Units 22 and 41 arrived at scene.', time: '4 mins ago', type: 'info' },
  { id: 'f4', source: 'Sensor-Loop', text: 'Speed dropped to 4mph uniformly.', time: '5 mins ago', type: 'alert' },
];

export default function LiveFeed() {
  const [feeds, setFeeds] = useState<FeedItem[]>(mockInitialFeeds);

  // Simulated live feed injection
  useEffect(() => {
    const timer = setInterval(() => {
      setFeeds(prev => {
        const newFeed: FeedItem = {
          id: Math.random().toString(),
          source: 'System',
          text: 'Traffic conditions re-evaluating...',
          time: 'Just now',
          type: 'info'
        };
        return [newFeed, ...prev].slice(0, 10);
      });
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const getIcon = (type: string) => {
    switch(type) {
      case 'critical': return <TriangleAlert size={14} className="text-red-500" />;
      case 'alert': return <Activity size={14} className="text-orange-400" />;
      default: return <Info size={14} className="text-cyan-500" />;
    }
  };

  return (
    <Card className="bg-neutral-900 border-neutral-800 rounded-lg shadow-sm flex flex-col h-full flex-1">
      <CardHeader className="p-3 border-b border-neutral-800 bg-neutral-900/80">
        <CardTitle className="text-xs font-bold text-neutral-300 uppercase flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Radio size={14} className="text-green-500 animate-pulse" />
            Live Data Feed
          </span>
          <span className="text-[10px] text-green-500/70 lowercase font-normal flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            Streaming
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-[250px] w-full p-3">
          <div className="flex flex-col gap-3">
            {feeds.map(feed => (
              <div key={feed.id} className="flex gap-3 group">
                <div className="mt-0.5">{getIcon(feed.type)}</div>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{feed.source}</span>
                    <span className="text-[10px] text-neutral-600">{feed.time}</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-snug">{feed.text}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
