import fastf1
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import os
from typing import Optional, List, Dict
import json
from functools import lru_cache

# Setup FastF1 Cache
CACHE_DIR = "f1_cache"
if not os.path.exists(CACHE_DIR):
    os.makedirs(CACHE_DIR)
fastf1.Cache.enable_cache(CACHE_DIR)

app = FastAPI(title="Pit Wall Pro - FastF1 Bridge")

@lru_cache(maxsize=10)
def _get_session(year: int, event: str, session_type: str):
    """
    Get session object without loading.
    """
    try:
        return fastf1.get_session(year, event, session_type)
    except Exception as e:
        print(f"Failed to get session object for {year} {event}: {e}")
        return None

def _load_session(session, laps=True, telemetry=False, weather=False):
    """
    Efficiently load session data if not already loaded.
    """
    if session is None:
        raise ValueError("Session object is None. Check if year/event exists.")
        
    try:
        # Check if already loaded to avoid redundant API calls
        # We use a safer way to check if loaded without triggering access errors
        already_loaded = False
        try:
            if laps and not session.laps.empty:
                already_loaded = True
                if telemetry and 'X' not in session.laps.columns:
                    already_loaded = False
        except:
            already_loaded = False
            
        if not already_loaded:
            event_name = getattr(session.event, 'EventName', 'Unknown Event')
            print(f">>> STARTING DATA LOAD: {event_name} - {session.name}")
            print(f"    (Laps: {laps}, Telemetry: {telemetry}, Weather: {weather})")
            
            # FastF1 load can be slow, especially on first run
            try:
                session.load(laps=laps, telemetry=telemetry, weather=weather)
                print(f">>> LOAD COMPLETE: {event_name}")
            except Exception as load_err:
                print(f"!!! CRITICAL LOAD ERROR for {event_name}: {load_err}")
                # Fallback to basic load if telemetry failed
                if telemetry:
                    print("Attempting fallback load without telemetry...")
                    session.load(laps=laps, telemetry=False, weather=False)
                    print("Fallback load successful.")
                else:
                    raise load_err
            
        return session
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Failed to load data for session: {e}")
        # If the failure was in our logging/logic before load, try a clean load here
        try:
            if session:
                session.load(laps=laps, telemetry=False, weather=False)
                return session
        except:
            pass
        raise HTTPException(status_code=404, detail=f"Data unavailable for this session: {str(e)}")

# Enable CORS for Next.js frontend
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://pit-wall-pro.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "Pit Wall Pro Bridge Active", "provider": "FastF1"}

@app.get("/session")
def get_session_info(year: int, event: str, session_type: str, background_tasks: BackgroundTasks):
    """
    Load session results and basic metadata.
    """
    try:
        session = _get_session(year, event, session_type)
        if session is None:
            raise HTTPException(status_code=404, detail="Session not found")
            
        _load_session(session, laps=True, telemetry=False)
        
        # Start background telemetry sync so it's ready when user goes to Analysis
        background_tasks.add_task(_load_session, session, laps=True, telemetry=True)
        
        # results is only populated after load()
        results = session.results
        if results is None or results.empty:
            return {"session_name": event, "location": "", "results": []}

        # Convert results to JSON serializable format
        clean_results = []
        for index, row in results.iterrows():
            clean_results.append({
                "position": int(row['Position']) if not pd.isna(row['Position']) else None,
                "driver_number": row['DriverNumber'],
                "driver_code": row['Abbreviation'],
                "team": row['TeamName'],
                "status": row['Status'] if 'Status' in row else "Finished",
                "points": float(row['Points']) if not pd.isna(row['Points']) else 0,
                "full_name": row['FullName']
            })
            
        return {
            "session_name": session.event['EventName'] if 'EventName' in session.event else event,
            "location": session.event['Location'] if 'Location' in session.event else "",
            "results": clean_results
        }
    except HTTPException as he: raise he
    except Exception as e:
        print(f"Error in get_session_info: {e}")
        raise HTTPException(status_code=500, detail=f"Data process failed: {str(e)}")

