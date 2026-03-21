'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSimulationStore } from '@/lib/store';
import { Megaphone, MessageSquare, RadioTower, Hand, Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export default function AlertsGenerator() {
  const incident = useSimulationStore(state => state.incident);
  const [activeTab, setActiveTab] = useState('vms');

  const vmsDraft = `ACCIDENT AHEAD\nI-95 NORTH\nUSE COLUMBUS BLVD\nEXPECT ${incident.estimatedClearance} MIN DELAY`;
  const socialDraft = `🚨 Major Traffic Alert 🚨\nMulti-vehicle collision on ${incident.location.desc}. ${incident.blockedLanes} lanes blocked. Emergency crews on scene. Please avoid the area and use Columbus Blvd as an alternative route. Estimated delay: ${incident.estimatedClearance} mins. #UrbanCortex #TrafficAlert`;
  const smsDraft = `City Alert: Avoid I-95 North at Exit 22 due to severe crash. Heavy delays expected for the next ${incident.estimatedClearance} mins.`;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all hover:border-slate-600/60">
      <div className="p-4 border-b border-slate-700/50 bg-slate-800/40 flex justify-between items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <h3 className="text-sm font-bold text-slate-200 uppercase flex items-center gap-2.5 tracking-wide relative z-10">
          <div className="p-1.5 rounded-md bg-orange-500/10 border border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.2)]">
            <Megaphone size={16} className="text-orange-400 drop-shadow-[0_0_5px_rgba(249,115,22,0.8)]" />
          </div>
          Public Comm Generator
        </h3>
        <Button size="sm" className="h-8 text-xs bg-orange-600/90 hover:bg-orange-500 text-white font-semibold px-3 py-0 rounded-lg shadow-[0_0_10px_rgba(249,115,22,0.3)] hover:shadow-[0_0_15px_rgba(249,115,22,0.5)] transition-all border border-orange-400/50 relative z-10">
          <Send size={12} className="mr-1.5" /> Publish All Contexts
        </Button>
      </div>

      <div className="flex-1 p-4 bg-slate-950/20 flex flex-col h-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="bg-slate-950/80 border border-slate-700/80 w-full justify-start h-10 mb-4 p-1 rounded-lg">
            <TabsTrigger value="vms" className="text-xs uppercase tracking-wider font-semibold data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md transition-all"><RadioTower size={12} className="mr-1.5" /> VMS Sign</TabsTrigger>
            <TabsTrigger value="social" className="text-xs uppercase tracking-wider font-semibold data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md transition-all"><MessageSquare size={12} className="mr-1.5" /> Social</TabsTrigger>
            <TabsTrigger value="sms" className="text-xs uppercase tracking-wider font-semibold data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md transition-all"><Hand size={12} className="mr-1.5" /> SMS Advisory</TabsTrigger>
          </TabsList>

          <TabsContent value="vms" className="m-0 flex-1 h-full flex flex-col min-w-0">
            <Card className="bg-slate-950 border-slate-700/80 h-full flex items-center justify-center p-5 rounded-lg shadow-inner min-w-0 overflow-hidden">
              <pre className="text-orange-500 font-mono text-center leading-[2] text-sm sm:text-lg font-bold bg-[#110500] w-full py-8 px-4 rounded-md border border-orange-900/50 shadow-[0_0_20px_rgba(249,115,22,0.15)_inset,0_0_10px_rgba(249,115,22,0.2)] drop-shadow-[0_0_5px_rgba(249,115,22,0.8)] tracking-widest uppercase whitespace-pre-wrap break-words min-w-0 max-w-full">
                {vmsDraft}
              </pre>
            </Card>
          </TabsContent>
          
          <TabsContent value="social" className="m-0 flex-1 h-full flex flex-col">
            <Textarea 
              className="w-full flex-1 min-h-[140px] bg-slate-950/80 border-slate-700/80 text-sm text-slate-200 resize-none font-sans p-4 leading-relaxed focus-visible:ring-1 focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500/50 rounded-lg shadow-inner"
              defaultValue={socialDraft}
            />
          </TabsContent>
          
          <TabsContent value="sms" className="m-0 flex-1 h-full flex flex-col">
            <Textarea 
              className="w-full flex-1 min-h-[140px] bg-slate-950/80 border-slate-700/80 text-sm text-slate-200 resize-none font-sans p-4 leading-relaxed focus-visible:ring-1 focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500/50 rounded-lg shadow-inner"
              defaultValue={smsDraft}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
