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
import NavbarNotifications from '@/components/dashboard/NavbarNotifications';
import {
  LayoutDashboard, Map as MapIcon, ShieldAlert,
  Bell, UserCircle, MessageSquare, Radio, Clock, X
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
      className={`w-full py-4 flex flex-col items-center justify-center gap-1.5 transition-all border-l-4 group flex-shrink-0
        ${active
          ? 'bg-blue-50 text-blue-700 border-blue-600 shadow-inner'
          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 border-transparent'}`}
    >
      {icon}
      <span className={`text-[10px] font-bold uppercase tracking-wider leading-none ${active ? 'text-blue-700' : 'text-slate-500 group-hover:text-slate-700'}`}>
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

  const leftVisible = panels.incident || panels.recommendations;
  const centerVisible = panels.map || panels.log;
  const rightVisible = panels.chat || panels.alerts;

  return (
    <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden bg-slate-50 text-slate-800 font-sans selection:bg-blue-100">

      {/* ── Sidebar (Fixed) ──────────────────────────────────────────────── */}
      <nav className="flex-shrink-0 w-full h-[72px] md:w-[90px] md:h-full flex flex-row md:flex-col items-center justify-start bg-white border-t md:border-t-0 md:border-r border-slate-200 shadow-sm z-30 order-last md:order-first overflow-x-auto md:overflow-y-auto scrollbar-hide">

        {/* Logo */}
        <div className="w-full py-5 flex items-center justify-center border-b border-slate-100 mb-2 hidden md:flex flex-shrink-0">
          <div className="w-12 h-12 bg-blue-700 text-white rounded shadow-sm flex items-center justify-center font-bold text-xl leading-none cursor-default select-none">
            UC
          </div>
        </div>

        {/* Panel toggles */}
        <div className="flex flex-row md:flex-col items-center md:flex-1 w-full min-w-max md:min-w-0">
          <SidebarBtn
            icon={<ShieldAlert size={22} />}
            label="Summary"
            active={panels.incident}
            onClick={() => toggle('incident')}
          />
          <SidebarBtn
            icon={<LayoutDashboard size={22} />}
            label="Strategy"
            active={panels.recommendations}
            onClick={() => toggle('recommendations')}
          />
          <SidebarBtn
            icon={<MapIcon size={22} />}
            label="Map View"
            active={panels.map}
            onClick={() => toggle('map')}
          />
          <SidebarBtn
            icon={<Clock size={22} />}
            label="Timeline"
            active={panels.log}
            onClick={() => toggle('log')}
          />
          <SidebarBtn
            icon={<MessageSquare size={22} />}
            label="Chat"
            active={panels.chat}
            onClick={() => toggle('chat')}
          />
          <SidebarBtn
            icon={<Radio size={22} />}
            label="Alerts"
            active={panels.alerts}
            onClick={() => toggle('alerts')}
          />
        </div>

        {/* Bottom: user avatar */}
        <div className="hidden md:flex py-5 items-center justify-center border-t border-slate-100 w-full flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer">
            <UserCircle size={24} className="text-slate-600" />
          </div>
        </div>
      </nav>

      {/* ── Main Area (Fills remaining space) ────────────────────────────── */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-slate-50 overflow-y-auto">

        {/* Top Navbar (Sticky) */}
        <header className="flex-shrink-0 h-16 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-4 md:px-6 z-20 w-full sticky top-0">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-8 h-8 bg-blue-700 text-white rounded flex items-center justify-center flex-shrink-0 md:hidden font-bold text-sm shadow-sm">UC</div>
            <h1 className="text-lg font-bold tracking-wide text-slate-800 flex items-center gap-2 truncate whitespace-nowrap">
              UrbanCortexLLM
              <span className="text-slate-300 font-normal hidden sm:inline">|</span>
              <span className="font-medium text-slate-500 text-base hidden sm:inline">Traffic Incident Command</span>
            </h1>
            <div className="h-6 w-px bg-slate-200 mx-2 flex-shrink-0 hidden lg:block" />
            <div className="items-center gap-2 px-3 py-1.5 rounded bg-emerald-50 border border-emerald-100 flex-shrink-0 hidden md:flex">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm animate-pulse" />
              <span className="text-xs font-bold text-emerald-700 tracking-widest uppercase">Live System</span>
            </div>
            <span className="hidden lg:block text-sm font-medium text-slate-500 ml-2">PDEU Gandhinagar, Gujarat</span>
          </div>
          <div className="flex items-center gap-4 md:gap-6 flex-shrink-0">
            <div className="hidden sm:block"><LiveClock /></div>
            <SimControls />
            <NavbarNotifications />
          </div>
        </header>

        {/* ── Dashboard Page Content ── */}
        <div className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto flex flex-col gap-6 lg:gap-8 min-h-0">

          {/* Row 1: Summary + Map */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {panels.incident && (
              <section className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center shrink-0 rounded-t-xl">
                  <h2 className="text-base font-bold tracking-wide text-slate-700 uppercase flex items-center gap-2.5">
                    <ShieldAlert size={18} className="text-slate-400" />
                    Incident Summary
                  </h2>
                </div>
                <IncidentSummary />
              </section>
            )}

            {panels.map && (
              <section className={`${panels.incident ? '' : 'lg:col-span-2'} bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-[500px] lg:min-h-[600px] overflow-hidden`}>
                <MapWidget />
              </section>
            )}
          </div>

          {/* Row 2: Strategy / Recommendations */}
          {panels.recommendations && (
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center shrink-0 rounded-t-xl">
                <h2 className="text-base font-bold tracking-wide text-slate-700 uppercase flex items-center gap-2.5">
                  <LayoutDashboard size={18} className="text-slate-400" />
                  Decision Support
                </h2>
              </div>
              <AIRecommendations />
            </section>
          )}

          {/* Row 3: Ops Log, Alerts */}
          {(panels.log || panels.alerts) && (
            <div className={`grid grid-cols-1 gap-6 lg:gap-8 ${panels.log && panels.alerts ? 'xl:grid-cols-2 lg:grid-cols-2' : 'xl:grid-cols-1 lg:grid-cols-1'
              }`}>

              {panels.log && (
                <section className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-[400px] max-h-[600px] overflow-hidden">
                  <OperationLog />
                </section>
              )}

              {panels.alerts && (
                <section className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-[500px] overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center shrink-0 rounded-t-xl">
                    <h2 className="text-base font-bold tracking-wide text-slate-700 uppercase flex items-center gap-2.5">
                      <Radio size={18} className="text-slate-400" />
                      Public Comm Drafts
                    </h2>
                  </div>
                  <AlertsGenerator />
                </section>
              )}
            </div>
          )}

          {/* Empty state wrapper */}
          {!panels.incident && !panels.map && !panels.recommendations && !panels.log && !panels.chat && !panels.alerts && (
            <div className="w-full flex flex-col items-center justify-center text-slate-400 bg-white rounded-xl border border-slate-200 shadow-sm border-dashed p-24">
              <LayoutDashboard size={48} className="mb-4 text-slate-300 opacity-50" />
              <div className="text-lg font-medium tracking-wide">Dashboard is empty</div>
              <div className="text-base mt-1">Use the sidebar to open panels.</div>
            </div>
          )}

        </div>
      </div>

      {/* ── Right Sidebar: Copilot Chat ─────────────────────────────────── */}
      {panels.chat && (
        <aside className="w-full md:w-[360px] lg:w-[420px] flex-shrink-0 h-full bg-white border-l border-slate-200 shadow-2xl flex flex-col transition-all duration-300 z-40 relative">
          <div className="h-16 border-b border-slate-200 flex items-center justify-between px-5 shrink-0 bg-white">
            <h2 className="text-base font-bold tracking-wide text-slate-800 uppercase flex items-center gap-2.5">
              <MessageSquare size={18} className="text-blue-600" />
              Tactical Support Chat
            </h2>
            <button
              onClick={() => toggle('chat')}
              className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors"
              title="Close Chat"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 min-h-0 bg-white">
            <CopilotChat />
          </div>
        </aside>
      )}

    </div>
  );
}
