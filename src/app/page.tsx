import { Metadata } from 'next';
import MapWidget from '@/components/map/MapWidget';
import IncidentSummary from '@/components/dashboard/IncidentSummary';
import LiveFeed from '@/components/dashboard/LiveFeed';
import AIRecommendations from '@/components/ai/AIRecommendations';
import CopilotChat from '@/components/copilot/CopilotChat';
import AlertsGenerator from '@/components/actions/AlertsGenerator';
import TimelineView from '@/components/dashboard/TimelineView';

export const metadata: Metadata = {
  title: 'UrbanCortexLLM Dashboard',
  description: 'Intelligent Traffic Incident Command Co-Pilot',
};

export default function DashboardPage() {
  return (
    <div className="flex h-screen w-full bg-neutral-950 text-neutral-50 overflow-hidden font-sans">
      {/* Left Panel: Incident Summary & Live Feed */}
      <aside className="w-[380px] flex flex-col border-r border-neutral-800 bg-neutral-900 pb-4 h-full relative z-20 shadow-xl overflow-y-auto">
        <div className="p-4 border-b border-neutral-800 bg-neutral-950/50 p-4 sticky top-0 z-10 backdrop-blur">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                UrbanCortex<span className="text-cyan-400">LLM</span>
              </h1>
              <p className="text-xs text-neutral-400 mt-1">Incident Command Co-Pilot</p>
            </div>
            <button className="flex items-center gap-1 bg-neutral-800 hover:bg-neutral-700 text-[10px] font-medium text-neutral-300 py-1 px-2 rounded border border-neutral-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              Export AAR
            </button>
          </div>
        </div>
        <div className="p-4 flex-1 flex flex-col gap-4">
          <IncidentSummary />
          <LiveFeed />
        </div>
      </aside>

      {/* Center: Map Visualization & Bottom Panels */}
      <main className="flex-1 flex flex-col relative bg-black">
        {/* Map Layer */}
        <div className="flex-1 relative z-0">
          <MapWidget />
        </div>

        {/* Bottom Panel: Timeline & Public Alerts */}
        <div className="h-[280px] border-t border-neutral-800 bg-neutral-900/80 p-4 relative z-20 backdrop-blur flex gap-4">
          <AlertsGenerator />
          <TimelineView />
        </div>
      </main>

      {/* Right Panel: AI Recommender & Copilot */}
      <aside className="w-[420px] flex flex-col border-l border-neutral-800 bg-neutral-900 pb-4 h-full relative z-20 shadow-xl overflow-y-auto">
        <div className="p-4 border-b border-neutral-800 bg-neutral-950/50 p-4 sticky top-0 z-10 backdrop-blur">
          <h2 className="text-sm font-bold tracking-wide text-neutral-200 uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
            AI Tactical Engine
          </h2>
        </div>
        <div className="p-4 flex flex-col gap-4 flex-1">
          <AIRecommendations />
          <CopilotChat />
        </div>
      </aside>
    </div>
  );
}
