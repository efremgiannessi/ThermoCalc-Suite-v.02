import { useState } from 'react';
import { TrendingUp, DollarSign, PieChart, Activity } from 'lucide-react';

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
      showToast("ANALISI COMPLETATA");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <span className="industrial-label">Module: 05_Margin_Analysis</span>
        <h1 className="text-4xl font-black uppercase tracking-tighter text-white">Commercial Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Card: Profit Analysis */}
        <div className="glass-card rounded-3xl p-8 border-orange-500/10 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
             <div className="bg-orange-600/10 p-2 rounded-xl border border-orange-500/20 text-orange-500">
              <TrendingUp size={18} />
             </div>
             <h3 className="text-white font-black uppercase tracking-widest text-xs">Margin & Markup</h3>
          </div>

          <div className="space-y-6 flex-1">
             <div>
               <span className="industrial-label">Costo Acquisto (€)</span>
               <input type="number" value={costo} onChange={e => setCosto(e.target.value)} className="w-full industrial-input rounded-2xl p-4 text-sm" placeholder="0.00" />
             </div>
             <div>
               <span className="industrial-label">Prezzo Vendita (€)</span>
               <input type="number" value={prezzo} onChange={e => setPrezzo(e.target.value)} className="w-full industrial-input rounded-2xl p-4 text-sm" placeholder="0.00" />
             </div>
             <button onClick={handleCalc} className="w-full bg-gray-800 hover:bg-orange-600 text-white font-black uppercase tracking-widest text-[9px] py-4 rounded-2xl transition-all border border-gray-700">
                Execute Analysis
             </button>
          </div>

          <div className="mt-8 pt-8 border-t border-app-border grid grid-cols-2 gap-4">
             <div className="bg-app-input p-4 rounded-2xl border border-app-border text-center">
                <span className="industrial-label !mb-1">Markup</span>
                <div className="text-xl font-mono font-black text-orange-500">{markup}%</div>
             </div>
             <div className="bg-app-input p-4 rounded-2xl border border-app-border text-center">
                <span className="industrial-label !mb-1">Margine</span>
                <div className="text-xl font-mono font-black text-emerald-500">{margine}%</div>
             </div>
          </div>
        </div>

        {/* Card: Invoice Calc */}
        <div className="glass-card rounded-3xl p-8 border-orange-500/10">
           <div className="flex items-center gap-3 mb-8">
              <div className="bg-orange-600/10 p-2 rounded-xl border border-orange-500/20 text-orange-500">
               <DollarSign size={18} />
              </div>
              <h3 className="text-white font-black uppercase tracking-widest text-xs">Fee Calculator</h3>
           </div>

           <div className="space-y-6">
              <div>
                <span className="industrial-label">Onorario Base</span>
                <input type="number" className="w-full industrial-input rounded-2xl p-4 text-sm" placeholder="1000.00" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="industrial-label">Cassa Prev. (%)</span>
                  <input type="number" defaultValue="4" className="w-full industrial-input rounded-2xl p-4 text-sm text-center" />
                </div>
                <div>
                  <span className="industrial-label">IVA (%)</span>
                  <input type="number" defaultValue="22" className="w-full industrial-input rounded-2xl p-4 text-sm text-center" />
                </div>
              </div>
              
              <div className="bg-orange-600 shadow-xl shadow-orange-900/20 p-6 rounded-2xl text-center">
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-200 mb-1 block">Netto a Pagare</span>
                 <div className="text-3xl font-mono font-black text-white">€ 1.240,00</div>
              </div>
           </div>
        </div>

        {/* Card: VAT Split */}
        <div className="glass-card rounded-3xl p-8 border-orange-500/10">
           <div className="flex items-center gap-3 mb-8">
              <div className="bg-orange-600/10 p-2 rounded-xl border border-orange-500/20 text-orange-500">
               <PieChart size={18} />
              </div>
              <h3 className="text-white font-black uppercase tracking-widest text-xs">VAT Breakdown</h3>
           </div>

           <div className="space-y-6">
              <div className="bg-app-input border border-app-border rounded-2xl p-6 text-center">
                <span className="industrial-label">Totale Lordo</span>
                <input type="number" className="bg-transparent text-white font-mono font-black text-3xl text-center w-full outline-none" placeholder="0.00" />
              </div>

              <div className="space-y-3">
                 <div className="flex justify-between items-center p-4 bg-gray-800/30 rounded-2xl">
                    <span className="industrial-label !mb-0">Imponibile</span>
                    <span className="text-sm font-mono font-bold text-white">€ 0,00</span>
                 </div>
                 <div className="flex justify-between items-center p-4 bg-gray-800/30 rounded-2xl">
                    <span className="industrial-label !mb-0">IVA Quota</span>
                    <span className="text-sm font-mono font-bold text-orange-500">€ 0,00</span>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}