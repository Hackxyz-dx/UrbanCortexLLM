<div align="center">

<br/>

```
██╗   ██╗██████╗ ██████╗  █████╗ ███╗   ██╗ ██████╗ ██████╗ ██████╗ ████████╗███████╗██╗  ██╗
██║   ██║██╔══██╗██╔══██╗██╔══██╗████╗  ██║██╔════╝██╔═══██╗██╔══██╗╚══██╔══╝██╔════╝╚██╗██╔╝
██║   ██║██████╔╝██████╔╝███████║██╔██╗ ██║██║     ██║   ██║██████╔╝   ██║   █████╗   ╚███╔╝
██║   ██║██╔══██╗██╔══██╗██╔══██║██║╚██╗██║██║     ██║   ██║██╔══██╗   ██║   ██╔══╝   ██╔██╗
╚██████╔╝██║  ██║██████╔╝██║  ██║██║ ╚████║╚██████╗╚██████╔╝██║  ██║   ██║   ███████╗██╔╝ ██╗
 ╚═════╝ ╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝
                   L  L  M
```

# UrbanCortexLLM
### 🚦 AI-Powered Traffic Incident Command System

**Real-time incident management with LLM decision support, live map routing, and multi-channel public alerting — built for modern urban traffic operations.**

<br/>

