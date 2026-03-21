import { Metadata } from 'next';
import MapWidget from '@/components/map/MapWidget';
import IncidentSummary from '@/components/dashboard/IncidentSummary';
import RiskIntelligence from '@/components/dashboard/RiskIntelligence';
import LiveFeed from '@/components/dashboard/LiveFeed';
import AIRecommendations from '@/components/ai/AIRecommendations';
import CopilotChat from '@/components/copilot/CopilotChat';
import AlertsGenerator from '@/components/actions/AlertsGenerator';
import TimelineView from '@/components/dashboard/TimelineView';
import AfterActionReport from '@/components/dashboard/AfterActionReport';
import DemoControls from '@/components/dashboard/DemoControls';

export const metadata: Metadata = {
  title: 'UrbanCortexLLM Dashboard',
  description: 'Intelligent Traffic Incident Command Co-Pilot',
};

export default function DashboardPage() {
  return (
    <div className="flex h-screen w-full bg-neutral-950 text-neutral-50 overflow-hidden font-sans relative">
      <DemoControls />
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
            <AfterActionReport />
          </div>
        </div>
        <div className="p-4 flex-1 flex flex-col gap-4">
          <IncidentSummary />
          <RiskIntelligence />
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
