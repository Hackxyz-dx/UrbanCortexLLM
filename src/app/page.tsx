import { Metadata } from 'next';
import MapWidget from '@/components/map/MapWidget';
import IncidentSummary from '@/components/dashboard/IncidentSummary';
import AIRecommendations from '@/components/ai/AIRecommendations';
import CopilotChat from '@/components/copilot/CopilotChat';
import AlertsGenerator from '@/components/actions/AlertsGenerator';
import { LayoutDashboard, Map as MapIcon, ShieldAlert, Activity, Settings, Bell, UserCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'UrbanCortexLLM Dashboard',
  description: 'Intelligent Traffic Incident Command Co-Pilot',
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-slate-950 text-slate-50 overflow-hidden font-sans selection:bg-cyan-500/30">
      
      {/* Sidebar Navigation - Responsive (Bottom bar on mobile, Sidebar on md) */}
      <nav className="w-full h-16 md:w-16 md:h-full flex flex-row md:flex-col items-center justify-around md:justify-start py-2 md:py-4 px-4 md:px-0 bg-slate-950 border-t md:border-t-0 md:border-r border-slate-800/80 z-30 shrink-0 md:shadow-2xl shadow-black/50 order-last md:order-first">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center md:mb-8 shadow-[0_0_15px_rgba(6,182,212,0.4)] shrink-0 hidden md:flex">
          <Activity size={24} className="text-white relative z-10" />
        </div>
        <div className="flex flex-row md:flex-col gap-2 md:gap-6 w-full items-center justify-center md:flex-1">
          <button className="p-2.5 rounded-xl bg-slate-800 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)] transition-all">
            <LayoutDashboard size={20} />
          </button>
          <button className="p-2.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 transition-all">
            <MapIcon size={20} />
          </button>
          <button className="p-2.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 transition-all">
            <ShieldAlert size={20} />
          </button>
        </div>
        <div className="flex flex-row md:flex-col gap-4 w-auto md:w-full items-center md:mt-auto hidden md:flex">
          <button className="p-2 rounded-xl text-slate-400 hover:text-slate-100 transition-all">
            <Settings size={20} />
          </button>
        </div>
      </nav>

      <div className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-14 bg-slate-900/60 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between px-4 md:px-6 z-20 shrink-0">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)] shrink-0 md:hidden mr-1">
              <Activity size={18} className="text-white relative z-10" />
            </div>
            <h1 className="text-base md:text-lg font-bold tracking-tight text-white flex items-center gap-1 md:gap-2 truncate">
              UrbanCortex<span className="text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] hidden sm:inline">LLM</span>
            </h1>
            <div className="h-4 w-px bg-slate-700 mx-1 md:mx-2 shrink-0"></div>
            <div className="flex items-center gap-1.5 md:gap-2 px-2 py-0.5 md:py-1 rounded-full bg-green-500/10 border border-green-500/20 shrink-0 hidden xs:flex">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] md:text-[11px] font-medium text-green-400 tracking-wide uppercase whitespace-nowrap">Active</span>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-4 shrink-0">
            <button className="relative text-slate-400 hover:text-white transition-colors">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center">
              <UserCircle size={18} className="text-slate-300" />
            </div>
          </div>
        </header>

        {/* Main Dashboard Content - Responsive Stack/Row */}
        <div className="flex-1 flex flex-col xl:flex-row overflow-y-auto xl:overflow-hidden relative min-w-0">
          
          {/* Left Panel: Incident Context & Reasoning */}
          <aside className="w-full xl:w-[360px] flex flex-col border-b xl:border-b-0 xl:border-r border-slate-800/60 bg-slate-900/30 backdrop-blur-sm z-10 xl:overflow-y-auto shrink-0 transition-all order-1 max-w-full">
            <div className="p-4 border-b border-slate-800/60 bg-slate-900/80 sticky top-0 z-10 backdrop-blur-md">
              <h2 className="text-xs font-bold tracking-widest text-slate-300 uppercase flex items-center gap-2">
                <ShieldAlert size={14} className="text-cyan-400" />
                Incident Command
              </h2>
            </div>
            <div className="p-4 flex-1 flex flex-col gap-4 min-w-0">
              <IncidentSummary />
              <AIRecommendations />
            </div>
          </aside>

          {/* Center: Map Visualization */}
          <main className="w-full h-[450px] xl:h-auto xl:flex-1 flex flex-col relative bg-black/50 min-w-0 ring-1 ring-slate-800/50 inset-shadow-sm shrink-0 order-2">
            <div className="flex-1 relative z-0 min-h-0">
              <MapWidget />
            </div>
          </main>

          {/* Right Panel: Communications & Narrative */}
          <aside className="w-full xl:w-[400px] flex flex-col border-t xl:border-t-0 xl:border-l border-slate-800/60 bg-slate-900/30 backdrop-blur-sm z-10 xl:overflow-y-auto shrink-0 transition-all order-3 max-w-full">
             <div className="p-4 border-b border-slate-800/60 bg-slate-900/80 sticky top-0 z-10 backdrop-blur-md">
              <h2 className="text-xs font-bold tracking-widest text-slate-300 uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse"></span>
                Action & Comm
              </h2>
            </div>
            <div className="p-4 flex flex-col gap-4 flex-1 min-w-0">
              <CopilotChat />
              <AlertsGenerator />
            </div>
          </aside>
          
        </div>
      </div>
    </div>
  );
}
