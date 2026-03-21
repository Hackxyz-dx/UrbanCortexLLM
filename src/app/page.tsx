import { Metadata } from 'next';
import MapWidget from '@/components/map/MapWidget';
import IncidentSummary from '@/components/dashboard/IncidentSummary';
import AIRecommendations from '@/components/ai/AIRecommendations';
import CopilotChat from '@/components/copilot/CopilotChat';
import AlertsGenerator from '@/components/actions/AlertsGenerator';
import OperationLog from '@/components/dashboard/OperationLog';
import SimControls from '@/components/dashboard/SimControls';
import { LayoutDashboard, Map as MapIcon, ShieldAlert, Settings, Bell, UserCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'UrbanCortexLLM Operations — PDEU Gandhinagar',
  description: 'Intelligent Traffic Incident Command Co-Pilot — PDEU Gandhinagar, Gujarat',
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-slate-950 text-slate-200 overflow-hidden font-sans selection:bg-blue-900/50">

      {/* Sidebar Navigation */}
      <nav className="w-full h-14 md:w-16 md:h-full flex flex-row md:flex-col items-center justify-around md:justify-start py-2 md:py-4 px-4 md:px-0 bg-slate-900 border-t md:border-t-0 md:border-r border-slate-800 z-30 shrink-0 order-last md:order-first">
        <div className="w-10 h-10 bg-blue-700 text-white rounded flex items-center justify-center md:mb-6 shrink-0 hidden md:flex font-bold text-lg leading-none cursor-default">
          UC
        </div>
        <div className="flex flex-row md:flex-col gap-2 md:gap-4 w-full items-center justify-center md:flex-1">
          <button className="p-2.5 rounded text-blue-400 bg-slate-800/80 hover:bg-slate-800 transition-colors">
            <LayoutDashboard size={18} />
          </button>
          <button className="p-2.5 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-colors">
            <MapIcon size={18} />
          </button>
          <button className="p-2.5 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-colors">
            <ShieldAlert size={18} />
          </button>
        </div>
        <div className="flex flex-row md:flex-col gap-4 w-auto md:w-full items-center md:mt-auto hidden md:flex">
          <button className="p-2 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-colors">
            <Settings size={18} />
          </button>
        </div>
      </nav>

      <div className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 md:px-6 z-20 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-blue-700 text-white rounded flex items-center justify-center shrink-0 md:hidden font-bold text-sm">UC</div>
            <h1 className="text-[13px] font-bold tracking-wider text-slate-200 uppercase flex items-center gap-2 truncate">
              UrbanCortexLLM <span className="text-slate-600 font-normal">-</span> LLM For Traffic Management
            </h1>
            <div className="h-4 w-px bg-slate-700 mx-1 shrink-0"></div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-emerald-950/40 border border-emerald-900/50 shrink-0 hidden xs:flex">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              <span className="text-[10px] font-bold text-emerald-500 tracking-widest uppercase">System Active</span>
            </div>
            <div className="hidden sm:block text-[10px] font-mono text-slate-500 ml-1">| PDEU Gandhinagar, GJ</div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <SimControls />
            <button className="relative text-slate-400 hover:text-slate-200 transition-colors">
              <Bell size={16} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full border border-slate-900"></span>
            </button>
            <div className="h-7 w-7 rounded bg-slate-800 border border-slate-700 flex items-center justify-center">
              <UserCircle size={16} className="text-slate-400" />
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <div className="flex-1 flex flex-col xl:flex-row overflow-y-auto xl:overflow-hidden relative min-w-0">

          {/* Left Panel: Incident Context & Strategy */}
          <aside className="w-full xl:w-[380px] flex flex-col border-b xl:border-b-0 xl:border-r border-slate-800 bg-slate-950 z-10 xl:overflow-y-auto shrink-0 order-1 max-w-full">
            <div className="px-4 py-2 border-b border-slate-800 bg-slate-900 sticky top-0 z-10 flex items-center h-10">
              <h2 className="text-[10px] font-bold tracking-widest text-slate-400 uppercase flex items-center gap-2">
                <ShieldAlert size={12} className="text-slate-500" />
                Incident Context &amp; Strategy
              </h2>
            </div>
            <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
              <IncidentSummary />
              <AIRecommendations />
            </div>
          </aside>

          {/* Center: Map + Operation Log */}
          <main className="w-full xl:flex-1 flex flex-col relative bg-slate-900 min-w-0 shrink-0 order-2">
            <div className="flex-1 relative z-0 min-h-0" style={{ minHeight: '350px' }}>
              <MapWidget />
            </div>
            <OperationLog />
          </main>

          {/* Right Panel: Communications & Actions */}
          <aside className="w-full xl:w-[400px] flex flex-col border-t xl:border-t-0 xl:border-l border-slate-800 bg-slate-950 z-10 xl:overflow-y-auto shrink-0 order-3 max-w-full">
            <div className="px-4 py-2 border-b border-slate-800 bg-slate-900 sticky top-0 z-10 flex items-center h-10">
              <h2 className="text-[10px] font-bold tracking-widest text-slate-400 uppercase flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-sm bg-blue-500"></div>
                Command Support &amp; Actions
              </h2>
            </div>
            <div className="flex flex-col flex-1 min-w-0 bg-slate-950">
              <CopilotChat />
              <AlertsGenerator />
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
