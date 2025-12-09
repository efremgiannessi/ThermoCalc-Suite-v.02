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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto animate-[slideIn_0.3s]">
        <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4"><i className="fa-solid fa-arrow-trend-up text-accent-500"></i> Applica %</h2>
            <div className="flex gap-4 mb-4">
                <div className="relative w-full"><input type="number" value={val} onChange={e=>calcPerc(e.target.value, rate)} className="w-full bg-dark-input border border-dark-600 rounded-lg p-3 text-white text-lg font-mono" placeholder="Valore"/><button onClick={()=>copy(val)} className="absolute right-2 top-3 text-slate-500 hover:text-white"><i className="fa-regular fa-copy"></i></button></div>
                <div className="relative w-32"><input type="number" value={rate} onChange={e=>calcPerc(val, e.target.value)} className="w-full bg-dark-input border border-dark-600 rounded-lg p-3 text-white text-lg font-mono" placeholder="%"/><button onClick={()=>copy(rate)} className="absolute right-2 top-3 text-slate-500 hover:text-white"><i className="fa-regular fa-copy"></i></button></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="relative group"><button onClick={()=>copy(resAdd)} className="w-full bg-dark-700 hover:bg-emerald-600/20 p-4 rounded-xl text-emerald-400 font-bold text-xl">{resAdd}</button></div>
                <div className="relative group"><button onClick={()=>copy(resSub)} className="w-full bg-dark-700 hover:bg-red-600/20 p-4 rounded-xl text-red-400 font-bold text-xl">{resSub}</button></div>
            </div>
        </div>
        <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4"><i className="fa-solid fa-percent text-accent-500"></i> Variazione Delta</h2>
            <div className="space-y-3">
                 <div className="relative"><input type="number" value={dStart} onChange={e=>calcDelta(e.target.value, dEnd)} className="w-full bg-dark-input border border-dark-600 rounded p-2 text-white" placeholder="Da"/><button onClick={()=>copy(dStart)} className="absolute right-2 top-2 text-slate-500 hover:text-white"><i className="fa-regular fa-copy"></i></button></div>
                 <div className="relative"><input type="number" value={dEnd} onChange={e=>calcDelta(dStart, e.target.value)} className="w-full bg-dark-input border border-dark-600 rounded p-2 text-white" placeholder="A"/><button onClick={()=>copy(dEnd)} className="absolute right-2 top-2 text-slate-500 hover:text-white"><i className="fa-regular fa-copy"></i></button></div>
            </div>
            <div className="mt-4 p-3 bg-dark-900 rounded-xl text-center border border-dark-700 relative group">
                <span className={`text-2xl font-bold ${delta.isPos ? 'text-emerald-400' : 'text-red-400'}`}>{delta.val}</span>
                <button onClick={()=>copy(delta.val)} className="absolute top-1/2 -translate-y-1/2 right-4 text-slate-500 hover:text-white"><i className="fa-regular fa-copy"></i></button>
            </div>
        </div>
    </div>
  );
}