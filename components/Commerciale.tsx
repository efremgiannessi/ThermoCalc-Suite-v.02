import { useState } from 'react';
import { TrendingUp, DollarSign, PieChart } from 'lucide-react';

interface Props {
  showToast: (msg: string) => void;
}

export default function Commerciale({ showToast }: Props) {
  const [costo, setCosto] = useState<string>('');
  const [prezzo, setPrezzo] = useState<string>('');
  const [markup, setMarkup] = useState<string>('0.00');
  const [margine, setMargine] = useState<string>('0.00');

  const handleCalc = () => {
    const c = parseFloat(costo);
    const p = parseFloat(prezzo);
    if (c && p) {
      setMarkup(((p - c) / c * 100).toFixed(2));
      setMargine(((p - c) / p * 100).toFixed(2));
      showToast("CALCOLO ESEGUITO");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col">
        <span className="industrial-label">MODULO_05_ANALISI</span>
        <h1 className="text-xl font-black uppercase tracking-tighter text-white">Analisi Commerciale</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-4 border-orange-500/10 space-y-4 flex flex-col">
          <div className="flex items-center gap-2">
             <TrendingUp size={12} className="text-orange-500" />
             <span className="text-white font-black uppercase tracking-widest text-[9px]">Analisi Profitto</span>
          </div>
          <div className="space-y-3 flex-1">
             <div>
               <span className="industrial-label">COSTO DI ACQUISTO (€)</span>
               <input type="number" value={costo} onChange={e => setCosto(e.target.value)} className="w-full industrial-input rounded-lg p-2 text-xs" />
             </div>
             <div>
               <span className="industrial-label">PREZZO DI VENDITA (€)</span>
               <input type="number" value={prezzo} onChange={e => setPrezzo(e.target.value)} className="w-full industrial-input rounded-lg p-2 text-xs" />
             </div>
             <button onClick={handleCalc} className="w-full bg-orange-600 text-white font-black text-[8px] py-2 rounded-lg">CALCOLA</button>
          </div>
          <div className="pt-3 border-t border-app-border grid grid-cols-2 gap-2">
             <div className="bg-app-input p-2 rounded-lg text-center">
                <span className="industrial-label !mb-0">Ricarico</span>
                <div className="text-base font-mono font-black text-orange-500">{markup}%</div>
             </div>
             <div className="bg-app-input p-2 rounded-lg text-center">
                <span className="industrial-label !mb-0">Margine</span>
                <div className="text-base font-mono font-black text-emerald-500">{margine}%</div>
             </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4 border-orange-500/10">
           <div className="flex items-center gap-2 mb-4">
              <DollarSign size={12} className="text-orange-500" />
              <span className="text-white font-black uppercase tracking-widest text-[9px]">Parcella Prof.</span>
           </div>
           <div className="space-y-3">
              <div>
                <span className="industrial-label">IMPONIBILE BASE</span>
                <input type="number" className="w-full industrial-input rounded-lg p-2 text-xs" />
              </div>
              <div className="bg-orange-600 p-4 rounded-lg text-center">
                 <span className="text-[7px] font-black uppercase tracking-widest text-orange-200">Netto a Pagare</span>
                 <div className="text-xl font-mono font-black text-white">€ 0.00</div>
              </div>
           </div>
        </div>

        <div className="glass-card rounded-xl p-4 border-orange-500/10">
           <div className="flex items-center gap-2 mb-4">
              <PieChart size={12} className="text-orange-500" />
              <span className="text-white font-black uppercase tracking-widest text-[9px]">Scorporo IVA</span>
           </div>
           <div className="space-y-4">
              <div className="bg-app-input p-3 rounded-lg text-center">
                <span className="industrial-label">TOTALE LORDO</span>
                <input type="number" className="bg-transparent text-white font-mono font-black text-xl text-center w-full" placeholder="0.00" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}