interface Props {
  showToast: (msg: string) => void;
}

export default function Montaggio(_: Props) {
  return (
    <div className="glass-panel rounded-2xl p-8 animate-slide-in flex flex-col items-center justify-center min-h-[400px] text-center relative overflow-hidden">
        {/* Decorazione sfondo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

        <div className="bg-slate-700/30 p-8 rounded-full mb-6 border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.3)] backdrop-blur-md relative z-10">
            <i className="fa-solid fa-screwdriver-wrench text-6xl text-slate-400"></i>
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-3 relative z-10">Sezione Montaggio</h2>
        <p className="text-slate-400 max-w-md text-lg relative z-10">
            Questa sezione è in fase di sviluppo.
        </p>
        <p className="text-slate-500 text-sm mt-2 max-w-sm relative z-10">
            Presto saranno disponibili nuovi strumenti per il calcolo di tempi, costi e procedure di installazione.
        </p>
    </div>
  );
}