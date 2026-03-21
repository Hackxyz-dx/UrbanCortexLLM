'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSimulationStore } from '@/lib/store';
import { RadioTower, Send, CheckCircle2, RefreshCw, Sparkles } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export default function AlertsGenerator() {
  const {
    incident,
    alertDrafts,
    alertDraftsLoading,
    alertDraftsError,
    fetchAlertDrafts,
    publishAlert,
  } = useSimulationStore();

  const [activeTab, setActiveTab] = useState('vms');

  // Use LLM drafts if available, otherwise fall back to templates
  const vmsDraft    = alertDrafts?.vms    ?? `ACCIDENT AHEAD\nGJ-27 NEAR PDEU MAIN GATE\nUSE RING ROAD ALT ROUTE\nEXPECT ${incident.estimatedClearance} MIN DELAY`;
  const socialDraft = alertDrafts?.social ?? `[TRAFFIC ALERT] Multi-vehicle collision on Koba-Gandhinagar Hwy, near PDEU Main Gate, Sector-23.\n\nSTATUS: ${incident.blockedLanes} of ${incident.totalLanes} lanes blocked.\nACTION: Emergency crews on scene. Avoid area; use Sardar Patel Ring Road as alternate route.\nEST DELAY: ${incident.estimatedClearance} mins. #TrafficAlert #Gandhinagar`;
  const smsDraft    = alertDrafts?.sms    ?? `PDEU/GJ Alert: Severe crash near PDEU Main Gate, Koba-Gandhinagar Hwy. Heavy delays expected for ${incident.estimatedClearance} mins. Use Ring Road alternate.`;

  const sourceBadge = alertDrafts?.source === 'gemini'
    ? <span className="flex items-center gap-1 text-[10px] font-bold text-violet-700 uppercase tracking-widest bg-violet-50 px-2 py-0.5 rounded border border-violet-200"><Sparkles size={10} /> LLM</span>
    : alertDrafts?.source === 'mock'
    ? <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded border border-slate-200">Mock</span>
    : null;

  const renderPublishBadge = (published: boolean) =>
    published ? (
      <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
        <CheckCircle2 size={14} /> Published
      </span>
    ) : null;

  const handlePublish = () => {
    const channelMap: Record<string, 'vms' | 'social' | 'sms'> = { vms: 'vms', social: 'social', sms: 'sms' };
    const ch = channelMap[activeTab];
    if (ch) publishAlert(ch);
  };

  const isCurrentPublished = () => {
    if (activeTab === 'vms')    return incident.alerts.vmsPublished;
    if (activeTab === 'social') return incident.alerts.socialPublished;
    if (activeTab === 'sms')    return incident.alerts.smsPublished;
    return false;
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden h-full w-full min-h-0 min-w-0">
      <div className="flex-1 flex flex-col w-full h-full min-h-0 min-w-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col w-full min-h-0 min-w-0">

          {/* Tabs header */}
          <div className="flex flex-wrap items-center justify-between border-b border-slate-200 bg-slate-50 px-2 shrink-0 min-w-0">
            <TabsList className="bg-transparent border-none justify-start h-14 p-0 rounded-none overflow-x-auto w-auto flex-nowrap">
              <TabsTrigger value="vms"    className="text-sm uppercase tracking-widest font-bold data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full px-6 text-slate-500 hover:text-slate-700 relative shadow-none min-w-max">
                VMS Panel
                {incident.alerts.vmsPublished && <span className="absolute top-3 right-3 w-2 h-2 bg-emerald-500 rounded-full shadow-sm" />}
              </TabsTrigger>
              <TabsTrigger value="social" className="text-sm uppercase tracking-widest font-bold data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full px-6 text-slate-500 hover:text-slate-700 relative shadow-none min-w-max">
                Social
                {incident.alerts.socialPublished && <span className="absolute top-3 right-3 w-2 h-2 bg-emerald-500 rounded-full shadow-sm" />}
              </TabsTrigger>
              <TabsTrigger value="sms"    className="text-sm uppercase tracking-widest font-bold data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full px-6 text-slate-500 hover:text-slate-700 relative shadow-none min-w-max">
                SMS
                {incident.alerts.smsPublished && <span className="absolute top-3 right-3 w-2 h-2 bg-emerald-500 rounded-full shadow-sm" />}
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2 pr-3 shrink-0">
              {sourceBadge}
              {renderPublishBadge(isCurrentPublished())}
              {/* Generate button */}
              <Button
                size="sm"
                variant="outline"
                disabled={alertDraftsLoading}
                onClick={fetchAlertDrafts}
                className="h-9 text-xs bg-white hover:bg-violet-50 text-violet-700 hover:text-violet-800 font-bold uppercase tracking-wider px-4 py-0 rounded border border-violet-200 hover:border-violet-300 transition-colors shadow-sm disabled:opacity-50"
              >
                <RefreshCw size={13} className={`mr-1.5 ${alertDraftsLoading ? 'animate-spin' : ''}`} />
                {alertDraftsLoading ? 'Generating…' : 'Generate'}
              </Button>
              {/* Publish button */}
              <Button
                size="sm"
                disabled={isCurrentPublished() || alertDraftsLoading}
                onClick={handlePublish}
                className="h-9 text-xs bg-white hover:bg-slate-100 text-slate-700 hover:text-blue-700 font-bold uppercase tracking-wider px-5 py-0 rounded border border-slate-300 transition-colors disabled:opacity-50 shadow-sm"
              >
                <Send size={14} className="mr-2" />
                {isCurrentPublished() ? 'Sent' : 'Publish'}
              </Button>
            </div>
          </div>

          {/* Error banner */}
          {alertDraftsError && (
            <div className="px-4 py-2 text-xs text-red-700 bg-red-50 border-b border-red-100">
              {alertDraftsError}
            </div>
          )}

          {/* VMS */}
          <TabsContent value="vms" className="m-0 flex-1 flex flex-col p-4 md:p-6 bg-white overflow-y-auto min-h-0 min-w-0">
            <div className="border border-slate-200 bg-slate-50 flex-1 flex flex-col p-4 md:p-6 rounded-md w-full shadow-sm min-h-0 min-w-0">
              <span className="text-[10px] md:text-xs uppercase tracking-widest text-slate-500 font-bold mb-3 block border-b border-slate-200 pb-2 shrink-0">
                Hardware Preview: VMS Board GJ-27 (PDEU Campus Junction)
              </span>
              <pre className={`font-mono text-center leading-[1.6] md:leading-[1.8] text-sm md:text-lg font-bold bg-[#1a1a1a] w-full py-6 md:py-10 px-4 md:px-5 rounded border-2 tracking-widest uppercase whitespace-pre-wrap break-words flex-1 flex items-center justify-center transition-colors shadow-inner min-h-0 overflow-y-auto ${incident.alerts.vmsPublished ? 'text-emerald-400 border-emerald-500/50' : 'text-amber-400 border-amber-500/50'}`}>
                {vmsDraft}
              </pre>
            </div>
          </TabsContent>

          {/* Social */}
          <TabsContent value="social" className="m-0 flex-1 flex flex-col p-4 md:p-6 bg-white min-h-0 min-w-0">
            <Textarea
              className={`w-full flex-1 bg-slate-50 border-slate-200 text-sm resize-none font-sans p-4 md:p-5 leading-relaxed focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-md shadow-sm transition-colors min-h-0 overflow-y-auto ${incident.alerts.socialPublished ? 'text-emerald-700 font-medium bg-emerald-50/30' : 'text-slate-700'}`}
              defaultValue={socialDraft}
              key={socialDraft}
              readOnly={incident.alerts.socialPublished}
            />
          </TabsContent>

          {/* SMS */}
          <TabsContent value="sms" className="m-0 flex-1 flex flex-col p-4 md:p-6 bg-white min-h-0 min-w-0">
            <Textarea
              className={`w-full flex-1 bg-slate-50 border-slate-200 text-sm resize-none font-sans p-4 md:p-5 leading-relaxed focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-md shadow-sm transition-colors min-h-0 overflow-y-auto ${incident.alerts.smsPublished ? 'text-emerald-700 font-medium bg-emerald-50/30' : 'text-slate-700'}`}
              defaultValue={smsDraft}
              key={smsDraft}
              readOnly={incident.alerts.smsPublished}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
