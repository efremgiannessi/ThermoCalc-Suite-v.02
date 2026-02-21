import { motion } from "motion/react";
import { ShieldCheck, Activity, Cpu, Database, Network } from "lucide-react";
import { useState, useEffect } from "react";

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("INIZIALIZZAZIONE NUCLEO...");
  const [logs, setLogs] = useState<string[]>([]);

  const bootLogs = [
    "CARICAMENTO MODULI TERMICI...",
    "SINCRONIZZAZIONE DATABASE MATERIALI...",
    "CALIBRAZIONE MOTORE DI CALCOLO...",
    "VERIFICA INTEGRITÀ SISTEMA...",
    "ACCESSO AUTORIZZATO: OMNICALC v11.0.2",
    "AVVIO INTERFACCIA INDUSTRIALE..."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 150);

    return () => clearInterval(timer);
  }, [onComplete]);

  useEffect(() => {
    const logInterval = setInterval(() => {
      if (logs.length < bootLogs.length) {
        const nextLog = bootLogs[logs.length];
        setLogs(prev => [...prev, nextLog]);
        setStatus(nextLog);
      }
    }, 400);

    return () => clearInterval(logInterval);
  }, [logs]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
      transition={{ duration: 0.8, ease: "circOut" }}
      className="fixed inset-0 z-[10000] bg-[#070b14] flex flex-col items-center justify-center font-mono overflow-hidden"
    >
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#ea580c 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      
      {/* Scanning Line */}
      <motion.div 
        animate={{ top: ["0%", "100%"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 h-[2px] bg-orange-500/20 shadow-[0_0_15px_rgba(234,88,12,0.5)] z-10"
      />

      <div className="relative w-full max-w-md px-8">
        {/* Logo Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col items-center mb-12"
        >
          <div className="relative mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-4 border border-orange-500/20 rounded-full border-dashed"
            />
            <div className="bg-orange-600 p-4 rounded-xl shadow-[0_0_30px_rgba(234,88,12,0.4)] relative z-20">
              <ShieldCheck size={48} className="text-white" />
            </div>
          </div>
          
          <h1 className="text-white text-4xl font-black tracking-tighter uppercase italic">
            OMNI<span className="text-orange-500">CALC</span>
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="h-[1px] w-8 bg-orange-500/50" />
            <span className="text-[10px] text-orange-500 font-bold tracking-[0.3em] uppercase">Industriale v11</span>
            <span className="h-[1px] w-8 bg-orange-500/50" />
          </div>
        </motion.div>

        {/* Progress Bar */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest animate-pulse">
                {status}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <Activity size={12} className="text-emerald-500" />
                <span className="text-[9px] text-emerald-500/80 font-bold uppercase">Sistema Operativo: OK</span>
              </div>
            </div>
            <span className="text-xl text-white font-black italic">{Math.min(100, Math.round(progress))}%</span>
          </div>

          <div className="h-1.5 w-full bg-gray-900 rounded-full overflow-hidden border border-white/5 p-[2px]">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full shadow-[0_0_15px_rgba(234,88,12,0.5)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>

          {/* Terminal Logs */}
          <div className="mt-8 bg-black/40 border border-white/5 rounded-lg p-4 h-32 overflow-hidden relative">
            <div className="absolute top-0 right-4 flex gap-2 pt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
              <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
            </div>
            <div className="space-y-1">
              {logs.map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-orange-500/50 text-[10px] tracking-tighter">[{new Date().toLocaleTimeString()}]</span>
                  <span className="text-gray-400 text-[9px] font-bold uppercase tracking-wider">{log}</span>
                </motion.div>
              ))}
              <motion.div 
                animate={{ opacity: [0, 1] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="w-2 h-3 bg-orange-500 inline-block align-middle ml-1"
              />
            </div>
          </div>
        </div>

        {/* Footer Icons */}
        <div className="mt-12 flex justify-center gap-8 opacity-30">
          <Cpu size={16} className="text-orange-500" />
          <Database size={16} className="text-orange-500" />
          <Network size={16} className="text-orange-500" />
        </div>
      </div>
    </motion.div>
  );
}
