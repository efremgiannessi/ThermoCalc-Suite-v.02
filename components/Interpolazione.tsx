import React, { useState, useEffect } from 'react';

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
    <div className="max-w-2xl mx-auto bg-dark-800 rounded-2xl border border-dark-700 shadow-xl p-8 animate-[slideIn_0.3s]">
        <h2 className="text-xl font-bold text-white mb-6"><i className="fa-solid fa-chart-line text-accent-500"></i> Interpolazione</h2>
        <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-dark-900 p-4 rounded-xl border border-dark-700"><div className="text-xs text-accent-500 font-bold mb-2">P1</div>
                <div className="relative mb-2"><input type="number" value={p1.x} onChange={e=>setP1({...p1, x:e.target.value})} className="w-full bg-dark-800 p-2 rounded text-sm text-white" placeholder="X1"/><button onClick={()=>copy(p1.x)} className="absolute right-2 top-2 text-slate-500 hover:text-white text-xs"><i className="fa-regular fa-copy"></i></button></div>
                <div className="relative"><input type="number" value={p1.y} onChange={e=>setP1({...p1, y:e.target.value})} className="w-full bg-dark-800 p-2 rounded text-sm text-white" placeholder="Y1"/><button onClick={()=>copy(p1.y)} className="absolute right-2 top-2 text-slate-500 hover:text-white text-xs"><i className="fa-regular fa-copy"></i></button></div>
            </div>
            <div className="bg-dark-900 p-4 rounded-xl border border-dark-700"><div className="text-xs text-accent-500 font-bold mb-2">P2</div>
                <div className="relative mb-2"><input type="number" value={p2.x} onChange={e=>setP2({...p2, x:e.target.value})} className="w-full bg-dark-800 p-2 rounded text-sm text-white" placeholder="X2"/><button onClick={()=>copy(p2.x)} className="absolute right-2 top-2 text-slate-500 hover:text-white text-xs"><i className="fa-regular fa-copy"></i></button></div>
                <div className="relative"><input type="number" value={p2.y} onChange={e=>setP2({...p2, y:e.target.value})} className="w-full bg-dark-800 p-2 rounded text-sm text-white" placeholder="Y2"/><button onClick={()=>copy(p2.y)} className="absolute right-2 top-2 text-slate-500 hover:text-white text-xs"><i className="fa-regular fa-copy"></i></button></div>
            </div>
        </div>
        <div className="bg-dark-700/30 p-6 rounded-xl border border-dark-700 flex items-center gap-6">
            <div className="relative w-full"><input type="number" value={targetX} onChange={e=>setTargetX(e.target.value)} className="w-full bg-dark-input p-3 rounded text-white text-lg" placeholder="X target"/><button onClick={()=>copy(targetX)} className="absolute right-2 top-3 text-slate-500 hover:text-white"><i className="fa-regular fa-copy"></i></button></div>
            <div className="flex items-center gap-2 min-w-[100px] justify-end"><div className="text-3xl font-bold text-accent-500">{result}</div><i onClick={()=>copy(result)} className="fa-regular fa-copy text-slate-500 hover:text-white cursor-pointer text-xl"></i></div>
        </div>
    </div>
  );
}