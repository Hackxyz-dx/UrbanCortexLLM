'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import MapWidget from '@/components/map/MapWidget';
import IncidentSummary from '@/components/dashboard/IncidentSummary';
import AIRecommendations from '@/components/ai/AIRecommendations';
import CopilotChat from '@/components/copilot/CopilotChat';
import AlertsGenerator from '@/components/actions/AlertsGenerator';
import OperationLog from '@/components/dashboard/OperationLog';
import SimControls from '@/components/dashboard/SimControls';
import LiveClock from '@/components/dashboard/LiveClock';
import {
  LayoutDashboard, Map as MapIcon, ShieldAlert,
  Bell, UserCircle, MessageSquare, Radio, Clock,
} from 'lucide-react';

// ─── Panel IDs ────────────────────────────────────────────────────────────────

type PanelId = 'incident' | 'recommendations' | 'map' | 'log' | 'chat' | 'alerts';

interface PanelState {
  incident: boolean;
  recommendations: boolean;
  map: boolean;
  log: boolean;
  chat: boolean;
  alerts: boolean;
}

const DEFAULT_PANELS: PanelState = {
  incident: true,
  recommendations: true,
  map: true,
  log: true,
  chat: true,
  alerts: true,
};

// ─── Sidebar button helper ────────────────────────────────────────────────────

