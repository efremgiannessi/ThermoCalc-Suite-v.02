import { useState, useEffect } from 'react';

interface Props {
  showToast: (msg: string) => void;
}

export default function Pesi({ showToast }: Props) {
  const [mat, setMat] = useState('7850');
  const [spec, setSpec] = useState('7850');
  const [dim, setDim] = useState({ l: '', h: '', len: '' });
  const [result, setResult] = useState('0.00');

  useEffect(() => {
    const s = parseFloat(spec);
    const l = parseFloat(dim.l) || 0;
    const h = parseFloat(dim.h) || 0;
    const len = parseFloat(dim.len) || 0;
    if(s) {
        setResult((l * h * len * s).toFixed(2));
    }
  }, [spec, dim]);

  const handleMatChange = (v: string) => {
      setMat(v);
      if(v !== 'custom') setSpec(v);
  };

  const copy = (t: string) => { navigator.clipboard.writeText(t); showToast('Copiato!'); };

  return (
    <div className="max-w-2xl mx-auto glass-panel rounded-3xl p-8 animate-slide-in">
        <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <span className="bg-red-500/20 w-10 h-10 rounded-xl flex items-center justify-center text-red-500 border border-red-500/20"><i className="fa-solid fa-weight-hanging"></i></span> 
            Calcolo Peso Materiali
        </h2>
        
        <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="w-full md:w-2/3">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 block ml-1">Materiale</label>
                <div className="relative">
                    <select value={mat} onChange={e=>handleMatChange(e.target.value)} className="w-full glass-input rounded-xl p-4 text-white text-sm outline-none appearance-none cursor-pointer">
                        <option value="7850" className="bg-slate-800">Acciaio (7850 kg/m³)</option>
                        <option value="2500" className="bg-slate-800">Calcestruzzo (2500 kg/m³)</option>
                        <option value="600" className="bg-slate-800">Legno (600 kg/m³)</option>
                        <option value="2700" className="bg-slate-800">Alluminio (2700 kg/m³)</option>
                        <option value="custom" className="bg-slate-800">Personalizzato</option>
                    </select>
                    <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"></i>
                </div>
            </div>
            <div className="w-full md:w-1/3">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 block ml-1">Peso Spec. (kg/m³)</label>
                <div className="relative">
                    <input type="number" value={spec} onChange={e=>setSpec(e.target.value)} className="w-full glass-input rounded-xl p-4 text-white font-mono text-center outline-none"/>
                </div>
            </div>
        </div>

        <div className="glass-input rounded-2xl p-6 bg-white/5 mb-8">
            <label className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-4 block text-center">Dimensioni (metri)</label>
            <div className="grid grid-cols-3 gap-4">
                <div className="relative">
                    <input type="number" value={dim.l} onChange={e=>setDim({...dim, l:e.target.value})} placeholder="0.00" className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white text-center outline-none focus:border-red-500/50"/>
                    <span className="block text-center text-[10px] text-slate-500 mt-2 uppercase font-bold">Larghezza</span>
                </div>
                <div className="relative">
                    <input type="number" value={dim.h} onChange={e=>setDim({...dim, h:e.target.value})} placeholder="0.00" className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white text-center outline-none focus:border-red-500/50"/>
                    <span className="block text-center text-[10px] text-slate-500 mt-2 uppercase font-bold">Altezza</span>
                </div>
                <div className="relative">
                    <input type="number" value={dim.len} onChange={e=>setDim({...dim, len:e.target.value})} placeholder="0.00" className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white text-center outline-none focus:border-red-500/50"/>
                    <span className="block text-center text-[10px] text-slate-500 mt-2 uppercase font-bold">Lunghezza</span>
                </div>
            </div>
        </div>

        <div className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 rounded-2xl p-8 text-center border border-white/10 shadow-2xl relative overflow-hidden cursor-pointer group hover:border-red-500/30 transition-all backdrop-blur-md" onClick={()=>copy(result)}>
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><i className="fa-solid fa-weight-scale text-8xl text-white"></i></div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mb-2 relative z-10">Peso Totale Stimato</div>
            <div className="text-5xl font-bold text-white flex justify-center items-end gap-3 relative z-10 font-mono">
                {result} <span className="text-lg text-red-500 font-sans mb-1">kg</span>
            </div>
            <div className="text-[10px] text-slate-600 mt-2 uppercase">Clicca per copiare</div>
        </div>
    </div>
  );
}