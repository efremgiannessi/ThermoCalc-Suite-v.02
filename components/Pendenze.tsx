import { useState } from 'react';

interface Props {
  showToast: (msg: string) => void;
}

export default function Pendenze({ showToast }: Props) {
  const [h, setH] = useState('');
  const [l, setL] = useState('');
  const [resHL, setResHL] = useState('-- %');
  const [degInput, setDegInput] = useState('');
  const [resPerc, setResPerc] = useState('-- %');
  const [percInput, setPercInput] = useState('');
  const [resDeg, setResDeg] = useState('-- °');

  const copy = (t: string) => { navigator.clipboard.writeText(t); showToast('Copiato!'); };

  const calcHL = (valH: string, valL: string) => {
    setH(valH); setL(valL);
    const nh = parseFloat(valH);
    const nl = parseFloat(valL);
    if(nh && nl) setResHL((nh/nl * 100).toFixed(2) + " %");
    else setResHL("-- %");
  };

  const calcDegToPerc = (val: string) => {
      setDegInput(val);
      const v = parseFloat(val);
      if(!isNaN(v)) setResPerc((Math.tan(v * Math.PI/180)*100).toFixed(1) + " %");
      else setResPerc("-- %");
  };

  const calcPercToDeg = (val: string) => {
      setPercInput(val);
      const v = parseFloat(val);
      if(!isNaN(v)) setResDeg((Math.atan(v/100) * 180/Math.PI).toFixed(2) + " °");
      else setResDeg("-- °");
  };

  return (
    <div className="max-w-4xl mx-auto glass-panel rounded-[2rem] p-10 animate-slide-in relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3 relative z-10">
            <span className="bg-cyan-500/20 w-10 h-10 rounded-xl flex items-center justify-center text-cyan-500 border border-cyan-500/20"><i className="fa-solid fa-ruler-triangle"></i></span> 
            Calcolo Pendenze
        </h2>
        
        <div className="bg-black/20 p-6 rounded-2xl border border-white/5 mb-8 flex flex-col md:flex-row gap-6 items-end relative z-10 backdrop-blur-sm">
            <div className="flex-grow w-full">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 block ml-1">Dislivello (H)</label>
                <div className="relative group">
                    <input type="number" value={h} onChange={e=>calcHL(e.target.value, l)} className="w-full glass-input rounded-xl p-3 text-white outline-none" placeholder="0.00"/>
                    <i className="fa-solid fa-arrows-up-down absolute right-3 top-3.5 text-slate-600"></i>
                </div>
            </div>
            <div className="flex-grow w-full">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 block ml-1">Distanza (L)</label>
                <div className="relative group">
                    <input type="number" value={l} onChange={e=>calcHL(h, e.target.value)} className="w-full glass-input rounded-xl p-3 text-white outline-none" placeholder="0.00"/>
                    <i className="fa-solid fa-arrows-left-right absolute right-3 top-3.5 text-slate-600"></i>
                </div>
            </div>
            <div className="flex-none w-full md:w-auto">
                <div className="bg-accent-600/20 border border-accent-500/30 shadow-[0_0_20px_rgba(37,99,235,0.2)] px-6 py-3 rounded-xl text-white font-mono font-bold flex items-center justify-center gap-3 h-[48px] cursor-pointer hover:bg-accent-500/40 transition-colors backdrop-blur-md" onClick={()=>copy(resHL)}>
                    {resHL} <i className="fa-regular fa-copy text-xs opacity-70"></i>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="glass-panel p-8 rounded-2xl text-center hover:bg-white/5 transition-colors group">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-4 block">Da Gradi a Percentuale</label>
                <div className="relative my-4 w-32 mx-auto">
                    <input type="number" value={degInput} onChange={e=>calcDegToPerc(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white text-center text-2xl font-bold outline-none focus:border-cyan-500/50" placeholder="0°"/>
                </div>
                <i className="fa-solid fa-arrow-down text-slate-600 my-2"></i>
                <div className="text-3xl font-bold text-cyan-400 mt-2 flex justify-center items-center gap-3 cursor-pointer" onClick={()=>copy(resPerc)}>
                    {resPerc}
                </div>
            </div>
            
            <div className="glass-panel p-8 rounded-2xl text-center hover:bg-white/5 transition-colors group">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-4 block">Da Percentuale a Gradi</label>
                <div className="relative my-4 w-32 mx-auto">
                    <input type="number" value={percInput} onChange={e=>calcPercToDeg(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white text-center text-2xl font-bold outline-none focus:border-cyan-500/50" placeholder="0%"/>
                </div>
                <i className="fa-solid fa-arrow-down text-slate-600 my-2"></i>
                <div className="text-3xl font-bold text-white mt-2 flex justify-center items-center gap-3 cursor-pointer" onClick={()=>copy(resDeg)}>
                    {resDeg}
                </div>
            </div>
        </div>
    </div>
  );
}