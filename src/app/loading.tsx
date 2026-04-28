"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0a]">
      <div className="relative w-48 h-48 mb-8">
        {/* Outer rotating ring */}
        <motion.div
          className="absolute inset-0 border-2 border-white/5 border-t-[var(--f1-red)] rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Inner pulsing logo area */}
        <div className="absolute inset-4 border border-white/10 rounded-full flex items-center justify-center bg-white/[0.02] backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0.2, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, repeat: Infinity, repeatType: "mirror" }}
            className="font-orbitron font-black text-2xl text-white tracking-tighter"
          >
            PIT<span className="text-[var(--f1-red)]">WALL</span>
          </motion.div>
        </div>
        
        {/* Scanning line animation */}
        <motion.div
          className="absolute top-0 left-0 w-full h-[1px] bg-[var(--f1-red)] shadow-[0_0_15px_var(--f1-red)] z-10"
          animate={{ top: ["0%", "100%", "0%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="font-mono text-[10px] text-[var(--f1-red)] tracking-[0.5em] uppercase animate-pulse">
          Establishing_Uplink
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 bg-white rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-12 left-12 font-mono text-[8px] text-white/20 uppercase max-w-xs space-y-1">
        <div>SYS_LOAD: CALIBRATING_TELEMETRY_PIPELINES...</div>
        <div>UPLINK_STATUS: OPTIMIZING_PACKET_ROUTING</div>
      </div>
    </div>
  );
}