function SidebarBtn({
  icon, label, active, onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`w-10 h-10 flex flex-col items-center justify-center gap-0.5 rounded transition-colors group
        ${active
          ? 'bg-blue-700/30 text-blue-400 border border-blue-700/50'
          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 border border-transparent'}`}
    >
      {icon}
      <span className="text-[8px] font-bold uppercase tracking-widest leading-none">{label}</span>
    </button>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [panels, setPanels] = useState<PanelState>(DEFAULT_PANELS);

  const toggle = (id: PanelId) =>
    setPanels(prev => ({ ...prev, [id]: !prev[id] }));

  const leftVisible  = panels.incident || panels.recommendations;
  const centerVisible = panels.map || panels.log;
  const rightVisible = panels.chat || panels.alerts;

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-slate-950 text-slate-200 overflow-hidden font-sans selection:bg-blue-900/50">

      {/* ── Sidebar ────────────────────────────────────────────────────── */}
      <nav className="w-full h-auto md:w-[72px] md:h-full flex flex-row md:flex-col items-center justify-around md:justify-start py-2 md:py-4 px-2 md:px-0 bg-slate-900 border-t md:border-t-0 md:border-r border-slate-800 z-30 shrink-0 order-last md:order-first gap-1 md:gap-2">

        {/* Logo */}
        <div className="w-10 h-10 bg-blue-700 text-white rounded flex items-center justify-center md:mb-4 shrink-0 hidden md:flex font-bold text-base leading-none cursor-default select-none">
          UC
        </div>

        {/* Panel toggles */}
        <div className="flex flex-row md:flex-col gap-1.5 md:gap-2 items-center md:flex-1">
          <SidebarBtn
            icon={<ShieldAlert size={16} />}
            label="Incident"
            active={panels.incident}
            onClick={() => toggle('incident')}
          />
          <SidebarBtn
            icon={<LayoutDashboard size={16} />}
            label="Strategy"
            active={panels.recommendations}
            onClick={() => toggle('recommendations')}
          />
          <SidebarBtn
            icon={<MapIcon size={16} />}
            label="Map"
            active={panels.map}
            onClick={() => toggle('map')}
          />
          <SidebarBtn
            icon={<Clock size={16} />}
            label="Log"
            active={panels.log}
            onClick={() => toggle('log')}
          />
          <SidebarBtn
            icon={<MessageSquare size={16} />}
            label="Chat"
            active={panels.chat}
            onClick={() => toggle('chat')}
          />
          <SidebarBtn
            icon={<Radio size={16} />}
            label="Alerts"
            active={panels.alerts}
            onClick={() => toggle('alerts')}
          />
        </div>

        {/* Bottom: user avatar */}
        <div className="hidden md:flex md:mt-auto items-center justify-center pb-2">
          <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center">
            <UserCircle size={18} className="text-slate-400" />
          </div>
        </div>
      </nav>

      {/* ── Main area ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-hidden">

        {/* Top Navbar */}
        <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 md:px-5 z-20 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-blue-700 text-white rounded flex items-center justify-center shrink-0 md:hidden font-bold text-sm">UC</div>
            <h1 className="text-sm font-bold tracking-wide text-slate-200 uppercase flex items-center gap-2 truncate">
              UrbanCortexLLM <span className="text-slate-600 font-normal text-xs">—</span>
              <span className="font-normal text-slate-400 text-xs normal-case hidden sm:inline">Traffic Incident Command</span>
            </h1>
            <div className="h-4 w-px bg-slate-700 mx-1 shrink-0" />
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-emerald-950/40 border border-emerald-900/50 shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold text-emerald-400 tracking-widest uppercase">Live</span>
            </div>
            <span className="hidden md:block text-xs font-mono text-slate-500 ml-1">PDEU Gandhinagar, GJ</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <LiveClock />
            <SimControls />
            <button className="relative text-slate-400 hover:text-slate-200 transition-colors">
              <Bell size={17} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-slate-900" />
            </button>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="flex-1 flex flex-col xl:flex-row overflow-y-auto xl:overflow-hidden min-w-0">

          {/* ── Left panel ────────────────────────────────────────────── */}
          {leftVisible && (
            <aside className="w-full xl:w-[380px] flex flex-col border-b xl:border-b-0 xl:border-r border-slate-800 bg-slate-950 z-10 xl:overflow-y-auto shrink-0 order-1">

              {panels.incident && (
                <section>
                  <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-900 flex items-center h-11">
                    <h2 className="text-xs font-bold tracking-widest text-slate-300 uppercase flex items-center gap-2">
                      <ShieldAlert size={13} className="text-slate-500" />
                      Incident Context
                    </h2>
                  </div>
                  <IncidentSummary />
                </section>
              )}

              {panels.recommendations && (
                <section className="flex-1 flex flex-col overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-900 flex items-center h-11">
                    <h2 className="text-xs font-bold tracking-widest text-slate-300 uppercase flex items-center gap-2">
                      <LayoutDashboard size={13} className="text-slate-500" />
                      Decision Support
                    </h2>
                  </div>
                  <AIRecommendations />
                </section>
              )}
            </aside>
          )}

          {/* ── Center panel ──────────────────────────────────────────── */}
          {centerVisible && (
            <main className="w-full xl:flex-1 flex flex-col relative bg-slate-900 min-w-0 shrink-0 order-2">
              {panels.map && (
                <div className="flex-1 relative z-0 min-h-0" style={{ minHeight: '350px' }}>
                  <MapWidget />
                </div>
              )}
              {panels.log && <OperationLog />}
            </main>
          )}

          {/* ── Right panel ───────────────────────────────────────────── */}
          {rightVisible && (
            <aside className="w-full xl:w-[410px] flex flex-col border-t xl:border-t-0 xl:border-l border-slate-800 bg-slate-950 z-10 xl:overflow-y-auto shrink-0 order-3">

              {panels.chat && (
                <section className="flex flex-col">
                  <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-900 flex items-center h-11">
                    <h2 className="text-xs font-bold tracking-widest text-slate-300 uppercase flex items-center gap-2">
                      <MessageSquare size={13} className="text-slate-500" />
                      Tactical Query Console
                    </h2>
                  </div>
                  <CopilotChat />
                </section>
              )}

              {panels.alerts && (
                <section className="flex-1 flex flex-col overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-900 flex items-center h-11">
                    <h2 className="text-xs font-bold tracking-widest text-slate-300 uppercase flex items-center gap-2">
                      <Radio size={13} className="text-slate-500" />
                      Public Comm Drafts
                    </h2>
                  </div>
                  <AlertsGenerator />
                </section>
              )}
            </aside>
          )}

          {/* ── All panels hidden: fallback ───────────────────────────── */}
          {!leftVisible && !centerVisible && !rightVisible && (
            <div className="flex-1 flex items-center justify-center text-slate-600 text-sm font-mono uppercase tracking-widest">
              All panels hidden — use sidebar to restore
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
