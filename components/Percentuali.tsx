
import { useState, useEffect } from 'react';
import { Percent } from 'lucide-react';

interface Props {
  showToast: (msg: string) => void;
}

export default function Percentuali({ showToast }: Props) {
  const [val, setVal] = useState('');
  const [rate, setRate] = useState('');
  const [resAdd, setResAdd] = useState('--');
  const [resSub, setResSub] = useState('--');

  const copy = (t: string) => { navigator.clipboard.writeText(t); showToast('Copiato!'); };

  useEffect(() => {
    const saved = localStorage.getItem('percentualiData');
    if (saved) {
        try {
            const d = JSON.parse(saved);
            if(d.val) setVal(d.val);
            if(d.rate) setRate(d.rate);
            if(d.val && d.rate) calcPerc(d.val, d.rate);
        } catch(e) {}
    }
  }, []);

  const handleSave = () => {
      const data = { val, rate };
      localStorage.setItem('percentualiData', JSON.stringify(data));
      showToast('Dati salvati!');
  };

  const handleShare = async () => {
      const text = `Report Percentuali\nValore: ${val} (+${rate}% = ${resAdd})`;
      if (navigator.share) {
          try { await navigator.share({ title: 'ThermoCalc Percentuali', text }); } catch {}
      } else {
          navigator.clipboard.writeText(text);
          showToast('Copiato negli appunti');
      }
  };

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

  return (
    <div className="animate-slide-in">
        <div className="flex justify-end gap-2 mb-6 max-w-xl mx-auto no-print">
          <button onClick={handleSave} className="bg-gray-800 hover:bg-orange-600 text-slate-300 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors border border-gray-700 flex items-center gap-2">Salva</button>
          <button onClick={handleShare} className="bg-gray-800 hover:bg-orange-600 text-slate-300 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors border border-gray-700 flex items-center gap-2">Condividi</button>
          <button onClick={() => window.print()} className="bg-gray-800 hover:bg-orange-600 text-slate-300 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors border border-gray-700 flex items-center gap-2">Stampa</button>
      </div>

    <div className="max-w-xl mx-auto">
        <div className="glass-card rounded-3xl p-8 flex flex-col justify-between print-break-inside">
            <div>
                <h2 className="text-xl font-black uppercase tracking-tighter text-white mb-6 flex items-center gap-3">
                    <div className="bg-orange-600 p-2 rounded-xl text-white"><Percent size={18} /></div>
                    Applica %
                </h2>
                <div className="flex gap-4 mb-8">
                    <div className="relative w-full group">
                        <label className="industrial-label">Valore Base</label>
                        <input type="number" value={val} onChange={e=>calcPerc(e.target.value, rate)} className="w-full industrial-input rounded-2xl p-4 text-xl" placeholder="0.00"/>
                    </div>
                    <div className="relative w-32">
                        <label className="industrial-label">Rate %</label>
                        <input type="number" value={rate} onChange={e=>calcPerc(val, e.target.value)} className="w-full industrial-input rounded-2xl p-4 text-xl text-center" placeholder="22"/>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="relative group cursor-pointer" onClick={()=>copy(resAdd)}>
                    <div className="bg-app-input border border-gray-800 p-5 rounded-2xl text-center hover:border-orange-500/50 transition-all">
                        <div className="industrial-label text-center">Aggiungi (+)</div>
                        <div className="text-2xl font-black text-orange-500 font-mono">{resAdd}</div>
                    </div>
                </div>
                <div className="relative group cursor-pointer" onClick={()=>copy(resSub)}>
                    <div className="bg-app-input border border-gray-800 p-5 rounded-2xl text-center hover:border-red-500/50 transition-all">
                        <div className="industrial-label text-center">Sottrai (-)</div>
                        <div className="text-2xl font-black text-gray-400 font-mono">{resSub}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </div>
  );
}
