import { useQuery } from '@tanstack/react-query';
import { useState, useCallback, useRef } from 'react';

const FASTF1_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class FastF1RequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'FastF1RequestError';
    this.status = status;
  }
}

interface FetchWithRetryOptions {
  retries?: number;
  signal?: AbortSignal;
}

export interface DriverTelemetry {
  driver: string;
  lap_number: number;
  lap_time: string;
  telemetry: {
    time: number[];
    speed: number[];
    rpm: number[];
    gear: number[];
    throttle: number[];
    brake: number[];
    drs: number[];
    x: number[];
    y: number[];
    distance: number[];
  };
}

export interface ComparisonData {
  d1: {
    name: string;
    lap_time: string;
    speed: number[];
    distance: number[];
    gear: number[];
  };
  d2: {
    name: string;
    lap_time: string;
    speed: number[];
    distance: number[];
    gear: number[];
  };
  delta: number[];
  ref_distance: number[];
}

export interface LapData {
  driver: string;
  lap_number: number;
  lap_time: number;
  compound: string;
  is_personal_best: boolean;
}

export interface TrackMapData {
  x: number[];
  y: number[];
  speed: number[];
  gear: number[];
  throttle: number[];
  brake: number[];
  distance: number[];
  corners: Array<{
    number: string;
    x: number;
    y: number;
    angle: number;
    distance: number;
  }>;
}

export interface SessionResult {
  position: number | null;
  driver_number: string;
  driver_code: string;
  team: string;
  status: string;
  points: number;
  full_name: string;
}

export interface SessionData {
  session_name: string;
  location: string;
  results: SessionResult[];
}

export interface StrategySimulationResult {
  total_time: number;
  total_time_formatted: string;
  stints: Array<{
    stint: number;
    compound: string;
    laps: number;
    avg_lap: number;
    stint_time: number;
  }>;
}

export interface TeamPace {
  Team: string;
  LapTimeSeconds: number;
}

export interface SeasonResultData {
  round: number;
  driverCode: string;
  points: number;
  position: number;
}

export interface SeasonSummary {
  position: number;
  driverId: string;
  driverCode: string;
  name: string;
  familyName: string;
  points: number;
  wins: number;
}

export interface WdcScenario {
  driver: string;
  points: number;
  max_possible: number;
  can_win: boolean;
}

export interface WccScenario {
  team: string;
  points: number;
  max_possible: number;
  can_win: boolean;
}

export interface QualifyingResult {
  driver: string;
  team: string;
  position: number;
  q1: number | null;
  q2: number | null;
  q3: number | null;
  best_lap: number;
}

export interface ChampionshipScenarios {
  drivers: WdcScenario[];
  teams: WccScenario[];
  max_remaining_points: number;
}

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === 'AbortError';
}

function shouldRetryFastF1Request(error: unknown) {
  if (isAbortError(error)) {
    return false;
  }

  if (error instanceof FastF1RequestError) {
    return error.status >= 500 || error.status === 429;
  }

  return true;
}

function buildFastF1Url(path: string, params: Record<string, string | number | null | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });

  return `${FASTF1_BASE_URL}${path}?${searchParams.toString()}`;
}

async function waitForRetry(delayMs: number, signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException('The operation was aborted.', 'AbortError');
  }

  await new Promise<void>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, delayMs);

    function onAbort() {
      window.clearTimeout(timeoutId);
      reject(new DOMException('The operation was aborted.', 'AbortError'));
    }

    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

const fetchWithRetry = async (url: string, options: FetchWithRetryOptions = {}) => {
  const { retries = 3, signal } = options;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, { signal });

      if (!response.ok) {
        let message = `HTTP error! status: ${response.status}`;
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const payload = await response.json();
            message = payload?.detail || payload?.error || message;
          } else {
            // Non-JSON response (likely 502 Bad Gateway HTML or 404)
            const text = await response.text();
            if (text.includes("Bad Gateway")) message = "Backend Service Timeout (Bad Gateway)";
            else if (text.includes("Service Unavailable")) message = "Backend Service Unavailable";
          }
        } catch (e) {
          console.error("Error parsing error response:", e);
        }
        throw new FastF1RequestError(message, response.status);
      }

      return await response.json();
    } catch (err) {
      if (!shouldRetryFastF1Request(err) || i === retries - 1) {
        throw err;
      }

      await waitForRetry(1000 * (i + 1), signal);
    }
  }

  throw new Error('Request failed without returning a response.');
};

// Standalone Hooks with Strong Typing
export function useF1Session(year: number, event: string, sessionType: string) {
  return useQuery<SessionData>({
    queryKey: ['session', year, event, sessionType],
    queryFn: ({ signal }) => fetchWithRetry(
      buildFastF1Url('/session', { year, event, session_type: sessionType }),
      { signal }
    ),
    staleTime: 1000 * 60 * 30,
  });
}