[![Next.js](https://img.shields.io/badge/Next.js%2016-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Gemini AI](https://img.shields.io/badge/Gemini%20AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Leaflet](https://img.shields.io/badge/Leaflet%20+%20OSM-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![Zustand](https://img.shields.io/badge/Zustand-FF6B35?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PC9zdmc+)](https://zustand-demo.pmnd.rs/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

<br/>

> *"When every second counts, your command system should be smarter than the crisis."*

<br/>

---

</div>

## 🎯 What is UrbanCortexLLM?

**UrbanCortexLLM** is a full-stack, real-time traffic incident command dashboard designed for urban traffic management centers, emergency response units, and smart city operations. It combines **Large Language Model intelligence** with **live map routing**, **automated public alerting**, and a **tactical decision support engine** — all within a single, unified operations interface.

The system is built around a simulated critical incident: a **multi-vehicle collision on the Koba-Gandhinagar Highway, near PDEU Main Gate, Sector-23, Gujarat** — but the architecture is entirely generic and deployable for any real-world incident across any city.

---

## 🧠 The Problem We're Solving

Traffic incidents in urban areas cause cascading failures:

- 🚗 **Secondary accidents** from uninformed diversion decisions
- 📻 **Delayed public alerts** due to manual drafting and approval workflows
- 🗺️ **No alternate routing intelligence** — operators rely on gut feel
- 🧩 **Fragmented tools** — maps, comms, decisions are disconnected
- ⏱️ **High cognitive load** under time pressure for solo operators

> **UrbanCortexLLM solves this by unifying all decision-making into one AI-powered command screen.**

---

## ✨ Key Features

### 🔴 Live Incident Command Dashboard
- Real-time incident status tracking: severity, lane blockage, vehicles involved, estimated clearance
- Live operation timeline log with timestamped event entries
- Simulation mode with a built-in incident progression engine
- Fully togglable panel layout — operators see only what they need

### 🗺️ AI-Powered Map with Routing
- Interactive **Leaflet map** powered by **OpenStreetMap** (zero cost, zero API keys for map tiles)
- Real primary route, diversion (Sardar Patel Ring Road), and emergency corridor rendered live
- Color-coded congestion overlays (blocked → heavy → moderate → clear)
- **30-second real-time polling** to refresh route states from the backend API
- Live freshness badge shows "✓ Live" vs "Last updated X sec ago"

### 🤖 Gemini LLM Decision Support Engine
- Integrates **Google Gemini 1.5 Flash** for on-demand strategic recommendations
- Generates ranked response strategies with confidence scores, impact metrics, and reasoning chains
- Recommendations are structured, parsed, and displayed as human-readable action cards
- Supports approve/reject workflow for each recommended action

### 📡 Multi-Channel Public Alert Drafts
- Generates AI-drafted alerts for **VMS boards**, **Social Media**, and **SMS** simultaneously
- LLM drafts are tagged `LLM` vs fallback `Mock` for transparency
- One-click publish per channel with visual confirmation indicators
- Tabbed UI with live hardware preview for VMS boards

### 💬 Tactical Copilot Chat (Right Sidebar)
- Persistent AI chat interface powered by **Gemini** as a contextual assistant
- Aware of current incident state, routes, and strategy data
- Supports free-form operator questions and predefined quick-queries
- Dedicated slide-in sidebar that never clutters the main map/dashboard view

### 📋 Sidebar Panel Control System
- Six independently toggleable panels: Incident | Map | Recommendations | Log | Chat | Alerts
- Smart layout reflow: all panels adapt the grid when toggled on/off
- Minimal icon sidebar with active state indicators

---

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                       UrbanCortexLLM Platform                        │
│                                                                      │
│  ┌──────────┐  ┌──────────────────────────────────────────────────┐ │
│  │          │  │              Main Dashboard (page.tsx)           │ │
│  │  Icon    │  │  ┌───────────────┐  ┌───────────────────────┐   │ │
│  │  Sidebar │  │  │ Incident      │  │  Live Map             │   │ │
│  │          │  │  │ Summary       │  │  (Leaflet + OSM)      │   │ │
│  │ [Toggle] │  │  │               │  │                       │   │ │
│  │  Panels  │  │  └───────────────┘  └───────────────────────┘   │ │
│  │          │  │  ┌─────────────────────────────────────────────┐ │ │
│  │          │  │  │   AI Decision Support (Gemini Recs)         │ │ │
│  │          │  │  └─────────────────────────────────────────────┘ │ │
│  │          │  │  ┌────────────────────┐  ┌────────────────────┐  │ │
│  │          │  │  │  Operation Log     │  │  Alert Drafts      │  │ │
│  │          │  │  └────────────────────┘  └────────────────────┘  │ │
│  └──────────┘  └──────────────────────────────────────────────────┘ │
│                                                          ▲           │
│                                              ┌───────────┴────────┐  │
│                                              │  Copilot Chat      │  │
│                                              │  (Right Sidebar)   │  │
│                                              └────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
        │                    │                      │
        ▼                    ▼                      ▼
  /api/incidents       /api/routes           /api/chat
  /api/recommendations /api/alerts           Gemini Flash
```

---

## 🛠️ Technical Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | SSR, API routes, file-based routing |
| **UI** | React 19 + Tailwind CSS v4 | Component rendering, utility-first styling |
| **State** | Zustand v5 | Global incident state, chat messages, panel toggles |
| **Map** | Leaflet + React-Leaflet + OpenStreetMap | Free, open-source map tiles and overlays |
| **Routing Algorithm** | Custom A\* (TypeScript) | Alternate route pathfinding on a road graph |
| **LLM** | Google Gemini 1.5 Flash (`@google/generative-ai`) | Recommendations, alerting, and chat |
| **Icons** | Lucide React | Clean, consistent icon library |
| **Charts** | Recharts | Data visualization for metrics |
| **Animations** | tw-animate-css | Micro-animations and transitions |

---

## 🧬 Core Engineering Highlights

### 🔀 A\* Pathfinding Engine (from scratch)

A complete A\* implementation in TypeScript (`src/lib/maps/routing/astar.ts`) built for road-graph traversal:

- **Min-heap priority queue** (binary heap) for O(log n) node expansion
- **Haversine heuristic** — time-admissible, never overestimates
- **Edge cost function**: traversal time = `(distanceM / speedMs) * congestionMultiplier`
- Supports `isClosed` edge flags for blocked roads
- Returns full path geometry, edge list, total cost in seconds, and distance in metres
- Used for computing on-the-fly alternate routes when incidents block primary paths

### ⚡ Real-Time Data Polling System

Located in `src/hooks/useMapData.ts`:
- 30-second polling interval with **in-flight guard** (no overlapping requests)
- **Tab-visibility pausing** — poll stops when browser tab is hidden, resumes on visibility
- Automatic stale-state prevention via stable React keys on Leaflet layers
- Freshness badge ticks every second to display "X sec ago" since last update

### 🤖 LLM Prompt Pipeline

Located in `src/lib/llm/`:
- **Context builder**: assembles incident state, road conditions, and route data into a structured system prompt
- **Prompt templates**: carefully engineered prompts for recommendations, alerts, and chat
- **Response parser**: structured JSON parser with fallback for malformed LLM output
- **Multi-provider support** (`client.ts`, `provider.ts`): abstracts Gemini behind a unified interface

### 🗺️ Pluggable Map Provider System

Located in `src/lib/maps/`:
- Abstract `provider.ts` interface supporting: Here Maps, OpenRouteService, GraphHopper, Mapbox
- Currently deployed on **OpenStreetMap** (free, no key required for tiles)
- `location-context.ts` builds LLM-readable context from route and traffic data
- `mock.ts` for local simulation without any external APIs

---

## 🚀 Getting Started

### Prerequisites

- Node.js `>= 18`
- A **Google Gemini API key** (free tier available at [Google AI Studio](https://aistudio.google.com/))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/UrbanCortexLLM.git
cd UrbanCortexLLM

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.local.example .env.local
```

### Environment Setup

Edit `.env.local` with your keys:

```env
# Required: Your Google Gemini API key
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: External routing providers (fallback to mock if not provided)
OPENROUTESERVICE_API_KEY=
GRAPHHOPPER_API_KEY=
HERE_API_KEY=
MAPBOX_ACCESS_TOKEN=
```

### Running the App

```bash
npm run dev
```

> Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main dashboard shell & panel layout
│   └── api/
│       ├── incidents/        # Incident data API
│       ├── routes/           # Route & map data API
│       ├── recommendations/  # LLM recommendations API
│       ├── alerts/           # Alert draft generation API
│       └── chat/             # Copilot chat API
│
├── components/
│   ├── dashboard/            # IncidentSummary, OperationLog, NavbarNotifications, etc.
│   ├── map/                  # MapViewer (Leaflet), MapWidget
│   ├── ai/                   # AIRecommendations (Decision Support)
│   ├── copilot/              # CopilotChat (right sidebar)
│   ├── actions/              # AlertsGenerator (VMS, Social, SMS)
│   └── ui/                   # Shared design system components
│
├── lib/
│   ├── store.ts              # Zustand global state store
│   ├── llm/                  # Gemini LLM client, prompts, parser, context
│   └── maps/
│       ├── routing/          # A* pathfinding engine + road graph
│       ├── graphhopper.ts    # GraphHopper provider
│       ├── ors.ts            # OpenRouteService provider
│       ├── mapbox.ts         # Mapbox provider
│       └── location-context.ts # LLM spatial context builder
│
├── data/
│   └── mockIncident.ts       # Full incident simulation data model
│
├── hooks/
│   └── useMapData.ts         # Real-time map data polling hook
│
└── types/
    └── maps.ts               # Shared geo/map TypeScript types
```

---

## 🎮 How to Use the Dashboard

| Action | How |
|---|---|
| **Toggle Panels** | Click icons in the left sidebar (Map, Incident, Recs, Log, Chat, Alerts) |
| **Open AI Chat** | Click the chat icon in the sidebar; slides in as a right-panel drawer |
| **Generate Recs** | Click "Refresh" in the Decision Support section |
| **Draft Alerts** | Click "Generate" in Public Comm Drafts; choose VMS/Social/SMS tab |
| **Publish Alerts** | Click "Publish" in the desired alert tab |
| **Approve Actions** | Click "Approve" or "Reject" on any recommended strategy action |
| **Run Simulation** | Use the live simulation controls in the top navbar |

---

## 🏆 Hackathon Context

> Built for **HackXYZ DX** — a national-level hackathon focused on AI-powered smart city and urban infrastructure solutions.

### Problem Statement Addressed
**"Design an AI-assisted system for real-time urban traffic incident management that reduces operator cognitive load and improves emergency response time."**

### Innovation Highlights
1. **Zero paid infrastructure** — OSM tiles, free Gemini tier; deployable at $0/month
2. **A\* routing in-browser** — no cloud routing APIs needed for alternate path computation
3. **Context-aware LLM** — the AI is given live incident data, not just a generic prompt
4. **Multi-modal alerting** — hardware VMS, social, and SMS from a single unified interface
5. **Government-grade UX** — clean, minimal, high-contrast design for operational environments

---

## 🤝 Team

| Name | Role |
|---|---|
| **Madhav Dave** | Full-Stack Engineering — Dashboard architecture, LLM pipeline, API design |
| **Chaitya Shah** | UI/UX Design — Dashboard layout, panel system, responsive design |
| **Aryan Vatvesa** | AI Integration — Gemini prompt engineering, recommendation parser |
| **Jinay Amin** | Routing Engine — A\* algorithm, road graph, alternate path computation |
| **Yash Nath** | Systems & Integration — Real-time polling, map data flow, state management |

---

## 📜 License

This project is submitted as a hackathon entry. All rights reserved by the team.

---

<div align="center">

<br/>

**Built with ❤️ for smarter cities and safer roads.**

*UrbanCortexLLM — Where AI meets the Incident Command.*

<br/>

![Next.js](https://img.shields.io/badge/Powered%20by-Next.js%2016-black?style=flat-square&logo=next.js)
![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?style=flat-square&logo=google)
![OpenStreetMap](https://img.shields.io/badge/Maps-OpenStreetMap-7EBC6F?style=flat-square&logo=openstreetmap&logoColor=white)

</div>
