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
      className={`w-full py-4 flex flex-col items-center justify-center gap-1.5 transition-all border-l-4 group shrink-0
        ${active
          ? 'bg-blue-50 text-blue-700 border-blue-600 shadow-inner'
          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 border-transparent'}`}
    >
      {icon}
      <span className={`text-xs font-bold uppercase tracking-wider leading-none ${active ? 'text-blue-700' : 'text-slate-500 group-hover:text-slate-700'}`}>
        {label}
      </span>
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
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-slate-50 text-slate-800 font-sans selection:bg-blue-100">

      {/* ── Sidebar (Sticky) ──────────────────────────────────────────────── */}
      <nav className="w-full h-auto md:w-[90px] md:h-screen md:sticky md:top-0 flex flex-row md:flex-col items-center justify-start bg-white border-b md:border-b-0 md:border-r border-slate-200 shadow-sm z-30 shrink-0 order-last md:order-first overflow-x-auto md:overflow-x-hidden md:overflow-y-auto">

        {/* Logo */}
        <div className="w-full py-5 flex items-center justify-center border-b border-slate-100 mb-2 hidden md:flex shrink-0">
          <div className="w-12 h-12 bg-blue-700 text-white rounded shadow-sm flex items-center justify-center font-bold text-xl leading-none cursor-default select-none">
            UC
          </div>
        </div>

        {/* Panel toggles */}
        <div className="flex flex-row md:flex-col items-center md:flex-1 w-full min-w-max md:min-w-0">
          <SidebarBtn
            icon={<ShieldAlert size={24} />}
            label="Summary"
            active={panels.incident}
            onClick={() => toggle('incident')}
          />
          <SidebarBtn
            icon={<LayoutDashboard size={24} />}
            label="Strategy"
            active={panels.recommendations}
            onClick={() => toggle('recommendations')}
          />
          <SidebarBtn
            icon={<MapIcon size={24} />}
            label="Map View"
            active={panels.map}
            onClick={() => toggle('map')}
          />
          <SidebarBtn
            icon={<Clock size={24} />}
            label="Timeline"
            active={panels.log}
            onClick={() => toggle('log')}
          />
          <SidebarBtn
            icon={<MessageSquare size={24} />}
            label="Chat"
            active={panels.chat}
            onClick={() => toggle('chat')}
          />
          <SidebarBtn
            icon={<Radio size={24} />}
            label="Alerts"
            active={panels.alerts}
            onClick={() => toggle('alerts')}
          />
        </div>

        {/* Bottom: user avatar */}
        <div className="hidden md:flex py-5 items-center justify-center border-t border-slate-100 w-full shrink-0">
          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer">
            <UserCircle size={24} className="text-slate-600" />
          </div>
        </div>
      </nav>

      {/* ── Main area (Scrollable) ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-100/50">

        {/* Top Navbar (Sticky) */}
        <header className="h-16 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-4 md:px-6 z-20 shrink-0 sticky top-0 w-full">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-8 h-8 bg-blue-700 text-white rounded flex items-center justify-center shrink-0 md:hidden font-bold text-sm shadow-sm">UC</div>
            <h1 className="text-lg font-bold tracking-wide text-slate-800 flex items-center gap-2 truncate whitespace-nowrap">
              UrbanCortexLLM
              <span className="text-slate-300 font-normal hidden sm:inline">|</span>
              <span className="font-medium text-slate-500 text-base hidden sm:inline">Traffic Incident Command</span>
            </h1>
            <div className="h-6 w-px bg-slate-200 mx-2 shrink-0 hidden md:block" />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-emerald-50 border border-emerald-100 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm animate-pulse" />
              <span className="text-xs font-bold text-emerald-700 tracking-widest uppercase">Live System</span>
            </div>
            <span className="hidden lg:block text-sm font-medium text-slate-500 ml-2">PDEU Gandhinagar, Gujarat</span>
          </div>
          <div className="flex items-center gap-6 shrink-0">
            <LiveClock />
            <SimControls />
            <button className="relative text-slate-500 hover:text-slate-800 transition-colors">
              <Bell size={24} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm" />
            </button>
          </div>
        </header>

        {/* Dashboard Flow Grid */}
        <div className="flex-1 flex flex-col xl:flex-row p-3 md:p-4 gap-4 min-w-0">

          {/* ── Left column ───────────────────────────────────────────── */}
          {leftVisible && (
            <aside className={`w-full flex flex-col gap-4 shrink-0 order-1 transition-all duration-300 ${centerVisible || rightVisible ? 'xl:w-[440px]' : 'xl:flex-1'}`}>

              {panels.incident && (
                <section className="bg-white rounded-md shadow-sm border border-slate-200 flex flex-col">
                  <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center h-14 shrink-0">
                    <h2 className="text-base font-bold tracking-wide text-slate-700 uppercase flex items-center gap-2.5">
                      <ShieldAlert size={18} className="text-slate-400" />
                      Incident Summary
                    </h2>
                  </div>
                  <div className="flex flex-col">
                    <IncidentSummary />
                  </div>
                </section>
              )}

              {panels.recommendations && (
                <section className="flex flex-col bg-white rounded-md shadow-sm border border-slate-200">
                  <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center h-14 shrink-0">
                    <h2 className="text-base font-bold tracking-wide text-slate-700 uppercase flex items-center gap-2.5">
                      <LayoutDashboard size={18} className="text-slate-400" />
                      Decision Support
                    </h2>
                  </div>
                  <div className="flex flex-col">
                    <AIRecommendations />
                  </div>
                </section>
              )}
            </aside>
          )}

          {/* ── Center column ─────────────────────────────────────────── */}
          {centerVisible && (
            <main className="w-full xl:flex-1 flex flex-col gap-4 relative min-w-0 shrink-0 order-2 transition-all duration-300">
              {panels.map && (
                <div className="relative z-0 min-h-[500px] xl:min-h-[600px] rounded-md shadow-sm border border-slate-200 bg-white">
                  <MapWidget />
                </div>
              )}
              {panels.log && (
                <div className="flex flex-col min-h-[400px] rounded-md shadow-sm border border-slate-200 bg-white">
                  <OperationLog />
                </div>
              )}
            </main>
          )}

          {/* ── Right column ──────────────────────────────────────────── */}
          {rightVisible && (
            <aside className={`w-full flex flex-col gap-4 shrink-0 order-3 transition-all duration-300 ${centerVisible || leftVisible ? 'xl:w-[440px]' : 'xl:flex-1'}`}>

              {panels.chat && (
                <section className="flex flex-col bg-white rounded-md shadow-sm border border-slate-200 min-h-[600px]">
                  <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center h-14 shrink-0">
                    <h2 className="text-base font-bold tracking-wide text-slate-700 uppercase flex items-center gap-2.5">
                      <MessageSquare size={18} className="text-slate-400" />
                      Tactical Support Chat
                    </h2>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <CopilotChat />
                  </div>
                </section>
              )}

              {panels.alerts && (
                <section className="flex flex-col bg-white rounded-md shadow-sm border border-slate-200 min-h-[500px]">
                  <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center h-14 shrink-0">
                    <h2 className="text-base font-bold tracking-wide text-slate-700 uppercase flex items-center gap-2.5">
                      <Radio size={18} className="text-slate-400" />
                      Public Comm Drafts
                    </h2>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <AlertsGenerator />
                  </div>
                </section>
              )}
            </aside>
          )}

          {/* ── All panels hidden: fallback ───────────────────────────── */}
          {!leftVisible && !centerVisible && !rightVisible && (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-white rounded-md border border-slate-200 shadow-sm border-dashed min-h-[500px]">
              <LayoutDashboard size={48} className="mb-4 text-slate-300 opacity-50" />
              <div className="text-lg font-medium tracking-wide">Dashboard is empty</div>
              <div className="text-base mt-1">Use the sidebar to open panels.</div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