@app.get("/telemetry")
def get_driver_telemetry(year: int, event: str, session_type: str, driver: str, lap_number: Optional[int] = None):
    """
    Get detailed car telemetry (Speed, RPM, Throttle, Brake, Gear) for a driver.
    If lap_number is None, it picks the fastest lap.
    """
    try:
        session = _get_session(year, event, session_type)
        if session is None: raise HTTPException(status_code=404, detail="Session not found")
        _load_session(session, laps=True, telemetry=True)
        
        laps = session.laps.pick_driver(driver)
        if laps.empty: raise HTTPException(status_code=404, detail=f"No laps found for driver {driver}")
        
        if lap_number:
            target_lap = laps[laps['LapNumber'] == lap_number].iloc[0]
        else:
            target_lap = laps.pick_fastest()
            
        telemetry = target_lap.get_telemetry()
        
        # Select and format telemetry channels
        tel_data = {
            "time": telemetry['Time'].dt.total_seconds().tolist(),
            "speed": telemetry['Speed'].tolist(),
            "rpm": telemetry['RPM'].tolist(),
            "gear": telemetry['nGear'].tolist(),
            "throttle": telemetry['Throttle'].tolist(),
            "brake": telemetry['Brake'].tolist(),
            "drs": telemetry['DRS'].tolist(),
            "x": telemetry['X'].tolist(),
            "y": telemetry['Y'].tolist(),
            "distance": telemetry['Distance'].tolist()
        }
        
        return {
            "driver": driver,
            "lap_number": int(target_lap['LapNumber']),
            "lap_time": str(target_lap['LapTime']),
            "telemetry": tel_data
        }
    except HTTPException as he: raise he
    except Exception as e:
        print(f"Error in get_driver_telemetry: {e}")
        raise HTTPException(status_code=500, detail=f"Data process failed: {str(e)}")

@app.get("/comparison")
def compare_drivers(year: int, event: str, session_type: str, d1: str, d2: str):
    """
    Compare fastest laps of two drivers and calculate cumulative delta time.
    """
    try:
        session = _get_session(year, event, session_type)
        if session is None: raise HTTPException(status_code=404, detail="Session not found")
        _load_session(session, laps=True, telemetry=True)
        
        lap1 = session.laps.pick_driver(d1).pick_fastest()
        lap2 = session.laps.pick_driver(d2).pick_fastest()
        
        if lap1.empty or lap2.empty:
            raise HTTPException(status_code=404, detail="One or both drivers have no lap data")
            
        tel1 = lap1.get_telemetry().add_distance()
        tel2 = lap2.get_telemetry().add_distance()
        
        # Calculate Delta Time
        delta, ref_tel, target_tel = fastf1.utils.delta_time(lap1, lap2)
        
        return {
            "d1": {
                "name": d1,
                "lap_time": str(lap1['LapTime']),
                "speed": tel1['Speed'].tolist(),
                "distance": tel1['Distance'].tolist(),
                "gear": tel1['nGear'].tolist()
            },
            "d2": {
                "name": d2,
                "lap_time": str(lap2['LapTime']),
                "speed": tel2['Speed'].tolist(),
                "distance": tel2['Distance'].tolist(),
                "gear": tel2['nGear'].tolist()
            },
            "delta": delta.tolist(),
            "ref_distance": ref_tel['Distance'].tolist()
        }
    except HTTPException as he: raise he
    except Exception as e:
        print(f"Error in compare_drivers: {e}")
        raise HTTPException(status_code=500, detail=f"Data process failed: {str(e)}")

@app.get("/laps")
def get_all_laps(year: int, event: str, session_type: str):
    """
    Get all lap times for all drivers in a session.
    """
    try:
        session = _get_session(year, event, session_type)
        if session is None: raise HTTPException(status_code=404, detail="Session not found")
        _load_session(session, laps=True, telemetry=False)
        
        laps_data = []
        for index, row in session.laps.iterrows():
            if pd.isna(row['LapTime']): continue
            laps_data.append({
                "driver": row['Driver'],
                "lap_number": int(row['LapNumber']),
                "lap_time": row['LapTime'].total_seconds(),
                "compound": row['Compound'],
                "is_personal_best": row['IsPersonalBest']
            })
            
        return laps_data
    except HTTPException as he: raise he
    except Exception as e:
        print(f"Error in get_all_laps: {e}")
        raise HTTPException(status_code=500, detail=f"Data process failed: {str(e)}")

