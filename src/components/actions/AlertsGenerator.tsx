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
    <div className="flex-1 flex flex-col h-full bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
      <div className="p-3 border-b border-neutral-800 bg-neutral-900/80 flex justify-between items-center">
        <h3 className="text-xs font-bold text-neutral-300 uppercase flex items-center gap-2">
          <Megaphone size={14} className="text-orange-400" />
          Public Comm Generator
        </h3>
        <Button size="sm" className="h-6 text-[10px] bg-orange-600 hover:bg-orange-500 text-white font-medium px-2 py-0">
          <Send size={10} className="mr-1" /> Publish All Contexts
        </Button>
      </div>

      <div className="flex-1 p-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="bg-neutral-950 border border-neutral-800 w-full justify-start h-8 mb-3">
            <TabsTrigger value="vms" className="text-[10px] uppercase tracking-wider data-[state=active]:bg-neutral-800"><RadioTower size={10} className="mr-1" /> VMS Sign</TabsTrigger>
            <TabsTrigger value="social" className="text-[10px] uppercase tracking-wider data-[state=active]:bg-neutral-800"><MessageSquare size={10} className="mr-1" /> Social</TabsTrigger>
            <TabsTrigger value="sms" className="text-[10px] uppercase tracking-wider data-[state=active]:bg-neutral-800"><Hand size={10} className="mr-1" /> SMS Advisory</TabsTrigger>
          </TabsList>

          <TabsContent value="vms" className="m-0 flex-1">
            <Card className="bg-neutral-950 border-neutral-800 h-full flex items-center justify-center p-4">
              <pre className="text-orange-500 font-mono text-center leading-loose font-bold bg-black w-full py-4 rounded-sm border-2 border-orange-900">
                {vmsDraft}
              </pre>
            </Card>
          </TabsContent>
          
          <TabsContent value="social" className="m-0 flex-1">
            <Textarea 
              className="w-full h-full min-h-[100px] bg-neutral-950 border-neutral-800 text-xs text-neutral-300 resize-none font-sans"
              defaultValue={socialDraft}
            />
          </TabsContent>
          
          <TabsContent value="sms" className="m-0 flex-1">
            <Textarea 
              className="w-full h-full min-h-[100px] bg-neutral-950 border-neutral-800 text-xs text-neutral-300 resize-none font-sans"
              defaultValue={smsDraft}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
