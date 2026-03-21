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
    <Card className="bg-neutral-900 border-neutral-800 rounded-lg shadow-sm flex flex-col h-[320px] shrink-0">
      <CardHeader className="p-3 border-b border-neutral-800 bg-neutral-900/80">
        <CardTitle className="text-xs font-bold text-neutral-300 uppercase flex items-center gap-2">
          <Bot size={14} className="text-cyan-400" />
          Conversational Co-Pilot
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 flex flex-col flex-1 overflow-hidden">
        <ScrollArea className="flex-1 p-3" ref={scrollRef}>
          <div className="flex flex-col gap-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-2 text-xs ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${msg.sender === 'user' ? 'bg-neutral-700' : 'bg-cyan-900'}`}>
                  {msg.sender === 'user' ? <User size={12} className="text-neutral-300" /> : <Bot size={12} className="text-cyan-400" />}
                </div>
                <div className={`max-w-[85%] rounded p-2 ${msg.sender === 'user' ? 'bg-neutral-800 text-neutral-200 rounded-tr-none' : 'bg-neutral-950 border border-neutral-800 text-neutral-300 rounded-tl-none'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="p-2 border-t border-neutral-800 bg-neutral-950/50">
          <div className="flex gap-1 mb-2 overflow-x-auto pb-1 scrollbar-hide">
            {PREDEFINED_TUTORIAL_QUERIES.map((q, i) => (
              <button 
                key={i}
                onClick={() => handleSend(q)}
                className="shrink-0 text-[9px] bg-neutral-800 hover:bg-neutral-700 text-neutral-400 px-2 py-1 rounded-full whitespace-nowrap flex items-center gap-1 transition-colors"
              >
                <PlayCircle size={10} /> {q.substring(0, 25)}...
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
              className="h-8 text-xs bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-600 pr-8"
            />
            <Button 
              type="submit" 
              size="icon" 
              className="h-6 w-6 absolute right-1 top-1 bg-transparent hover:bg-neutral-800 text-cyan-500"
            >
              <SendHorizontal size={12} />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
