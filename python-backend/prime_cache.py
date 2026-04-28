import fastf1
import os
import argparse
import sys

# python prime_cache.py 2024

# Setup Cache - Must match main.py
CACHE_DIR = "f1_cache"
if not os.path.exists(CACHE_DIR):
    os.makedirs(CACHE_DIR)
fastf1.Cache.enable_cache(CACHE_DIR)

def prime_season(year):
    print(f"\n{'='*60}")
    print(f"PIT WALL PRO - SEASON PRIMER: {year}")
    print(f"{'='*60}")
    print(f"Fetching full telemetry for all events in {year}...")
    
    try:
        schedule = fastf1.get_event_schedule(year)
        # Filter for actual races (not pre-season testing)
        races = schedule[schedule['EventFormat'] != 'testing']
        
        total = len(races)
        print(f"Found {total} events to process.\n")
        
        for i, (index, race) in enumerate(races.iterrows()):
            event_name = race['EventName']
            print(f"[{i+1}/{total}] Processing: {event_name}...")
            
            # Standard sessions to prime
            sessions = ['FP1', 'FP2', 'FP3', 'Q', 'R']
            if race['EventFormat'] == 'sprint':
                sessions = ['FP1', 'Q', 'S', 'FP2', 'R']
            elif race['EventFormat'] == 'sprint_shootout':
                sessions = ['FP1', 'Q', 'SS', 'S', 'R']
                
            for session_type in sessions:
                try:
                    print(f"  - Loading {session_type} telemetry...", end="", flush=True)
                    session = fastf1.get_session(year, event_name, session_type)
                    session.load(laps=True, telemetry=True, weather=False)
                    print(" DONE")
                except Exception as e:
                    print(f" FAILED (Might not have happened yet or data missing)")
                    
        print(f"\n{'='*60}")
        print(f"SUCCESS: Season {year} is now fully cached!")
        print(f"You can now use the dashboard with ZERO LAG for this season.")
        print(f"{'='*60}\n")
        
    except Exception as e:
        print(f"\nERROR: Failed to fetch schedule for {year}: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Prime the F1 cache for a specific season.')
    parser.add_argument('year', type=int, help='The season year to prime (e.g., 2024)')
    
    if len(sys.argv) < 2:
        parser.print_help()
        sys.exit(1)
        
    args = parser.parse_args()
    prime_season(args.year)
