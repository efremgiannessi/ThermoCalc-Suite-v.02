
import { useState, useEffect } from 'react';
import { LineChart, Info } from 'lucide-react';

interface Props {
  showToast: (msg: string) => void;
}

export default function Interpolazione({ showToast }: Props) {
  const [p1, setP1] = useState({ x: '', y: '' });
  const [p2, setP2] = useState({ x: '', y: '' });
  const [targetX, setTargetX] = useState('');
  const [result, setResult] = useState('--');

  useEffect(() => {
    const saved = localStorage.getItem('interpolazioneData');
    if (saved) {
        try {
            const d = JSON.parse(saved);
            if(d.p1) setP1(d.p1);
            if(d.p2) setP2(d.p2);
            if(d.targetX) setTargetX(d.targetX);
        } catch(e) {}
    }
  }, []);

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

  const handleSave = () => {
      const data = { p1, p2, targetX };
      localStorage.setItem('interpolazioneData', JSON.stringify(data));
      showToast('Dati salvati!');
  };

  const handleShare = async () => {
      const text = `Interpolazione\nP1(${p1.x},${p1.y}) - P2(${p2.x},${p2.y})\nTarget X: ${targetX} -> Y: ${result}`;
      if (navigator.share) {
          try { await navigator.share({ title: 'Interpolazione', text }); } catch {}
      } else {
          navigator.clipboard.writeText(text);
          showToast('Copiato negli appunti');
      }
  };

  return (
    <div className="animate-slide-in pb-12">
        <div className="flex justify-end gap-2 mb-6 max-w-2xl mx-auto no-print">
          <button onClick={handleSave} className="bg-gray-800 hover:bg-orange-600 text-slate-300 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-gray-700">Salva</button>
          <button onClick={handleShare} className="bg-gray-800 hover:bg-orange-600 text-slate-300 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-gray-700">Condividi</button>
          <button onClick={() => window.print()} className="bg-gray-800 hover:bg-orange-600 text-slate-300 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-gray-700">Stampa</button>
      </div>
    <div className="max-w-2xl mx-auto glass-card rounded-[2.5rem] p-10 shadow-2xl print-break-inside">
        <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-8 flex items-center gap-3">
            <div className="bg-orange-600 p-2 rounded-xl text-white"><LineChart size={20} /></div>
            Interpolazione Lineare
        </h2>
        <div className="grid grid-cols-2 gap-8 mb-8 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-px bg-gray-800"></div>

            <div className="bg-app-input border border-gray-800 p-6 rounded-3xl">
                <div className="industrial-label text-orange-500 mb-4">Punto_A_Register</div>
                <div className="space-y-3">
                    <div className="relative"><span className="absolute left-3 top-3 text-gray-600 font-mono text-[8px]">X1</span><input type="number" value={p1.x} onChange={e=>setP1({...p1, x:e.target.value})} className="w-full bg-black/40 border border-gray-800 p-3 pl-8 rounded-xl text-sm outline-none font-mono text-white" placeholder="0"/></div>
                    <div className="relative"><span className="absolute left-3 top-3 text-gray-600 font-mono text-[8px]">Y1</span><input type="number" value={p1.y} onChange={e=>setP1({...p1, y:e.target.value})} className="w-full bg-black/40 border border-gray-800 p-3 pl-8 rounded-xl text-sm outline-none font-mono text-white" placeholder="0"/></div>
                </div>
            </div>
            <div className="bg-app-input border border-gray-800 p-6 rounded-3xl">
                <div className="industrial-label text-orange-500 mb-4">Punto_B_Register</div>
                <div className="space-y-3">
                    <div className="relative"><span className="absolute left-3 top-3 text-gray-600 font-mono text-[8px]">X2</span><input type="number" value={p2.x} onChange={e=>setP2({...p2, x:e.target.value})} className="w-full bg-black/40 border border-gray-800 p-3 pl-8 rounded-xl text-sm outline-none font-mono text-white" placeholder="0"/></div>
                    <div className="relative"><span className="absolute left-3 top-3 text-gray-600 font-mono text-[8px]">Y2</span><input type="number" value={p2.y} onChange={e=>setP2({...p2, y:e.target.value})} className="w-full bg-black/40 border border-gray-800 p-3 pl-8 rounded-xl text-sm outline-none font-mono text-white" placeholder="0"/></div>
                </div>
            </div>
        </div>
        
        <div className="bg-black/30 p-8 rounded-[2rem] border border-gray-800 flex items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-600"></div>
            <div className="relative w-full">
                <label className="industrial-label">Valore X Target</label>
                <input type="number" value={targetX} onChange={e=>setTargetX(e.target.value)} className="w-full bg-transparent text-white text-2xl font-black outline-none font-mono" placeholder="X_VALUE"/>
            </div>
            <div className="text-right min-w-[140px]">
                <div className="industrial-label">Result_Y_Output</div>
                <div className="text-4xl font-black text-orange-500 font-mono flex justify-end items-center gap-3 cursor-pointer" onClick={()=>copy(result)}>
                    {result} 
                </div>
            </div>
        </div>
    </div>

      {/* LEGENDA TECNICA */}
      <div className="mt-10 max-w-2xl mx-auto border-t border-white/10 pt-6 no-print">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Info size={14} /> Specifiche Tecniche & Guida
          </h4>
          <div className="grid grid-cols-1 gap-6 text-[10px] text-slate-400">
              <div>
                  <strong className="text-slate-300 block mb-1">Funzionalità Principali</strong>
                  Calcolo del valore intermedio Y corrispondente a un valore X dato, basandosi su due punti noti (X1,Y1) e (X2,Y2). Utile per trovare valori intermedi in tabelle tecniche discrete.
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <strong className="text-slate-300 block mb-1">Modalità d'Uso</strong>
                      Inserisci le coordinate dei due punti noti che racchiudono il valore cercato. Inserisci il valore X target per ottenere il corrispondente Y interpolato.
                  </div>
                  <div>
                      <strong className="text-slate-300 block mb-1">Formula Matematica</strong>
                      Y = Y1 + (X - X1) * (Y2 - Y1) / (X2 - X1).
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}