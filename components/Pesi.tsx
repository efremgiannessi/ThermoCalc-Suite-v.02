import React, { useState, useEffect } from 'react';

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
    <div className="max-w-2xl mx-auto bg-dark-800 rounded-2xl border border-dark-700 shadow-xl p-8 animate-[slideIn_0.3s]">
        <h2 className="text-xl font-bold text-white mb-6"><i className="fa-solid fa-weight-hanging text-accent-500"></i> Pesi</h2>
        <div className="flex gap-4 mb-4">
            <div className="w-full"><select value={mat} onChange={e=>handleMatChange(e.target.value)} className="w-full bg-dark-input border border-dark-700 rounded-lg p-2 text-white text-sm"><option value="7850">Acciaio</option><option value="2500">CLS</option><option value="600">Legno</option><option value="2700">Alluminio</option><option value="custom">Custom</option></select></div>
            <div className="w-1/3 relative"><input type="number" value={spec} onChange={e=>setSpec(e.target.value)} className="w-full bg-dark-input border border-dark-700 rounded-lg p-2 text-white text-sm"/><button onClick={()=>copy(spec)} className="absolute right-2 top-2 text-slate-500 hover:text-white text-xs"><i className="fa-regular fa-copy"></i></button></div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="relative"><input type="number" value={dim.l} onChange={e=>setDim({...dim, l:e.target.value})} placeholder="L" className="w-full bg-dark-input p-2 text-white border border-dark-700 rounded"/><button onClick={()=>copy(dim.l)} className="absolute right-2 top-2 text-slate-500 hover:text-white text-xs"><i className="fa-regular fa-copy"></i></button></div>
            <div className="relative"><input type="number" value={dim.h} onChange={e=>setDim({...dim, h:e.target.value})} placeholder="H" className="w-full bg-dark-input p-2 text-white border border-dark-700 rounded"/><button onClick={()=>copy(dim.h)} className="absolute right-2 top-2 text-slate-500 hover:text-white text-xs"><i className="fa-regular fa-copy"></i></button></div>
            <div className="relative"><input type="number" value={dim.len} onChange={e=>setDim({...dim, len:e.target.value})} placeholder="Lungh" className="w-full bg-dark-input p-2 text-white border border-dark-700 rounded"/><button onClick={()=>copy(dim.len)} className="absolute right-2 top-2 text-slate-500 hover:text-white text-xs"><i className="fa-regular fa-copy"></i></button></div>
        </div>
        <div className="bg-dark-900 rounded-xl p-6 text-center border border-dark-700"><div className="text-4xl font-bold text-accent-500 flex justify-center items-center gap-2"><span onClick={()=>copy(result)} className="cursor-pointer hover:text-accent-600">{result}</span> <span className="text-sm text-slate-400">kg</span></div></div>
    </div>
  );
}