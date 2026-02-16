
import { ShieldCheck, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 py-8 border-t border-white/5 relative z-10 no-print animate-fade-in">
      <div className="flex flex-col items-center gap-6 text-center">
        
        {/* Security Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0a0f1d] border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
            <ShieldCheck size={12} className="text-orange-500" />
            <span className="text-[10px] font-black text-orange-500 tracking-widest uppercase">IP Security Protocol</span>
        </div>

        {/* Branding */}
        <div className="space-y-2">
            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white">
                Developed by <span className="text-orange-600">Efrem Giannessi</span>
            </h3>
            <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-[0.25em]">Concrete Optimization Engineering Solutions</p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
            <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-600"></span> 2024-2025 All Rights Reserved
            </span>
            <a href="https://www.efremgiannessi.org" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-orange-500 transition-colors group">
                <Globe size={12} className="group-hover:animate-pulse"/> efremgiannessi.org
            </a>
        </div>

        {/* Legal Disclaimer */}
        <div className="max-w-3xl w-full bg-black/40 rounded-xl p-6 border border-white/5 mx-auto mt-4 backdrop-blur-sm">
            <p className="text-[9px] text-slate-600 font-medium leading-relaxed uppercase text-center tracking-wide">
                LEGAL: CORE ALGORITHMS ARE THE EXCLUSIVE PROPERTY OF EFREM GIANNESSI. UNAUTHORIZED REPRODUCTION OR REVERSE ENGINEERING IS STRICTLY PROHIBITED AND PROTECTED BY INTERNATIONAL IP LAWS.
            </p>
        </div>
      </div>
    </footer>
  );
}