@app.get("/position-changes")
def get_position_changes(year: int, event: str):
    """
    Get per-lap position data for all drivers in a race.
    """
    try:
        session = _get_session(year, event, 'R')
        if session is None: raise HTTPException(status_code=404, detail="Session not found")
        _load_session(session, laps=True, telemetry=False)
        
        changes = {}
        for drv in session.drivers:
            drv_laps = session.laps.pick_driver(drv)
            if drv_laps.empty: continue
            
            abb = drv_laps['Driver'].iloc[0]
            changes[abb] = {
                "laps": drv_laps['LapNumber'].tolist(),
                "positions": drv_laps['Position'].tolist()
            }
            
        return changes
    except HTTPException as he: raise he
    except Exception as e:
        print(f"Error in get_position_changes: {e}")
        raise HTTPException(status_code=500, detail=f"Data process failed: {str(e)}")

@app.get("/qualifying")
def get_qualifying_results(year: int, event: str):
    """
    Get Q1, Q2, Q3 lap times for all drivers.
    """
    try:
        session = _get_session(year, event, 'Q')
        if session is None: raise HTTPException(status_code=404, detail="Session not found")
        _load_session(session, laps=True, telemetry=False)
        
        results = session.results
        if results is None or results.empty: return []

        clean_results = []
        for index, row in results.iterrows():
            results_entry = {
                "driver": row['Abbreviation'],
                "team": row['TeamName'],
                "position": int(row['Position']) if not pd.isna(row['Position']) else None,
                "q1": row['Q1'].total_seconds() if not pd.isna(row['Q1']) else None,
                "q2": row['Q2'].total_seconds() if not pd.isna(row['Q2']) else None,
                "q3": row['Q3'].total_seconds() if not pd.isna(row['Q3']) else None,
            }
            results_entry["best_lap"] = results_entry["q3"] or results_entry["q2"] or results_entry["q1"]
            clean_results.append(results_entry)
            
        return clean_results
    except HTTPException as he: raise he
    except Exception as e:
        print(f"Error in get_qualifying_results: {e}")
        raise HTTPException(status_code=500, detail=f"Data process failed: {str(e)}")

@app.get("/track-map")
def get_track_map(year: int, event: str, session_type: str, driver: Optional[str] = None):
    """
    Get X/Y coordinates + speed + gear per telemetry point for the fastest lap.
    """
    try:
        session = _get_session(year, event, session_type)
        if session is None: raise HTTPException(status_code=404, detail="Session not found")
        _load_session(session, laps=True, telemetry=True)
        
        if driver:
            laps = session.laps.pick_driver(driver)
            if laps.empty: raise HTTPException(status_code=404, detail=f"No laps for {driver}")
            lap = laps.pick_fastest()
        else:
            lap = session.laps.pick_fastest()
            
        if lap is None or (hasattr(lap, 'empty') and lap.empty): 
            raise HTTPException(status_code=404, detail="No lap data found")
            
        telemetry = lap.get_telemetry().add_distance()
        circuit_info = session.get_circuit_info()
        
        track_data = {
            "x": telemetry['X'].tolist(),
            "y": telemetry['Y'].tolist(),
            "speed": telemetry['Speed'].tolist(),
            "gear": telemetry['nGear'].tolist(),
            "throttle": telemetry['Throttle'].tolist(),
            "brake": telemetry['Brake'].tolist(),
            "distance": telemetry['Distance'].tolist(),
            "corners": []
        }
        
        if circuit_info:
            for _, corner in circuit_info.corners.iterrows():
                track_data["corners"].append({
                    "number": str(corner['Number']) + str(corner['Letter']),
                    "x": corner['X'],
                    "y": corner['Y'],
                    "angle": corner['Angle'],
                    "distance": float(corner['Distance']) if 'Distance' in corner else 0
                })
                
        return track_data
    except HTTPException as he: raise he
    except Exception as e:
        print(f"Error in get_track_map: {e}")
        raise HTTPException(status_code=500, detail=f"Data process failed: {str(e)}")

@app.get("/strategy-actual")
def get_actual_strategy(year: int, event: str):
    """
    Actual pit stop data and compound history for all drivers.
    """
    try:
        session = _get_session(year, event, 'R')
        if session is None: raise HTTPException(status_code=404, detail="Session not found")
        _load_session(session, laps=True, telemetry=False)
        
        stints = session.laps[["Driver", "Stint", "Compound", "LapNumber"]]
        stints = stints.groupby(["Driver", "Stint", "Compound"]).count().reset_index()
        stints = stints.rename(columns={"LapNumber": "StintLength"})
        
        return stints.to_dict(orient="records")
    except HTTPException as he: raise he
    except Exception as e:
        print(f"Error in get_actual_strategy: {e}")
        raise HTTPException(status_code=500, detail=f"Data process failed: {str(e)}")

