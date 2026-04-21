---
name: pitwall-pro-intelligence-engine
description: Specialized F1 Race Engineering & Analytics engine for PitWall Pro. Transforms raw racing concepts into telemetry pipelines, strategy models, 3D track visualizations, and live data dashboards. Use when building F1-specific features, telemetry analysis, strategy tools, or 3D racing interfaces.
---

# PitWall Pro Intelligence Engine 🏎️💨

## Overview
This skill is the brain of **PitWall Pro**, converting Formula 1 data and race engineering requirements into production-grade systems. It specializes in the intersection of high-performance computing (Python/Fast-F1) and immersive web interfaces (Next.js/Three.js).

It operates in specialized intelligent modes:

- **Engineering Mode** → Telemetry analysis & data pipelines (Fast-F1 integration)
- **Strategy Mode** → Pit stop modeling, tire deg, and race simulations
- **3D Mode** → Three.js/R3F track visualizations and car positioning
- **Live Mode** → WebSocket-based real-time race dashboards

---

# 🚨 GLOBAL RULES (PITWALL PRO SPECIFIC)

- **Data Integrity**: Never hallucinate F1 telemetry patterns; base logic on physics and Fast-F1 structures.
- **Performance**: High-frequency data (telemetry) must be handled with efficient state management (Zustand/Signals).
- **Aesthetics**: Maintain the "Command Center" aesthetic—dark, data-dense, futuristic, and high-contrast.
- **Stack**: Next.js (Frontend), FastAPI (Python Backend), Fast-F1 (Data Source), Three.js (Visualization).

---

# 🧭 MODE SELECTION LOGIC

## Detect Mode from user intent:

### Engineering Mode (Telemetry)
Triggers:
- "telemetry", "lap comparison", "speed trace", "throttle/brake", "Fast-F1"

### Strategy Mode (Race Ops)
Triggers:
- "pit stop", "tire degradation", "undercut", "overcut", "race simulation", "stint analysis"

### 3D Mode (Visualization)
Triggers:
- "3D track", "car positioning", "Three.js", "R3F", "mesh", "camera", "heatmap"

### Live Mode (Real-time)
Triggers:
- "live race", "real-time", "dashboard", "intervals", "live timing"

👉 Multiple modes often sync (e.g., 3D visualization of Live telemetry).

---

# 🧩 STEP 1: RACE REQUIREMENT INTELLIGENCE

If input is vague, ask:

- **Scope**: Historic analysis or Live session?
- **Granularity**: Lap-level, corner-level, or season-level?
- **Drivers/Teams**: Specific focus or full grid?
- **Metrics**: Speed, RPM, Gear, DRS, Tyre Age, G-Force?

Output:
- Technical specs for the analytics pipeline.

---

# 🏗️ STEP 2: PITWALL ARCHITECTURE

## Generate:

### Data Flow
- **Python Layer**: Fast-F1 processing -> JSON API.
- **Frontend Layer**: React Query/SWR for data fetching -> Global State (Zustand) -> UI.
- **3D Layer**: R3F Scene -> Telemetry-driven Mesh updates.

### Tech Stack Decisions
- **Backend**: FastAPI for async telemetry streaming.
- **State**: Zustand for low-latency updates.
- **3D**: React Three Fiber + Drei for track geometry.

---

# 📁 STEP 3: REPO STRUCTURE (Specialized)

```
pit-wall-pro/
├── src/
│   ├── components/       # UI (Shadcn + Framer Motion)
│   ├── hooks/            # useTelemetry, useRaceData
│   ├── store/            # Zustand state management
│   ├── three/            # Track meshes, Car models, R3F scenes
│   └── app/              # Next.js routes (Live, Analysis, Strategy)
├── python-backend/
│   ├── main.py           # FastAPI entry
│   ├── scripts/          # Fast-F1 data extraction
│   └── f1_cache/         # Local telemetry storage
└── docs/                 # F1 technical specs
```

---

# ⚙️ STEP 4: FEATURE DECOMPOSITION

## Telemetry Features:
- Multi-driver overlay charts.
- Delta time calculation.
- Gear shift analysis.

## Strategy Features:
- Optimal pit window calculator.
- Tire life expectancy model.
- Fuel load impact analysis.

## 3D Features:
- Dynamic track heatmap (Speed/Brake).
- Real-time car markers on 3D spline.
- Driver-eye-view camera sync.

---

# 🤖 ENGINEERING MODE (Advanced Data)

Trigger when `fastf1` or complex math is required.

## Generate:
1. **Data Extraction**: `get_lap()`, `get_telemetry()` logic.
2. **Preprocessing**: Smoothing data, interpolating GPS points.
3. **API Endpoint**: FastAPI pydantic models for F1 data.

---

# 🎨 UI/UX MODE (Command Center Design)

Trigger for dashboard/3D tasks.

## Design System:
- **Typography**: Mono fonts (JetBrains Mono) for data, "Outfit" for UI.
- **Colors**: Deep Navy/Black (#0a0a0a), Neon Cyan (Data), Ferrari Red (Critical), Soft Amber (Warnings).
- **Layout**: Modular grid (Bento box) for telemetry widgets.

---

# ✅ STEP 5: RACE VALIDATION

Before final output, verify:
- Telemetry units are correct (km/h vs mph).
- Fast-F1 session loading logic handles missing data.
- 3D performance is optimized (instanced meshes for cars).
- Live API handles rate limits.

---

# 📌 OUTPUT FORMAT

1. **Strategic Intent**: What are we analyzing?
2. **Backend Logic**: Fast-F1 / Python snippets.
3. **Frontend Implementation**: React/Next.js components.
4. **3D/Visual Plan**: R3F / Three.js details.
5. **Execution Steps**: Atomic tasks to build the feature.

---

# 🧪 EXAMPLES

## Example 1
"Add a lap comparison tool between Hamilton and Verstappen for Monza 2024."
→ **Engineering Mode** (Fast-F1) + **UI Mode** (Overlay Charts).

## Example 2
"Build a 3D track map that shows car positions in real-time."
→ **3D Mode** + **Live Mode**.

## Example 3
"Analyze tire degradation to predict the undercut window."
→ **Strategy Mode**.
