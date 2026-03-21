'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, SendHorizontal, PlayCircle } from 'lucide-react';

type Message = {
  id: string;
  sender: 'user' | 'system';
  text: string;
};

// Mock simulated responses tailored to UrbanCortex MVP scenario
const PREDEFINED_TUTORIAL_QUERIES = [
  "Which diversion should go live first?",
  "What happens if we keep the road blocked for 10 more minutes?",
  "Is it safe to open the southbound lane now?"
];

export default function CopilotChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-0',
      sender: 'system',
      text: 'UrbanCortex Operator Co-Pilot initialized. How can I assist with Incident INC-2024-089?'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: Message = { id: Math.random().toString(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Generate smart mock response
    setTimeout(() => {
      let sysText = "I'm analyzing the network graph and historical flow data. Please refer to the tactical recommendations panel for the safest automated actions.";
      
      const lowerText = text.toLowerCase();
      if (lowerText.includes('diversion') || lowerText.includes('first')) {
        sysText = "Columbus Blvd Diversion ranks highest. It has 40% spare capacity and bypasses the main queue. I recommend activating it before signal retiming to prevent secondary intersection spillback.";
      } else if (lowerText.includes('blocked') || lowerText.includes('10 more minutes')) {
        sysText = "If blocked for 10 more minutes without intervention, the queue will reach the I-676 interchange, increasing secondary crash risk by 34% and adding 25 mins to average corridor delay.";
      } else if (lowerText.includes('safe') || lowerText.includes('open') || lowerText.includes('southbound')) {
        sysText = "Not yet. Based on CCTV feed analysis, emergency responders are still sweeping lane 2. Reopening now violates standing safety protocols. Estimated safe reopen time is in 12 minutes.";
      }

      setMessages(prev => [...prev, { id: Math.random().toString(), sender: 'system', text: sysText }]);
    }, 800);
  };

  return (
    <Card className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col h-[380px] shrink-0 transition-all hover:border-slate-600/60">
      <CardHeader className="p-4 border-b border-slate-700/50 bg-slate-800/40 sticky top-0 z-10">
        <CardTitle className="text-sm font-bold text-slate-200 uppercase flex items-center gap-2.5 tracking-wide">
          <div className="p-1.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
            <Bot size={16} className="text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]" />
          </div>
          Conversational Co-Pilot
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 flex flex-col flex-1 overflow-hidden bg-slate-950/20">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="flex flex-col gap-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-3 text-sm ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md ${msg.sender === 'user' ? 'bg-slate-700 border border-slate-600' : 'bg-cyan-900/60 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]'}`}>
                  {msg.sender === 'user' ? <User size={14} className="text-slate-200 shrink-0" /> : <Bot size={14} className="text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)] shrink-0" />}
                </div>
                <div className={`max-w-[85%] sm:max-w-[80%] break-words whitespace-pre-wrap min-w-0 rounded-xl p-3 shadow-md border ${msg.sender === 'user' ? 'bg-slate-800/90 border-slate-700 text-slate-100 rounded-tr-none' : 'bg-slate-900/90 border-cyan-900/50 text-cyan-50 rounded-tl-none shadow-[0_0_15px_rgba(6,182,212,0.1)] leading-relaxed font-medium tracking-wide'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="p-3 border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
          <div className="flex flex-wrap gap-2 mb-3 pb-1">
            {PREDEFINED_TUTORIAL_QUERIES.map((q, i) => (
              <button 
                key={i}
                onClick={() => handleSend(q)}
                className="text-xs font-medium bg-slate-800/80 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/50 hover:shadow-[0_0_10px_rgba(6,182,212,0.2)] hover:text-cyan-300 text-slate-300 px-3 py-1.5 rounded-full text-left flex items-start gap-1.5 transition-all text-wrap"
              >
                <PlayCircle size={14} className="text-cyan-500/70 shrink-0 mt-0.5" /> 
                <span className="leading-tight">{q}</span>
              </button>
            ))}
          </div>
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(inputText); }}
            className="flex gap-2 relative"
          >
            <Input 
              placeholder="Ask for operational support..." 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="h-10 text-sm bg-slate-950/80 border-slate-700/80 text-white placeholder:text-slate-500 pr-10 focus-visible:ring-1 focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500/50 shadow-inner rounded-lg"
            />
            <Button 
              type="submit" 
              size="icon" 
              className="h-8 w-8 absolute right-1 top-1 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-400 hover:text-cyan-300 hover:shadow-[0_0_10px_rgba(6,182,212,0.4)] transition-all rounded-md border border-cyan-500/30"
            >
              <SendHorizontal size={16} />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