export function useF1Telemetry(year: number, event: string, sessionType: string, driver: string | null, lapNumber?: number) {
  return useQuery<DriverTelemetry>({
    queryKey: ['telemetry', year, event, sessionType, driver, lapNumber],
    queryFn: ({ signal }) => fetchWithRetry(
      buildFastF1Url('/telemetry', {
        year,
        event,
        session_type: sessionType,
        driver,
        lap_number: lapNumber
      }),
      { signal }
    ),
    staleTime: 1000 * 60 * 60,
    enabled: !!driver,
  });
}

export function useF1Comparison(year: number, event: string, sessionType: string, d1: string | null, d2: string | null) {
  return useQuery<ComparisonData>({
    queryKey: ['comparison', year, event, sessionType, d1, d2],
    queryFn: ({ signal }) => fetchWithRetry(
      buildFastF1Url('/comparison', {
        year,
        event,
        session_type: sessionType,
        d1,
        d2
      }),
      { signal }
    ),
    staleTime: 1000 * 60 * 60,
    enabled: !!d1 && !!d2,
  });
}

export function useF1Laps(year: number, event: string, sessionType: string, enabled = true) {
  return useQuery<LapData[]>({
    queryKey: ['laps', year, event, sessionType],
    queryFn: ({ signal }) => fetchWithRetry(
      buildFastF1Url('/laps', { year, event, session_type: sessionType }),
      { signal }
    ),
    staleTime: 1000 * 60 * 60,
    enabled,
  });
}

export function useF1TrackMap(
  year: number,
  event: string,
  sessionType: string,
  driver?: string,
  enabled = true
) {
  return useQuery<TrackMapData>({
    queryKey: ['track-map', year, event, sessionType, driver],
    queryFn: ({ signal }) => fetchWithRetry(
      buildFastF1Url('/track-map', {
        year,
        event,
        session_type: sessionType,
        driver
      }),
      { signal }
    ),
    staleTime: 1000 * 60 * 60 * 24,
    enabled,
  });
}

export function useF1LapDistribution(year: number, event: string) {
  return useQuery<LapData[]>({
    queryKey: ['lap-distribution', year, event],
    queryFn: ({ signal }) => fetchWithRetry(
      buildFastF1Url('/lap-distribution', { year, event }),
      { signal }
    ),
    staleTime: 1000 * 60 * 60,
  });
}

export function useF1TeamPace(year: number, event: string) {
  return useQuery<TeamPace[]>({
    queryKey: ['team-pace', year, event],
    queryFn: ({ signal }) => fetchWithRetry(
      buildFastF1Url('/team-pace', { year, event }),
      { signal }
    ),
    staleTime: 1000 * 60 * 60,
  });
}

