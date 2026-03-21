'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSimulationStore } from '@/lib/store';
import { RadioTower, Send, CheckCircle2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export default function AlertsGenerator() {
  const { incident, publishAlert } = useSimulationStore();
  const [activeTab, setActiveTab] = useState('vms');

  const vmsDraft = `ACCIDENT AHEAD\nGJ-27 NEAR PDEU MAIN GATE\nUSE RING ROAD ALT ROUTE\nEXPECT ${incident.estimatedClearance} MIN DELAY`;
  const socialDraft = `[TRAFFIC ALERT] Multi-vehicle collision on Koba-Gandhinagar Hwy, near PDEU Main Gate, Sector-23.\n\nSTATUS: ${incident.blockedLanes} of ${incident.totalLanes} lanes blocked.\nACTION: Emergency crews on scene. Avoid area; use Sardar Patel Ring Road as alternate route.\nEST DELAY: ${incident.estimatedClearance} mins.`;
  const smsDraft = `PDEU/GJ Alert: Severe crash near PDEU Main Gate, Koba-Gandhinagar Hwy. Heavy delays expected for ${incident.estimatedClearance} mins. Use Ring Road alternate.`;

  const renderPublishBadge = (published: boolean) =>
    published ? (
      <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
        <CheckCircle2 size={10} /> Published
      </span>
    ) : null;

  const handlePublish = () => {
    const channelMap: Record<string, 'vms' | 'social' | 'sms'> = { vms: 'vms', social: 'social', sms: 'sms' };
    const ch = channelMap[activeTab];
    if (ch) publishAlert(ch);
  };

  const isCurrentPublished = () => {
    if (activeTab === 'vms') return incident.alerts.vmsPublished;
    if (activeTab === 'social') return incident.alerts.socialPublished;
    if (activeTab === 'sms') return incident.alerts.smsPublished;
    return false;
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 border-0 rounded-none overflow-hidden">
      <div className="p-3 border-b border-slate-800 bg-slate-900 flex justify-between items-center h-10">
        <h3 className="text-[11px] font-bold text-slate-300 uppercase flex items-center gap-2 tracking-widest">
          <RadioTower size={14} className="text-slate-500" />
          Public Comm Drafts
        </h3>
        <div className="flex items-center gap-3">
          {renderPublishBadge(isCurrentPublished())}
          <Button
            size="sm"
            disabled={isCurrentPublished()}
            onClick={handlePublish}
            className="h-6 text-[10px] bg-slate-800 hover:bg-emerald-700 text-slate-300 hover:text-white font-bold uppercase tracking-wider px-3 py-0 rounded-sm border border-slate-700 hover:border-emerald-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={10} className="mr-1.5" />
            {isCurrentPublished() ? 'Sent' : 'Publish'}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="bg-slate-950 border-b border-slate-800 w-full justify-start h-9 p-0 rounded-none">
            <TabsTrigger
              value="vms"
              className="text-[10px] uppercase tracking-widest font-bold data-[state=active]:bg-slate-900 data-[state=active]:text-slate-200 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none h-full px-4 text-slate-500 hover:text-slate-400 relative"
            >
              VMS Panel
              {incident.alerts.vmsPublished && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
            </TabsTrigger>
            <TabsTrigger
              value="social"
              className="text-[10px] uppercase tracking-widest font-bold data-[state=active]:bg-slate-900 data-[state=active]:text-slate-200 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none h-full px-4 text-slate-500 hover:text-slate-400 relative"
            >
              Social
              {incident.alerts.socialPublished && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
            </TabsTrigger>
            <TabsTrigger
              value="sms"
              className="text-[10px] uppercase tracking-widest font-bold data-[state=active]:bg-slate-900 data-[state=active]:text-slate-200 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none h-full px-4 text-slate-500 hover:text-slate-400 relative"
            >
              SMS
              {incident.alerts.smsPublished && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vms" className="m-0 flex-1 flex flex-col min-w-0 p-4 bg-slate-950">
            <Card className="bg-slate-900 border-slate-800 flex-1 flex flex-col p-4 rounded-sm min-w-0 overflow-hidden shadow-none">
              <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-3 block border-b border-slate-800 pb-2">
                Hardware Preview: VMS Board GJ-27 (PDEU Campus Junction)
              </span>
              <pre className={`font-mono text-center leading-[1.8] text-sm font-bold bg-[#0a0500] w-full py-6 px-4 rounded-sm border tracking-widest uppercase whitespace-pre-wrap flex-1 flex items-center justify-center transition-colors ${incident.alerts.vmsPublished ? 'text-emerald-400 border-emerald-900/60' : 'text-amber-500 border-amber-900/40'}`}>
                {vmsDraft}
              </pre>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="m-0 flex-1 flex flex-col p-4 bg-slate-950">
            <Textarea
              className={`w-full flex-1 bg-slate-900 border-slate-800 text-[12px] resize-none font-sans p-3 leading-relaxed focus-visible:ring-1 focus-visible:ring-blue-600 focus-visible:border-blue-600 rounded-sm shadow-none transition-colors ${incident.alerts.socialPublished ? 'text-emerald-400' : 'text-slate-300'}`}
              defaultValue={socialDraft}
              readOnly={incident.alerts.socialPublished}
            />
          </TabsContent>

          <TabsContent value="sms" className="m-0 flex-1 flex flex-col p-4 bg-slate-950">
            <Textarea
              className={`w-full flex-1 bg-slate-900 border-slate-800 text-[12px] resize-none font-sans p-3 leading-relaxed focus-visible:ring-1 focus-visible:ring-blue-600 focus-visible:border-blue-600 rounded-sm shadow-none transition-colors ${incident.alerts.smsPublished ? 'text-emerald-400' : 'text-slate-300'}`}
              defaultValue={smsDraft}
              readOnly={incident.alerts.smsPublished}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
