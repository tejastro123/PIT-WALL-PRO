---
type: "query"
date: "2026-04-29T01:05:00.798554+00:00"
question: "Why does GET() connect API Routing to FastF1 API Integration, Ergast API Layer"
contributor: "graphify"
source_nodes: ["GET()", "get_strategy_simulation()", "fetchWithRetry()", "ergastFetch()"]
---

# Q: Why does GET() connect API Routing to FastF1 API Integration, Ergast API Layer

## Answer

GET() in src\app\api\live-timing\route.ts is the live-timing API route handler. It has 5 connections: (1) get_strategy_simulation() [INFERRED] - bridges to Python Backend (Community 0) for strategy simulation data, (2) wrapInMRData() [EXTRACTED] - wraps response in standard format, (3) fetchWithRetry() [INFERRED] - bridges to FastF1 API Integration (Community 2) for telemetry retry logic, (4) ergastFetch() [INFERRED] - bridges to Ergast API Layer (Community 3) for race/standing data. So GET() acts as an aggregator that orchestrates data from three distinct sources: FastF1 telemetry, Ergast API, and the Python backend simulation engine, combining them into a unified live-timing response.

## Source Nodes

- GET()
- get_strategy_simulation()
- fetchWithRetry()
- ergastFetch()