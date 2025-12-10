import { useState, useEffect } from 'react';

interface Props {
  showToast: (msg: string) => void;
}

export default function Interpolazione({ showToast }: Props) {
  const [p1, setP1] = useState({ x: '', y: '' });
  const [p2, setP2] = useState({ x: '', y: '' });
  const [targetX, setTargetX] = useState('');
  const [result, setResult] = useState('--');

  useEffect(() => {
    const x1 = parseFloat(p1.x); const y1 = parseFloat(p1.y);
    const x2 = parseFloat(p2.x); const y2 = parseFloat(p2.y);
    const x = parseFloat(targetX);
    
    if(!isNaN(x1) && !isNaN(y1) && !isNaN(x2) && !isNaN(y2) && !isNaN(x)) {
         const res = y1 + (x-x1)*(y2-y1)/(x2-x1);
         setResult(res.toFixed(3));
    } else {
        setResult('--');
    }
  }, [p1, p2, targetX]);

  const copy = (t: string) => { navigator.clipboard.writeText(t); showToast('Copiato!'); };

  return (
    <div className="max-w-2xl mx-auto glass-panel rounded-3xl p-10 animate-slide-in shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)]">
        <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-500 border border-yellow-500/20"><i className="fa-solid fa-chart-line"></i></div>
            Interpolazione Lineare
        </h2>
        <div className="grid grid-cols-2 gap-8 mb-8 relative">
            {/* Connecting Line Visual */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-px bg-white/10"></div>

            <div className="glass-input p-6 rounded-2xl bg-white/5">
                <div className="text-xs text-yellow-500 font-bold mb-4 uppercase tracking-widest">Punto 1</div>
                <div className="space-y-3">
                    <div className="relative"><span className="absolute left-3 top-3 text-slate-500 font-mono text-xs">X1</span><input type="number" value={p1.x} onChange={e=>setP1({...p1, x:e.target.value})} className="w-full glass-input p-3 pl-8 rounded-xl text-sm outline-none bg-black/20" placeholder="0"/><button onClick={()=>copy(p1.x)} className="absolute right-2 top-3 text-slate-600 hover:text-white text-xs"><i className="fa-regular fa-copy"></i></button></div>
                    <div className="relative"><span className="absolute left-3 top-3 text-slate-500 font-mono text-xs">Y1</span><input type="number" value={p1.y} onChange={e=>setP1({...p1, y:e.target.value})} className="w-full glass-input p-3 pl-8 rounded-xl text-sm outline-none bg-black/20" placeholder="0"/><button onClick={()=>copy(p1.y)} className="absolute right-2 top-3 text-slate-600 hover:text-white text-xs"><i className="fa-regular fa-copy"></i></button></div>
                </div>
            </div>
            <div className="glass-input p-6 rounded-2xl bg-white/5">
                <div className="text-xs text-yellow-500 font-bold mb-4 uppercase tracking-widest">Punto 2</div>
                <div className="space-y-3">
                    <div className="relative"><span className="absolute left-3 top-3 text-slate-500 font-mono text-xs">X2</span><input type="number" value={p2.x} onChange={e=>setP2({...p2, x:e.target.value})} className="w-full glass-input p-3 pl-8 rounded-xl text-sm outline-none bg-black/20" placeholder="0"/><button onClick={()=>copy(p2.x)} className="absolute right-2 top-3 text-slate-600 hover:text-white text-xs"><i className="fa-regular fa-copy"></i></button></div>
                    <div className="relative"><span className="absolute left-3 top-3 text-slate-500 font-mono text-xs">Y2</span><input type="number" value={p2.y} onChange={e=>setP2({...p2, y:e.target.value})} className="w-full glass-input p-3 pl-8 rounded-xl text-sm outline-none bg-black/20" placeholder="0"/><button onClick={()=>copy(p2.y)} className="absolute right-2 top-3 text-slate-600 hover:text-white text-xs"><i className="fa-regular fa-copy"></i></button></div>
                </div>
            </div>
        </div>
        
        <div className="bg-black/20 p-8 rounded-2xl border border-white/10 flex items-center justify-between gap-6 relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 left-0 w-1 h-full bg-accent-500 shadow-[0_0_15px_#3b82f6]"></div>
            <div className="relative w-full">
                <label className="text-[10px] text-slate-400 font-bold uppercase absolute -top-3 left-0">Valore X Target</label>
                <input type="number" value={targetX} onChange={e=>setTargetX(e.target.value)} className="w-full glass-input p-4 rounded-xl text-white text-xl outline-none font-bold" placeholder="X?"/>
            </div>
            <div className="text-right min-w-[140px]">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Risultato Y</div>
                <div className="text-4xl font-bold text-accent-400 font-mono flex justify-end items-center gap-3 cursor-pointer group" onClick={()=>copy(result)}>
                    {result} 
                    <i className="fa-regular fa-copy text-lg text-slate-600 group-hover:text-white transition-colors"></i>
                </div>
            </div>
        </div>
    </div>
  );
}