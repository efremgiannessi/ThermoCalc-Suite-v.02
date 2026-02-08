import { useState, useEffect } from 'react';
import { Scale } from 'lucide-react';

interface Props {
  showToast: (msg: string) => void;
}

export default function Pesi({ showToast }: Props) {
  const [mat, setMat] = useState('7850');
  const [spec, setSpec] = useState('7850');
  const [dim, setDim] = useState({ l: '', h: '', len: '' });
  const [result, setResult] = useState('0.00');

  useEffect(() => {
    const saved = localStorage.getItem('pesiData');
    if (saved) {
        try {
            const d = JSON.parse(saved);
            if(d.mat) setMat(d.mat);
            if(d.spec) setSpec(d.spec);
            if(d.dim) setDim(d.dim);
        } catch(e) {}
    }
  }, []);

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

  const handleSave = () => {
      const data = { mat, spec, dim };
      localStorage.setItem('pesiData', JSON.stringify(data));
      showToast('Dati salvati!');
  };

  const handleShare = async () => {
      const text = `Calcolo Peso: ${result} kg\nDimensioni: ${dim.l}x${dim.h}x${dim.len}m`;
      if (navigator.share) {
          try { await navigator.share({ title: 'Peso Materiali', text }); } catch {}
      } else {
          navigator.clipboard.writeText(text);
          showToast('Copiato negli appunti');
      }
  };

  return (
    <div className="animate-slide-in">
        <div className="flex justify-end gap-2 mb-6 max-w-2xl mx-auto no-print">
          <button onClick={handleSave} className="bg-gray-800 hover:bg-orange-600 text-slate-300 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-gray-700">Salva</button>
          <button onClick={handleShare} className="bg-gray-800 hover:bg-orange-600 text-slate-300 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-gray-700">Condividi</button>
          <button onClick={() => window.print()} className="bg-gray-800 hover:bg-orange-600 text-slate-300 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-gray-700">Stampa</button>
      </div>
    <div className="max-w-2xl mx-auto glass-card rounded-[2.5rem] p-8 print-break-inside">
        <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-8 flex items-center gap-3">
            <div className="bg-orange-600 p-2 rounded-xl text-white"><Scale size={20} /></div>
            Calcolo Peso Materiali
        </h2>
        
        <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="w-full md:w-2/3">
                <label className="industrial-label">Materiale_Type</label>
                <div className="relative">
                    <select value={mat} onChange={e=>handleMatChange(e.target.value)} className="w-full industrial-input rounded-2xl p-4 text-xs appearance-none cursor-pointer">
                        <option value="7850" className="bg-app-panel">Acciaio (7850 kg/m³)</option>
                        <option value="2500" className="bg-app-panel">Calcestruzzo (2500 kg/m³)</option>
                        <option value="600" className="bg-app-panel">Legno (600 kg/m³)</option>
                        <option value="2700" className="bg-app-panel">Alluminio (2700 kg/m³)</option>
                        <option value="custom" className="bg-app-panel">Personalizzato</option>
                    </select>
                </div>
            </div>
            <div className="w-full md:w-1/3">
                <label className="industrial-label">Density (kg/m³)</label>
                <input type="number" value={spec} onChange={e=>setSpec(e.target.value)} className="w-full industrial-input rounded-2xl p-4 text-center text-sm"/>
            </div>
        </div>

        <div className="bg-app-input border border-gray-800 rounded-3xl p-6 mb-8">
            <label className="industrial-label text-center">Dimensioni_In_Meters</label>
            <div className="grid grid-cols-3 gap-4">
                <div className="relative">
                    <input type="number" value={dim.l} onChange={e=>setDim({...dim, l:e.target.value})} placeholder="0.00" className="w-full bg-black/40 border border-gray-800 rounded-xl p-3 text-white text-center font-mono outline-none focus:border-orange-500/50"/>
                    <span className="block text-center text-[8px] text-gray-500 mt-2 uppercase font-black">Larghezza</span>
                </div>
                <div className="relative">
                    <input type="number" value={dim.h} onChange={e=>setDim({...dim, h:e.target.value})} placeholder="0.00" className="w-full bg-black/40 border border-gray-800 rounded-xl p-3 text-white text-center font-mono outline-none focus:border-orange-500/50"/>
                    <span className="block text-center text-[8px] text-gray-500 mt-2 uppercase font-black">Altezza</span>
                </div>
                <div className="relative">
                    <input type="number" value={dim.len} onChange={e=>setDim({...dim, len:e.target.value})} placeholder="0.00" className="w-full bg-black/40 border border-gray-800 rounded-xl p-3 text-white text-center font-mono outline-none focus:border-orange-500/50"/>
                    <span className="block text-center text-[8px] text-gray-500 mt-2 uppercase font-black">Lunghezza</span>
                </div>
            </div>
        </div>

        <div className="bg-black/40 rounded-3xl p-8 text-center border border-gray-800 cursor-pointer group hover:border-orange-500/50 transition-all" onClick={()=>copy(result)}>
            <div className="industrial-label text-center text-gray-600">Total_Mass_Output</div>
            <div className="text-5xl font-black text-white flex justify-center items-end gap-3 font-mono">
                {result} <span className="text-xl text-orange-500 font-sans mb-1 uppercase tracking-widest">kg</span>
            </div>
        </div>
    </div>
    </div>
  );
}