@app.get("/lap-distribution")
def get_lap_distribution(year: int, event: str):
    """
    Lap time distribution per driver/compound.
    """
    try:
        session = _get_session(year, event, 'R')
        if session is None: raise HTTPException(status_code=404, detail="Session not found")
        _load_session(session, laps=True, telemetry=False)
        
        top_10 = session.drivers[:10]
        laps = session.laps.pick_drivers(top_10).pick_quicklaps()
        
        dist_data = []
        for index, row in laps.iterrows():
            dist_data.append({
                "driver": row['Driver'],
                "lap_time": row['LapTime'].total_seconds(),
                "compound": row['Compound']
            })
            
        return dist_data
    except HTTPException as he: raise he
    except Exception as e:
        print(f"Error in get_lap_distribution: {e}")
        raise HTTPException(status_code=500, detail=f"Data process failed: {str(e)}")

@app.get("/team-pace")
def get_team_pace(year: int, event: str):
    """
    Median lap time per team for pace ranking.
    """
    try:
        session = _get_session(year, event, 'R')
        if session is None: raise HTTPException(status_code=404, detail="Session not found")
        _load_session(session, laps=True, telemetry=False)
        
        laps = session.laps.pick_quicklaps()
        if laps.empty: return []
        
        laps['LapTimeSeconds'] = laps['LapTime'].dt.total_seconds()
        team_pace = laps[['Team', 'LapTimeSeconds']].groupby('Team').median().sort_values(by='LapTimeSeconds')
        
        return team_pace.reset_index().to_dict(orient="records")
    except HTTPException as he: raise he
    except Exception as e:
        print(f"Error in get_team_pace: {e}")
        raise HTTPException(status_code=500, detail=f"Data process failed: {str(e)}")

@app.get("/season-results")
def get_season_results(year: int):
    """
    Results tracker: per-round finish positions for all drivers.
    """
    try:
        from fastf1.ergast import Ergast
        ergast = Ergast()
        races = ergast.get_race_schedule(year)
        if races is None or len(races) == 0:
            return []
            
        all_results = []
        for rnd, race_name in races['raceName'].items():
            res = ergast.get_race_results(season=year, round=rnd + 1)
            if not res.content: continue
            
            temp = res.content[0]
            temp['round'] = rnd + 1
            temp['race'] = race_name
            all_results.append(temp[['round', 'race', 'driverCode', 'points', 'position']])
            
        if not all_results: return []
        final_df = pd.concat(all_results)
        return final_df.to_dict(orient="records")
    except Exception as e:
        print(f"Error in get_season_results: {e}")
        raise HTTPException(status_code=500, detail=f"Data process failed: {str(e)}")

@app.get("/season-summary")
def get_season_summary(year: int):
    """
    Season wins, podiums, DNFs per driver.
    """
    try:
        from fastf1.ergast import Ergast
        ergast = Ergast()
        standings = ergast.get_driver_standings(season=year)
        if not standings.content: return []
        
        return standings.content[0].to_dict(orient="records")
    except Exception as e:
        print(f"Error in get_season_summary: {e}")
        raise HTTPException(status_code=500, detail=f"Data process failed: {str(e)}")

