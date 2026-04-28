"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flag, Users, Building2, Trophy, History,
  Bell, Settings, Menu, X, Radio, ChevronRight,
  Gamepad2, Brain, Mic, BarChart3, Repeat, Calendar as CalendarIcon, Activity, Zap,
  RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/f1Store";
import { useLiveRaceStore } from "@/store/f1Store";

const NAV_GROUPS = [
  {
    label: "ENGINEERING",
    items: [
      { href: "/analytics", label: "ANALYTICS", icon: BarChart3 },
      { href: "/analysis", label: "TELEMETRY", icon: Activity },
      { href: "/strategy", label: "STRATEGY", icon: Repeat },
    ]
  },
  {
    label: "RACE_OPS",
    items: [
      { href: "/live", label: "LIVE", icon: Radio, isLive: true },
      { href: "/qualifying", label: "QUALIFYING", icon: Zap },
      { href: "/replay", label: "REPLAY", icon: RotateCcw },
    ]
  },
  {
    label: "AI_ASSIST",
    items: [
      { href: "/ai", label: "COMMAND", icon: Brain },
      { href: "/voice", label: "VOICE", icon: Mic },
      { href: "/history", label: "VAULT", icon: History },
    ]
  },
  {
    label: "COMMUNITY",
    items: [
      { href: "/drivers", label: "DRIVERS", icon: Users },
      { href: "/teams", label: "TEAMS", icon: Building2 },
      { href: "/fantasy", label: "FANTASY", icon: Gamepad2 },
    ]
  },
  {
    label: "SEASON",
    items: [
      { href: "/championship", label: "WDC", icon: Trophy },
      { href: "/calendar", label: "CALENDAR", icon: CalendarIcon },
    ]
  }
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  
  const { unreadCount, isAuthenticated, profile } = useUserStore();
  const { isConnected } = useLiveRaceStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <header className="sticky top-0 z-[100] border-b border-white/10"
        style={{ background: "rgba(5,5,10,0.85)", backdropFilter: "blur(20px)" }}>
        <div className="max-w-[1700px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
           <div className="flex items-center gap-6">
              <div className="font-orbitron font-900 text-sm text-white tracking-widest leading-none italic uppercase">PITWALL<span className="text-[var(--f1-red)]">PRO</span></div>
           </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-[100] border-b border-white/10"
      style={{ background: "rgba(5,5,10,0.85)", backdropFilter: "blur(20px)" }}>
      <div className="max-w-[1700px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Left: Logo & Core */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-8 h-8 bg-[var(--f1-red)] flex items-center justify-center rotate-45 group-hover:rotate-0 transition-transform duration-500"
              style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}>
              <Flag size={14} className="text-white -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
            </div>
            <div className="hidden sm:block">
              <div className="font-orbitron font-900 text-sm text-white tracking-widest leading-none italic">PITWALL<span className="text-[var(--f1-red)]">PRO</span></div>
              <div className="font-mono text-[8px] text-white/30 tracking-[0.3em] uppercase">Tactical_Intelligence_System</div>
            </div>
          </Link>

          {/* Desktop Nav: Dropdown Refactor */}
          <nav className="hidden xl:flex items-center gap-2 border-l border-white/10 pl-6 h-16">
            {NAV_GROUPS.map((group) => (
              <div 
                key={group.label} 
                className="relative h-full flex items-center"
                onMouseEnter={() => setActiveGroup(group.label)}
                onMouseLeave={() => setActiveGroup(null)}
              >
                <button className={cn(
                  "flex items-center gap-2 px-4 py-2 font-mono text-[9px] tracking-[0.2em] font-bold transition-all",
                  activeGroup === group.label ? "text-white bg-white/5" : "text-white/40 hover:text-white"
                )}>
                  {group.label}
                  <ChevronRight size={10} className={cn("transition-transform duration-300", activeGroup === group.label ? "rotate-90 text-[var(--f1-red)]" : "rotate-0")} />
                </button>

                <AnimatePresence>
                  {activeGroup === group.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute top-[100%] left-0 min-w-[200px] bg-[var(--f1-darker)] border border-white/10 shadow-2xl p-2 z-[110]"
                      style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)" }}
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-[var(--f1-red)]" />
                      {group.items.map((item) => {
                        const active = pathname === item.href;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                              "flex items-center gap-3 px-4 py-3 font-mono text-[10px] tracking-widest transition-all group/item",
                              active ? "text-white bg-[var(--f1-red)]/10" : "text-white/50 hover:text-white hover:bg-white/5"
                            )}
                          >
                            <item.icon size={12} className={cn(active ? "text-[var(--f1-red)]" : "text-white/20 group-hover/item:text-[var(--f1-red)]")} />
                            {item.label}
                            {item.isLive && isConnected && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[var(--f1-red)] animate-pulse ml-auto" />
                            )}
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3">
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 border font-mono text-[8px] tracking-[0.2em]",
              isConnected ? "border-green-500/40 bg-green-500/5 text-green-400" : "border-white/10 text-white/30"
            )}>
              <div className={cn("w-1 h-1 rounded-full", isConnected ? "bg-green-500 animate-pulse" : "bg-white/20")} />
              {isConnected ? "LIVE" : "SYNC_READY"}
            </div>

            {isAuthenticated && (
              <div className="flex items-center gap-1 border-x border-white/10 px-4">
                <Link href="/notifications" className="p-2 text-white/40 hover:text-white relative">
                  <Bell size={16} />
                  {unreadCount > 0 && <span className="absolute top-1 right-1 w-3 h-3 bg-[var(--f1-red)] rounded-full text-[7px] flex items-center justify-center font-bold text-white">{unreadCount}</span>}
                </Link>
                <Link href="/settings" className="p-2 text-white/40 hover:text-white">
                  <Settings size={16} />
                </Link>
              </div>
            )}
          </div>

          {isAuthenticated ? (
            <Link href="/settings" className="flex items-center gap-3 pl-2 group">
              <div className="hidden lg:block text-right">
                <div className="font-orbitron font-bold text-[9px] text-white tracking-widest">{profile.username}</div>
                <div className="font-mono text-[7px] text-[var(--f1-red)] tracking-widest font-black uppercase">Engineer_Grade_A</div>
              </div>
              <div className="w-8 h-8 bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[var(--f1-red)] transition-all">
                <Users size={14} className="text-white/60 group-hover:text-white" />
              </div>
            </Link>
          ) : (
            <Link href="/auth" className="px-5 py-2 bg-[var(--f1-red)] text-white font-orbitron font-bold text-[9px] tracking-[0.2em] italic hover:scale-105 transition-transform">LOGIN_REQUIRED</Link>
          )}

          <button onClick={() => setMobileOpen(!mobileOpen)} className="2xl:hidden p-2 text-white">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            className="2xl:hidden border-t border-white/10 bg-black/95 overflow-hidden"
          >
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-8">
              {NAV_GROUPS.map(group => (
                <div key={group.label} className="space-y-4">
                  <h4 className="font-mono text-[8px] text-white/20 tracking-[0.4em] font-black border-b border-white/5 pb-2">{group.label}</h4>
                  <div className="flex flex-col gap-2">
                    {group.items.map(item => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-3 p-3 font-mono text-[10px] tracking-widest border transition-all",
                          pathname === item.href ? "border-[var(--f1-red)] bg-white/5 text-white" : "border-white/5 text-white/40 hover:border-white/20"
                        )}
                      >
                        <item.icon size={12} />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
