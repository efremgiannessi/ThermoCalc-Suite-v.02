interface Props {
  showToast: (msg: string) => void;
}

export default function Trasporto(_: Props) {
  return (
    <div className="glass-panel rounded-2xl p-8 animate-slide-in flex flex-col items-center justify-center min-h-[400px] text-center relative overflow-hidden">
        {/* Decorazione sfondo */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="bg-slate-700/30 p-8 rounded-full mb-6 border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.3)] backdrop-blur-md relative z-10">
            <i className="fa-solid fa-truck-fast text-6xl text-slate-400"></i>
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-3 relative z-10">Sezione Trasporto</h2>
        <p className="text-slate-400 max-w-md text-lg relative z-10">
            Funzionalità in arrivo.
        </p>
        <p className="text-slate-500 text-sm mt-2 max-w-sm relative z-10">
            Stiamo sviluppando strumenti per il calcolo volumetrico, costi di spedizione e ottimizzazione del carico.
        </p>
    </div>
  );
}