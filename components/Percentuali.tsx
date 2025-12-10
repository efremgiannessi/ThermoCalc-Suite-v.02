import React, { useState } from 'react';

interface Props {
  showToast: (msg: string) => void;
}

export default function Percentuali({ showToast }: Props) {
  const [val, setVal] = useState('');
  const [rate, setRate] = useState('');
  const [resAdd, setResAdd] = useState('--');
  const [resSub, setResSub] = useState('--');

  const [dStart, setDStart] = useState('');
  const [dEnd, setDEnd] = useState('');
  const [delta, setDelta] = useState({ val: '-- %', isPos: true });

  const copy = (t: string) => { navigator.clipboard.writeText(t); showToast('Copiato!'); };

  const calcPerc = (v: string, r: string) => {
    setVal(v); setRate(r);
    const numVal = parseFloat(v);
    const numRate = parseFloat(r);
    if(!isNaN(numVal) && !isNaN(numRate)) {
       const amount = numVal * (numRate/100);
       setResAdd((numVal + amount).toFixed(2));
       setResSub((numVal - amount).toFixed(2));
    } else {
        setResAdd('--'); setResSub('--');
    }
  };

  const calcDelta = (s: string, e: string) => {
      setDStart(s); setDEnd(e);
      const start = parseFloat(s);
      const end = parseFloat(e);
      if(!isNaN(start) && !isNaN(end) && start !== 0) {
          const d = ((end - start) / start) * 100;
          setDelta({ val: (d > 0 ? "+" : "") + d.toFixed(2) + " %", isPos: d >= 0 });
      } else {
          setDelta({ val: '-- %', isPos: true });
      }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto animate-slide-in">
        <div className="glass-panel rounded-2xl p-8 flex flex-col justify-between">
            <div>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <span className="bg-pink-500/20 w-10 h-10 rounded-xl flex items-center justify-center text-pink-500 border border-pink-500/20"><i className="fa-solid fa-arrow-trend-up"></i></span> 
                    Applica %
                </h2>
                <div className="flex gap-4 mb-8">
                    <div className="relative w-full group">
                        <label className="text-[10px] text-slate-400 font-bold uppercase absolute -top-5 left-1">Valore</label>
                        <input type="number" value={val} onChange={e=>calcPerc(e.target.value, rate)} className="w-full glass-input rounded-xl p-4 text-white text-xl font-mono" placeholder="0.00"/>
                    </div>
                    <div className="relative w-32">
                        <label className="text-[10px] text-slate-400 font-bold uppercase absolute -top-5 left-1">Rate %</label>
                        <input type="number" value={rate} onChange={e=>calcPerc(val, e.target.value)} className="w-full glass-input rounded-xl p-4 text-white text-xl font-mono" placeholder="22"/>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="relative group cursor-pointer" onClick={()=>copy(resAdd)}>
                    <div className="glass-input bg-emerald-500/5 hover:bg-emerald-500/20 border-emerald-500/20 p-5 rounded-2xl text-center transition-all duration-300 group-hover:-translate-y-1">
                        <div className="text-[10px] font-bold text-emerald-400/60 uppercase mb-1">Aggiungi</div>
                        <div className="text-2xl font-bold text-emerald-400 font-mono">{resAdd}</div>
                    </div>
                </div>
                <div className="relative group cursor-pointer" onClick={()=>copy(resSub)}>
                    <div className="glass-input bg-red-500/5 hover:bg-red-500/20 border-red-500/20 p-5 rounded-2xl text-center transition-all duration-300 group-hover:-translate-y-1">
                        <div className="text-[10px] font-bold text-red-400/60 uppercase mb-1">Sottrai</div>
                        <div className="text-2xl font-bold text-red-400 font-mono">{resSub}</div>
                    </div>
                </div>
            </div>
        </div>

        <div className="glass-panel rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="bg-blue-500/20 w-10 h-10 rounded-xl flex items-center justify-center text-blue-500 border border-blue-500/20"><i className="fa-solid fa-percent"></i></span> 
                Variazione Delta
            </h2>
            <div className="space-y-6 mb-8">
                 <div className="relative">
                     <label className="text-[10px] text-slate-400 font-bold uppercase mb-2 block ml-1">Valore Iniziale</label>
                     <input type="number" value={dStart} onChange={e=>calcDelta(e.target.value, dEnd)} className="w-full glass-input rounded-xl p-4 text-white" placeholder="0.00"/>
                 </div>
                 <div className="relative">
                     <label className="text-[10px] text-slate-400 font-bold uppercase mb-2 block ml-1">Valore Finale</label>
                     <input type="number" value={dEnd} onChange={e=>calcDelta(dStart, e.target.value)} className="w-full glass-input rounded-xl p-4 text-white" placeholder="0.00"/>
                 </div>
            </div>
            <div className="mt-auto p-6 bg-black/30 rounded-2xl text-center border border-white/5 relative group cursor-pointer hover:bg-black/40 transition-colors shadow-inner" onClick={()=>copy(delta.val)}>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Risultato Variazione</div>
                <span className={`text-4xl font-bold font-mono ${delta.isPos ? 'text-emerald-400' : 'text-red-400'} drop-shadow-lg`}>{delta.val}</span>
                <i className="fa-regular fa-copy absolute top-4 right-4 text-slate-600 group-hover:text-white transition-colors"></i>
            </div>
        </div>
    </div>
  );
}