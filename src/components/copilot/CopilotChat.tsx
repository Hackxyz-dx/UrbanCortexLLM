'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Terminal, SendHorizontal } from 'lucide-react';
import { useSimulationStore } from '@/lib/store';

const PREDEFINED_QUERIES = [
  "Which diversion should go live first?",
  "Is it safe to open the southbound lane now?",
  "What is the current incident status?"
];

export default function CopilotChat() {
  const { chatMessages, sendChatMessage } = useSimulationStore();
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    sendChatMessage(text);
    setInputText('');
  };

  return (
    <Card className="bg-slate-950 border-0 rounded-none flex flex-col h-[360px] shrink-0">
      <CardHeader className="p-3 border-b border-slate-800 bg-slate-900 sticky top-0 z-10 h-11 flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-bold text-slate-300 uppercase flex items-center gap-2 tracking-widest leading-none">
          <Terminal size={14} className="text-slate-500" />
          Tactical Query Console
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 flex flex-col flex-1 overflow-hidden bg-slate-950">
        <ScrollArea className="flex-1 p-0" ref={scrollRef}>
          <div className="flex flex-col">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`px-4 py-3 border-b border-slate-800/50 flex gap-3 text-sm items-start ${
                  msg.sender === 'user' ? 'bg-slate-900/30' : 'bg-slate-950'
                }`}
              >
                <div className={`shrink-0 text-[10px] font-bold tracking-widest uppercase mt-0.5 ${msg.sender === 'user' ? 'text-slate-500' : 'text-blue-500'}`}>
                  {msg.sender === 'user' ? 'OPR' : 'SYS'}
                </div>
                <div className={`leading-relaxed font-mono whitespace-pre-wrap break-words min-w-0 ${msg.isLoading ? 'text-slate-600 animate-pulse' : msg.sender === 'user' ? 'text-slate-300' : 'text-slate-400'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-3 border-t border-slate-800 bg-slate-950">
          <div className="flex flex-wrap gap-2 mb-3">
            {PREDEFINED_QUERIES.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="text-xs font-mono bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors text-slate-400 hover:text-slate-300 px-2.5 py-1 rounded-sm text-left truncate max-w-full"
                title={q}
              >
                &gt; {q}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(inputText); }}
            className="flex gap-2 relative"
          >
            <Input
              placeholder="Enter system query..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="h-9 text-sm font-mono bg-slate-900 border-slate-800 text-white placeholder:text-slate-600 rounded-sm focus-visible:ring-1 focus-visible:ring-blue-600 focus-visible:border-blue-600 pr-8 shadow-none"
            />
            <Button
              type="submit"
              size="icon"
              className="h-8 w-8 absolute right-0 top-0 bg-blue-600 hover:bg-blue-700 text-white transition-colors rounded-r-sm rounded-l-none border-0"
            >
              <SendHorizontal size={14} />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
