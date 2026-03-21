'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SendHorizontal } from 'lucide-react';
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
    <div className="bg-white flex flex-col h-full w-full overflow-hidden">
      <div className="flex-1 overflow-hidden flex flex-col relative w-full">
        <ScrollArea className="flex-1 w-full" ref={scrollRef}>
          <div className="flex flex-col p-5 w-full max-w-full overflow-hidden">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`py-3 flex gap-3.5 text-base items-start mb-5 w-full ${
                  msg.sender === 'user' ? '' : ''
                }`}
              >
                <div className={`shrink-0 text-xs font-bold tracking-widest uppercase mt-1 border px-2 py-0.5 rounded ${msg.sender === 'user' ? 'text-slate-500 border-slate-200 bg-slate-50' : 'text-blue-700 border-blue-200 bg-blue-50'}`}>
                  {msg.sender === 'user' ? 'OPR' : 'SYS'}
                </div>
                <div className={`leading-relaxed whitespace-pre-wrap break-words min-w-0 flex-1 pr-2 ${
                  msg.isLoading ? 'text-slate-400 animate-pulse' 
                  : msg.sender === 'user' ? 'text-slate-700 font-medium' 
                  : 'text-slate-800 font-mono text-sm bg-slate-50/50 p-3.5 rounded-lg border border-slate-100'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-5 border-t border-slate-100 bg-slate-50 w-full shrink-0">
          <div className="flex flex-wrap gap-2.5 mb-4 w-full">
            {PREDEFINED_QUERIES.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="text-sm font-medium bg-white hover:bg-slate-100 border border-slate-200 transition-colors text-slate-600 hover:text-slate-800 px-4 py-2 rounded-full text-left truncate max-w-full shadow-sm shrink-0"
                title={q}
              >
                {q}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(inputText); }}
            className="flex gap-2 relative w-full"
          >
            <Input
              placeholder="Enter system query..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="h-12 text-base bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-md focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 pr-12 shadow-sm"
            />
            <Button
              type="submit"
              size="icon"
              className="h-12 w-12 absolute right-0 top-0 bg-blue-600 hover:bg-blue-700 text-white transition-colors rounded-r-md rounded-l-none border-0 shadow-none"
            >
              <SendHorizontal size={18} />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