export function useF1SeasonResults(year: number) {
  return useQuery<SeasonResultData[]>({
    queryKey: ['season-results', year],
    queryFn: ({ signal }) => fetchWithRetry(
      buildFastF1Url('/season-results', { year }),
      { signal }
    ),
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useF1SeasonSummary(year: number) {
  return useQuery<SeasonSummary[]>({
    queryKey: ['season-summary', year],
    queryFn: ({ signal }) => fetchWithRetry(
      buildFastF1Url('/season-summary', { year }),
      { signal }
    ),
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useF1WdcScenarios(year: number, currentRound: number) {
  return useQuery<ChampionshipScenarios>({
    queryKey: ['wdc-scenarios', year, currentRound],
    queryFn: ({ signal }) => fetchWithRetry(
      buildFastF1Url('/wdc-scenarios', { year, current_round: currentRound }),
      { signal }
    ),
    staleTime: 1000 * 60 * 60,
    enabled: !!currentRound,
  });
}

export function useF1WccScenarios(year: number, currentRound: number) {
  return useQuery<ChampionshipScenarios>({
    queryKey: ['wcc-scenarios', year, currentRound],
    queryFn: ({ signal }) => fetchWithRetry(
      buildFastF1Url('/wcc-scenarios', { year, current_round: currentRound }),
      { signal }
    ),
    staleTime: 1000 * 60 * 60,
    enabled: !!currentRound,
  });
}

export function useFastF1() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pendingRequestsRef = useRef(0);

  const beginRequest = useCallback(() => {
    pendingRequestsRef.current += 1;
    setLoading(true);
  }, []);

  const finishRequest = useCallback(() => {
    pendingRequestsRef.current = Math.max(0, pendingRequestsRef.current - 1);
    setLoading(pendingRequestsRef.current > 0);
  }, []);

  const executeRequest = useCallback(async <T,>(
    request: () => Promise<T>,
    signal?: AbortSignal
  ): Promise<T | null> => {
    beginRequest();
    setError(null);

    try {
      return await request();
    } catch (err) {
      if (isAbortError(err) || signal?.aborted) {
        return null;
      }

      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      finishRequest();
    }
  }, [beginRequest, finishRequest]);

  const getSession = useCallback(async (
    year: number,
    event: string,
    sessionType: string,
    signal?: AbortSignal
  ): Promise<SessionData | null> => {
    return executeRequest(
      () => fetchWithRetry(
        buildFastF1Url('/session', { year, event, session_type: sessionType }),
        { signal }
      ),
      signal
    );
  }, [executeRequest]);

  const getTelemetry = useCallback(async (
    year: number,
    event: string,
    sessionType: string,
    driver: string,
    lapNumber?: number,
    signal?: AbortSignal
  ): Promise<DriverTelemetry | null> => {
    return executeRequest(
      () => fetchWithRetry(
        buildFastF1Url('/telemetry', {
          year,
          event,
          session_type: sessionType,
          driver,
          lap_number: lapNumber
        }),
        { signal }
      ),
      signal
    );
  }, [executeRequest]);

  const getComparison = useCallback(async (
    year: number,
    event: string,
    sessionType: string,
    d1: string,
    d2: string,
    signal?: AbortSignal
  ): Promise<ComparisonData | null> => {
    return executeRequest(
      () => fetchWithRetry(
        buildFastF1Url('/comparison', { year, event, session_type: sessionType, d1, d2 }),
        { signal }
      ),
      signal
    );
  }, [executeRequest]);

  const getLaps = useCallback(async (
    year: number,
    event: string,
    sessionType: string,
    signal?: AbortSignal
  ): Promise<LapData[] | null> => {
    return executeRequest(
      () => fetchWithRetry(
        buildFastF1Url('/laps', { year, event, session_type: sessionType }),
        { signal }
      ),
      signal
    );
  }, [executeRequest]);

  const getTrackMap = useCallback(async (
    year: number,
    event: string,
    sessionType: string,
    driver?: string,
    signal?: AbortSignal
  ): Promise<TrackMapData | null> => {
    return executeRequest(
      () => fetchWithRetry(
        buildFastF1Url('/track-map', { year, event, session_type: sessionType, driver }),
        { signal }
      ),
      signal
    );
  }, [executeRequest]);

  const getQualifying = useCallback(async (
    year: number,
    event: string,
    signal?: AbortSignal
  ): Promise<QualifyingResult[] | null> => {
    return executeRequest(
      () => fetchWithRetry(buildFastF1Url('/qualifying', { year, event }), { signal }),
      signal
    );
  }, [executeRequest]);

  const getActualStrategy = useCallback(async (year: number, event: string, signal?: AbortSignal) => {
    return executeRequest(
      () => fetchWithRetry(buildFastF1Url('/strategy-actual', { year, event }), { signal }),
      signal
    );
  }, [executeRequest]);

  const getLapDistribution = useCallback(async (year: number, event: string, signal?: AbortSignal) => {
    return executeRequest(
      () => fetchWithRetry(buildFastF1Url('/lap-distribution', { year, event }), { signal }),
      signal
    );
  }, [executeRequest]);

  const getTeamPace = useCallback(async (year: number, event: string, signal?: AbortSignal) => {
    return executeRequest(
      () => fetchWithRetry(buildFastF1Url('/team-pace', { year, event }), { signal }),
      signal
    );
  }, [executeRequest]);

  const getSeasonResults = useCallback(async (year: number, signal?: AbortSignal): Promise<SeasonResultData[] | null> => {
    return executeRequest(
      () => fetchWithRetry(buildFastF1Url('/season-results', { year }), { signal }),
      signal
    );
  }, [executeRequest]);

  const getSeasonSummary = useCallback(async (year: number, signal?: AbortSignal): Promise<SeasonSummary[] | null> => {
    return executeRequest(
      () => fetchWithRetry(buildFastF1Url('/season-summary', { year }), { signal }),
      signal
    );
  }, [executeRequest]);

  const getWdcScenarios = useCallback(async (year: number, currentRound: number, signal?: AbortSignal): Promise<ChampionshipScenarios | null> => {
    return executeRequest(
      () => fetchWithRetry(buildFastF1Url('/wdc-scenarios', { year, current_round: currentRound }), { signal }),
      signal
    );
  }, [executeRequest]);

  const getWccScenarios = useCallback(async (year: number, currentRound: number, signal?: AbortSignal): Promise<ChampionshipScenarios | null> => {
    return executeRequest(
      () => fetchWithRetry(buildFastF1Url('/wcc-scenarios', { year, current_round: currentRound }), { signal }),
      signal
    );
  }, [executeRequest]);

  const getStrategySimulation = useCallback(async (
    year: number,
    event: string,
    stints: unknown[],
    signal?: AbortSignal
  ): Promise<StrategySimulationResult | null> => {
    return executeRequest(
      () => fetchWithRetry(
        buildFastF1Url('/strategy-simulation', {
          year,
          event,
          stints: JSON.stringify(stints)
        }),
        { signal }
      ),
      signal
    );
  }, [executeRequest]);

  return {
    getSession, getTelemetry, getComparison, getLaps, getTrackMap, getQualifying,
    getActualStrategy, getLapDistribution, getTeamPace, getSeasonResults, getSeasonSummary,
    getWdcScenarios, getWccScenarios, getStrategySimulation,
    loading, error
  };
}