@app.get("/wdc-scenarios")
def get_wdc_scenarios(year: int, current_round: int):
    """
    Championship math: points gap, max available.
    """
    try:
        from fastf1.ergast import Ergast
        ergast = Ergast()
        standings_response = ergast.get_driver_standings(season=year, round=current_round)
        
        # Calculate remaining points
        POINTS_FOR_SPRINT = 8 + 25
        POINTS_FOR_CONVENTIONAL = 25
        
        try:
            events = fastf1.events.get_event_schedule(year, backend='ergast')
            remaining_events = events[events['RoundNumber'] > current_round]
            sprint_events = len(remaining_events[remaining_events["EventFormat"] == "sprint_shootout"])
            conventional_events = len(remaining_events[remaining_events["EventFormat"] == "conventional"])
            max_points_available = (sprint_events * POINTS_FOR_SPRINT) + (conventional_events * POINTS_FOR_CONVENTIONAL)
        except:
            max_points_available = 0

        if not standings_response.content:
            return {"max_remaining_points": max_points_available, "drivers": [], "error": "No data available"}
        
        standings = standings_response.content[0]
        if standings.empty:
            return {"max_remaining_points": max_points_available, "drivers": [], "error": "Empty standings"}
            
        leader_points = float(standings.iloc[0]['points'])
        results = []
        for _, row in standings.iterrows():
            current_points = float(row['points'])
            can_win = (current_points + max_points_available) >= leader_points
            results.append({
                "driver": row['driverCode'],
                "points": current_points,
                "max_possible": current_points + max_points_available,
                "can_win": can_win
            })
            
        return {
            "max_remaining_points": max_points_available,
            "drivers": results
        }
    except Exception as e:
        print(f"Error in get_wdc_scenarios: {e}")
        raise HTTPException(status_code=500, detail=f"Data process failed: {str(e)}")

@app.get("/wcc-scenarios")
def get_wcc_scenarios(year: int, current_round: int):
    """
    Championship math for constructors.
    """
    try:
        from fastf1.ergast import Ergast
        ergast = Ergast()
        standings_response = ergast.get_constructor_standings(season=year, round=current_round)
        
        POINTS_PER_RACE = 43 # P1 + P2
        POINTS_FL = 1
        POINTS_SPRINT = 15
        total_rounds = 24
        remaining_rounds = max(0, total_rounds - current_round)
        remaining_sprints = max(0, 6 - (current_round // 4)) 
        max_remaining = (remaining_rounds * (POINTS_PER_RACE + POINTS_FL)) + (remaining_sprints * POINTS_SPRINT)

        if not standings_response.content:
            return {"max_remaining_points": max_remaining, "teams": [], "error": "No data available"}
        
        standings = standings_response.content[0]
        if standings.empty:
            return {"max_remaining_points": max_remaining, "teams": [], "error": "Empty standings"}
            
        leader_points = float(standings.iloc[0]['points'])
        teams = []
        for _, row in standings.iterrows():
            team_points = float(row['points'])
            max_possible = team_points + max_remaining
            teams.append({
                "team": row['constructorName'] if 'constructorName' in row else row['name'],
                "points": team_points,
                "max_possible": max_possible,
                "can_win": max_possible >= leader_points
            })
            
        return {
            "max_remaining_points": max_remaining,
            "teams": teams,
            "round": current_round
        }
    except Exception as e:
        print(f"Error in get_wcc_scenarios: {e}")
        raise HTTPException(status_code=500, detail=f"Data process failed: {str(e)}")

@app.get("/strategy-simulation")
def get_strategy_simulation(year: int, event: str, stints: str):
    """
    Predict race duration based on a list of stints.
    """
    try:
        stints_list = json.loads(stints)
        base_lap_time = 90.0 
        comp_mods = {"SOFT": -1.0, "MEDIUM": 0.0, "HARD": 1.5, "INTERMEDIATE": 5.0, "WET": 10.0}
        deg_mods = {"SOFT": 0.15, "MEDIUM": 0.08, "HARD": 0.04, "INTERMEDIATE": 0.2, "WET": 0.3}
        
        total_time = 0.0
        pit_stop_time = 24.0
        simulation_results = []
        
        for i, stint in enumerate(stints_list):
            comp = stint.get("compound", "MEDIUM").upper()
            laps = stint.get("laps", 1)
            stint_times = []
            for l in range(laps):
                lap_time = base_lap_time + comp_mods.get(comp, 0.0) + (deg_mods.get(comp, 0.08) * l)
                stint_times.append(lap_time)
                total_time += lap_time
            
            simulation_results.append({
                "stint": i + 1,
                "compound": comp,
                "laps": laps,
                "avg_lap": sum(stint_times) / len(stint_times) if stint_times else 0,
                "stint_time": sum(stint_times)
            })
            if i < len(stints_list) - 1: total_time += pit_stop_time
                
        return {
            "total_time": total_time,
            "total_time_formatted": f"{int(total_time // 3600)}h {int((total_time % 3600) // 60)}m {int(total_time % 60)}s",
            "stints": simulation_results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
