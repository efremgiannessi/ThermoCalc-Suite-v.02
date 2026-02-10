
import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  Percent, 
  Scale, 
  Clock, 
  ArrowUpRight, 
  Coins, 
  Calculator,
  RefreshCcw,
  BarChart3,
  ArrowRight,
  Plus,
  Minus
} from 'lucide-react';

interface Props {
  showToast: (msg: string) => void;
}

export default function Commerciale({ showToast }: Props) {
  // --- STATE: PROFITABILITY (Markup/Margin) ---
  const [profCost, setProfCost] = useState('');
  const [profPrice, setProfPrice] = useState('');
  const [profMarkup, setProfMarkup] = useState('--');
  const [profMargin, setProfMargin] = useState('--');
  const [profProfit, setProfProfit] = useState('--');

  // --- STATE: VAT (IVA) ---
  const [vatAmount, setVatAmount] = useState('');
  const [vatRate, setVatRate] = useState('22');
  
  // --- STATE: DISCOUNT ---
  const [discPrice, setDiscPrice] = useState('');
  const [discRate, setDiscRate] = useState('');
  const [discFinal, setDiscFinal] = useState('--');
  const [discSaved, setDiscSaved] = useState('--');

  // --- STATE: APPLY % (GENERIC) ---
  const [appVal, setAppVal] = useState('');
  const [appRate, setAppRate] = useState('');
  const [appResAdd, setAppResAdd] = useState('--');
  const [appResSub, setAppResSub] = useState('--');

  // --- STATE: UNIT PRICE ---
  const [unitPrice, setUnitPrice] = useState('');
  const [unitQty, setUnitQty] = useState('');
  const [unitRes, setUnitRes] = useState('--');

  // --- STATE: COMPOUND INTEREST ---
  const [ciPrincipal, setCiPrincipal] = useState('');
  const [ciRate, setCiRate] = useState('');
  const [ciYears, setCiYears] = useState('');
  const [ciResult, setCiResult] = useState('--');
  const [ciDiff, setCiDiff] = useState('--');

  // --- STATE: INFLATION ---
  const [infVal, setInfVal] = useState('');
  const [infRate, setInfRate] = useState('');
  const [infYears, setInfYears] = useState('');
  const [infResult, setInfResult] = useState('--');

  // --- STATE: DOUBLING TIME ---
  const [dblRate, setDblRate] = useState('');
  const [dblYears, setDblYears] = useState('--');

  // --- STATE: CUMULATIVE GROWTH (CAGR) ---
  const [cgStart, setCgStart] = useState('');
  const [cgEnd, setCgEnd] = useState('');
  const [cgPeriods, setCgPeriods] = useState('');
  const [cgTotal, setCgTotal] = useState('--');
  const [cgCagr, setCgCagr] = useState('--');

  // --- STATE: DELTA VARIATION ---
  const [dStart, setDStart] = useState('');
  const [dEnd, setDEnd] = useState('');
  const [delta, setDelta] = useState({ val: '-- %', isPos: true });

  // --- EFFECT: PROFITABILITY CALC ---
  useEffect(() => {
    const c = parseFloat(profCost);
    const p = parseFloat(profPrice);
    if (!isNaN(c) && !isNaN(p) && c > 0 && p > 0) {
      const profit = p - c;
      const markup = (profit / c) * 100;
      const margin = (profit / p) * 100;
      setProfMarkup(markup.toFixed(2) + '%');
      setProfMargin(margin.toFixed(2) + '%');
      setProfProfit('€ ' + profit.toFixed(2));
    } else {
      setProfMarkup('--'); setProfMargin('--'); setProfProfit('--');
    }
  }, [profCost, profPrice]);

  // --- EFFECT: DISCOUNT ---
  useEffect(() => {
    const p = parseFloat(discPrice);
    const r = parseFloat(discRate);
    if(!isNaN(p) && !isNaN(r)) {
      const saved = p * (r/100);
      const final = p - saved;
      setDiscFinal('€ ' + final.toFixed(2));
      setDiscSaved('€ ' + saved.toFixed(2));
    } else {
        setDiscFinal('--'); setDiscSaved('--');
    }
  }, [discPrice, discRate]);

  // --- EFFECT: APPLY % ---
  useEffect(() => {
    const v = parseFloat(appVal);
    const r = parseFloat(appRate);
    if(!isNaN(v) && !isNaN(r)) {
        const amount = v * (r/100);
        setAppResAdd((v + amount).toFixed(2));
        setAppResSub((v - amount).toFixed(2));
    } else {
        setAppResAdd('--'); setAppResSub('--');
    }
  }, [appVal, appRate]);

  // --- EFFECT: UNIT PRICE ---
  useEffect(() => {
      const p = parseFloat(unitPrice);
      const q = parseFloat(unitQty);
      if(!isNaN(p) && !isNaN(q) && q !== 0) {
          setUnitRes('€ ' + (p/q).toFixed(3));
      } else {
          setUnitRes('--');
      }
  }, [unitPrice, unitQty]);

  // --- EFFECT: COMPOUND INTEREST ---
  useEffect(() => {
      const p = parseFloat(ciPrincipal);
      const r = parseFloat(ciRate);
      const t = parseFloat(ciYears);
      if(!isNaN(p) && !isNaN(r) && !isNaN(t)) {
          const amount = p * Math.pow((1 + r/100), t);
          setCiResult('€ ' + amount.toFixed(2));
          setCiDiff('€ ' + (amount - p).toFixed(2));
      } else {
          setCiResult('--'); setCiDiff('--');
      }
  }, [ciPrincipal, ciRate, ciYears]);

  // --- EFFECT: INFLATION ---
  useEffect(() => {
      const v = parseFloat(infVal);
      const r = parseFloat(infRate);
      const t = parseFloat(infYears);
      if(!isNaN(v) && !isNaN(r) && !isNaN(t)) {
        const future = v * Math.pow((1 + r/100), t);
        setInfResult('€ ' + future.toFixed(2));
      } else {
          setInfResult('--');
      }
  }, [infVal, infRate, infYears]);

  // --- EFFECT: DOUBLING TIME (Rule of 72) ---
  useEffect(() => {
      const r = parseFloat(dblRate);
      if(!isNaN(r) && r > 0) {
          setDblYears((72 / r).toFixed(1) + ' Anni');
      } else {
          setDblYears('--');
      }
  }, [dblRate]);

  // --- EFFECT: CUMULATIVE GROWTH ---
  useEffect(() => {
      const s = parseFloat(cgStart);
      const e = parseFloat(cgEnd);
      const n = parseFloat(cgPeriods);
      
      if (!isNaN(s) && !isNaN(e) && s !== 0) {
          // Total Growth
          const totalGrowth = ((e - s) / s) * 100;
          setCgTotal(totalGrowth.toFixed(2) + '%');

          // CAGR if periods > 0 and values are positive
          if (!isNaN(n) && n > 0 && s > 0 && e >= 0) {
              const cagr = (Math.pow(e / s, 1 / n) - 1) * 100;
              setCgCagr(cagr.toFixed(2) + '%');
          } else {
              setCgCagr('--');
          }
      } else {
          setCgTotal('--');
          setCgCagr('--');
      }
  }, [cgStart, cgEnd, cgPeriods]);

  // --- EFFECT: DELTA VARIATION ---
  useEffect(() => {
      const s = parseFloat(dStart);
      const e = parseFloat(dEnd);
      if(!isNaN(s) && !isNaN(e) && s !== 0) {
          const d = ((e - s) / s) * 100;
          setDelta({ val: (d > 0 ? "+" : "") + d.toFixed(2) + " %", isPos: d >= 0 });
      } else {
          setDelta({ val: '-- %', isPos: true });
      }
  }, [dStart, dEnd]);

  // --- HELPERS ---
  const copy = (t: string) => { navigator.clipboard.writeText(t); showToast('Copiato!'); };

  // Helper for VAT visual calculation
  const getVatResults = () => {
      const val = parseFloat(vatAmount) || 0;
      const r = parseFloat(vatRate) || 22;
      
      const netFromGross = val / (1 + r/100);
      const grossFromNet = val * (1 + r/100);
      
      return {
          scorporo: { net: netFromGross, vat: val - netFromGross },
          incorporo: { gross: grossFromNet, vat: grossFromNet - val }
      };
  };

  const vatRes = getVatResults();

  return (
    <div className="space-y-8 animate-slide-in pb-12">
      
      {/* HEADER */}
      <div className="flex flex-col">
        <span className="industrial-label text-orange-600">MODULO_05_FINANZA_AZIENDALE</span>
        <h1 className="text-3xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
            <Coins className="text-orange-500" size={32} /> Analisi Commerciale & Finanziaria
        </h1>
      </div>

      {/* --- SEZIONE 1: PROFITABILITY & PRICING --- */}
      <div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
            <TrendingUp size={16} className="text-emerald-500" /> Strategia di Prezzo
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* CARD: MARKUP & MARGIN */}
            <div className="glass-card rounded-2xl p-6 lg:col-span-2 border-emerald-500/20">
                <div className="flex justify-between mb-4">
                    <span className="industrial-label text-emerald-500">Analisi Redditività</span>
                    <span className="text-[10px] font-mono text-slate-500">GP_CALC_V2</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="industrial-label">Costo Acquisto (€)</label>
                            <input type="number" value={profCost} onChange={e=>setProfCost(e.target.value)} className="w-full industrial-input rounded-xl p-4 text-white outline-none text-lg" placeholder="0.00"/>
                        </div>
                        <div>
                            <label className="industrial-label">Prezzo Vendita (€)</label>
                            <input type="number" value={profPrice} onChange={e=>setProfPrice(e.target.value)} className="w-full industrial-input rounded-xl p-4 text-white outline-none text-lg" placeholder="0.00"/>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-app-input p-4 rounded-xl border border-white/5 flex flex-col justify-center text-center">
                            <span className="text-[10px] text-slate-500 uppercase font-black">Markup</span>
                            <div className="text-2xl font-mono font-black text-orange-500">{profMarkup}</div>
                        </div>
                        <div className="bg-app-input p-4 rounded-xl border border-white/5 flex flex-col justify-center text-center">
                            <span className="text-[10px] text-slate-500 uppercase font-black">Margine</span>
                            <div className="text-2xl font-mono font-black text-emerald-500">{profMargin}</div>
                        </div>
                        <div className="col-span-2 bg-emerald-900/20 p-4 rounded-xl border border-emerald-500/30 flex items-center justify-between px-6">
                            <span className="text-[10px] text-emerald-400 uppercase font-black">Profitto Netto</span>
                            <div className="text-xl font-mono font-black text-white">{profProfit}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CARD: PREZZO / QUANTITA */}
            <div className="glass-card rounded-2xl p-6">
                <div className="flex justify-between mb-4">
                    <span className="industrial-label text-orange-500">Prezzo Unitario</span>
                    <Scale size={16} className="text-slate-600"/>
                </div>
                <div className="space-y-4">
                    <div>
                         <label className="industrial-label">Prezzo Totale (€)</label>
                         <input type="number" value={unitPrice} onChange={e=>setUnitPrice(e.target.value)} className="w-full industrial-input rounded-lg p-3 text-sm" placeholder="0.00"/>
                    </div>
                    <div>
                         <label className="industrial-label">Quantità / Volume</label>
                         <input type="number" value={unitQty} onChange={e=>setUnitQty(e.target.value)} className="w-full industrial-input rounded-lg p-3 text-sm" placeholder="1"/>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/5 text-center cursor-pointer hover:bg-white/5 rounded-lg transition-colors" onClick={()=>copy(unitRes)}>
                         <span className="industrial-label block mb-1">Costo per Unità</span>
                         <span className="text-3xl font-black text-white font-mono">{unitRes}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* --- SEZIONE 2: TAX & DISCOUNTS --- */}
      <div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
            <PieChart size={16} className="text-blue-500" /> Regime Fiscale & Scontistica
        </h3>
        {/* Updated to 3 columns to include Apply % */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

             {/* CARD: CALCOLO IVA (DUAL MODE) */}
             <div className="glass-card rounded-2xl p-6 border-blue-500/20">
                 <div className="flex justify-between mb-4 items-center">
                    <span className="industrial-label text-blue-500">IVA / Sales Tax & Scorporo</span>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Aliquota %</span>
                        <input type="number" value={vatRate} onChange={e=>setVatRate(e.target.value)} className="w-14 bg-app-input border border-white/10 text-white text-center text-xs rounded p-1 font-mono outline-none"/>
                    </div>
                 </div>
                 
                 <div className="mb-6">
                    <input type="number" value={vatAmount} onChange={e=>setVatAmount(e.target.value)} className="w-full industrial-input rounded-xl p-4 text-center text-3xl font-black text-white outline-none focus:border-blue-500/50" placeholder="Importo..."/>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                     {/* SCORPORO */}
                     <div className="bg-app-input rounded-xl p-4 border border-white/5 relative group hover:border-blue-500/30 transition-all">
                        <span className="absolute -top-2 left-3 bg-app-bg px-1 text-[9px] text-slate-500 font-black uppercase">Se Lordo</span>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-[11px] text-slate-400">Impon.</span>
                            <span className="font-mono font-bold text-white text-sm">€ {vatRes.scorporo.net.toFixed(2)}</span>
                        </div>
                     </div>

                     {/* AGGIUNTA */}
                     <div className="bg-app-input rounded-xl p-4 border border-white/5 relative group hover:border-blue-500/30 transition-all">
                        <span className="absolute -top-2 left-3 bg-app-bg px-1 text-[9px] text-slate-500 font-black uppercase">Se Netto</span>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-[11px] text-slate-400">Totale</span>
                            <span className="font-mono font-bold text-white text-sm">€ {vatRes.incorporo.gross.toFixed(2)}</span>
                        </div>
                     </div>
                 </div>
             </div>

             {/* CARD: SCONTO */}
             <div className="glass-card rounded-2xl p-6">
                 <div className="flex justify-between mb-4">
                    <span className="industrial-label text-pink-500">Calcolo Sconto</span>
                    <Percent size={16} className="text-slate-600"/>
                 </div>
                 <div className="space-y-4 mb-4">
                     <div>
                         <label className="industrial-label">Prezzo Originale</label>
                         <input type="number" value={discPrice} onChange={e=>setDiscPrice(e.target.value)} className="w-full industrial-input rounded-xl p-3 text-white outline-none" placeholder="0.00"/>
                     </div>
                     <div>
                         <label className="industrial-label">Sconto %</label>
                         <input type="number" value={discRate} onChange={e=>setDiscRate(e.target.value)} className="w-full industrial-input rounded-xl p-3 text-white outline-none" placeholder="%"/>
                     </div>
                 </div>
                 <div className="bg-pink-900/10 border border-pink-500/20 p-4 rounded-xl flex items-center justify-between">
                     <div>
                         <span className="text-[10px] text-pink-400 uppercase font-black block">Risparmio</span>
                         <span className="text-sm font-mono text-pink-300">{discSaved}</span>
                     </div>
                     <div className="text-right">
                         <span className="text-[10px] text-white uppercase font-black block">Prezzo Finale</span>
                         <span className="text-2xl font-mono font-black text-white">{discFinal}</span>
                     </div>
                 </div>
             </div>

             {/* CARD: APPLICA % */}
             <div className="glass-card rounded-2xl p-6 border-slate-700/50">
                 <div className="flex justify-between mb-4">
                    <span className="industrial-label text-slate-400">Applica Percentuale</span>
                    <Percent size={16} className="text-slate-600"/>
                 </div>
                 <div className="space-y-4 mb-4">
                    <div>
                        <label className="industrial-label">Valore Base</label>
                        <input type="number" value={appVal} onChange={e=>setAppVal(e.target.value)} className="w-full industrial-input rounded-xl p-3 text-white outline-none" placeholder="0.00"/>
                    </div>
                    <div>
                        <label className="industrial-label">Aliquota %</label>
                        <input type="number" value={appRate} onChange={e=>setAppRate(e.target.value)} className="w-full industrial-input rounded-xl p-3 text-white outline-none" placeholder="%"/>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                     <div className="bg-emerald-500/10 p-3 rounded-xl text-center cursor-pointer hover:bg-emerald-500/20 transition-colors border border-emerald-500/10" onClick={()=>copy(appResAdd)}>
                         <span className="text-[9px] text-emerald-500 uppercase font-black block mb-1">Aggiungi (+)</span>
                         <span className="text-lg font-mono font-black text-white">{appResAdd}</span>
                     </div>
                     <div className="bg-red-500/10 p-3 rounded-xl text-center cursor-pointer hover:bg-red-500/20 transition-colors border border-red-500/10" onClick={()=>copy(appResSub)}>
                         <span className="text-[9px] text-red-500 uppercase font-black block mb-1">Sottrai (-)</span>
                         <span className="text-lg font-mono font-black text-white">{appResSub}</span>
                     </div>
                 </div>
             </div>
        </div>
      </div>

      {/* --- SEZIONE 3: TIME VALUE OF MONEY --- */}
      <div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
            <Clock size={16} className="text-amber-500" /> Matematica Finanziaria
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* CARD: INTERESSE COMPOSTO */}
            <div className="glass-card rounded-2xl p-6 lg:col-span-2 bg-gradient-to-br from-app-panel to-amber-900/10 border-amber-500/20">
                <div className="flex justify-between mb-4">
                    <span className="industrial-label text-amber-500">Interesse Composto</span>
                    <ArrowUpRight size={16} className="text-amber-500"/>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <input type="number" value={ciPrincipal} onChange={e=>setCiPrincipal(e.target.value)} className="col-span-1 industrial-input rounded-lg p-3 text-sm" placeholder="Capitale"/>
                    <input type="number" value={ciRate} onChange={e=>setCiRate(e.target.value)} className="col-span-1 industrial-input rounded-lg p-3 text-sm" placeholder="Tasso %"/>
                    <input type="number" value={ciYears} onChange={e=>setCiYears(e.target.value)} className="col-span-1 industrial-input rounded-lg p-3 text-sm" placeholder="Anni"/>
                </div>
                <div className="flex justify-between items-end border-t border-white/5 pt-4">
                    <div>
                        <span className="text-[10px] text-slate-500 uppercase font-black block">Interessi Maturati</span>
                        <span className="text-sm font-mono text-amber-300">{ciDiff}</span>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-black block">Montante Finale</span>
                        <span className="text-2xl font-mono font-black text-white">{ciResult}</span>
                    </div>
                </div>
            </div>

            {/* CARD: VARIAZIONE DELTA */}
            <div className="glass-card rounded-2xl p-6 border-cyan-500/20">
                <div className="flex justify-between mb-4">
                    <span className="industrial-label text-cyan-500">Variazione Delta %</span>
                    <TrendingUp size={16} className={delta.isPos ? "text-emerald-500" : "text-red-500"}/>
                </div>
                <div className="flex items-center gap-3 mb-4">
                     <input type="number" value={dStart} onChange={e=>setDStart(e.target.value)} className="w-full industrial-input rounded-lg p-3 text-sm" placeholder="Inizio"/>
                     <ArrowRight size={14} className="text-slate-600 shrink-0"/>
                     <input type="number" value={dEnd} onChange={e=>setDEnd(e.target.value)} className="w-full industrial-input rounded-lg p-3 text-sm" placeholder="Fine"/>
                </div>
                <div className="bg-app-input p-4 rounded-xl text-center cursor-pointer hover:bg-white/5 transition-colors" onClick={()=>copy(delta.val)}>
                    <span className="text-[9px] text-slate-500 uppercase block">Delta</span>
                    <span className={`text-2xl font-mono font-black ${delta.isPos ? 'text-emerald-400' : 'text-red-400'}`}>{delta.val}</span>
                </div>
            </div>

            {/* CARD: CRESCITA CUMULATIVA */}
            <div className="glass-card rounded-2xl p-6">
                <div className="flex justify-between mb-4">
                    <span className="industrial-label text-cyan-400">CAGR Analysis</span>
                    <BarChart3 size={16} className="text-slate-600"/>
                </div>
                <div className="space-y-3 mb-4">
                    <div className="grid grid-cols-2 gap-3">
                        <input type="number" value={cgStart} onChange={e=>setCgStart(e.target.value)} className="industrial-input rounded-lg p-3 text-sm" placeholder="Val. Iniziale"/>
                        <input type="number" value={cgEnd} onChange={e=>setCgEnd(e.target.value)} className="industrial-input rounded-lg p-3 text-sm" placeholder="Val. Finale"/>
                    </div>
                    <input type="number" value={cgPeriods} onChange={e=>setCgPeriods(e.target.value)} className="w-full industrial-input rounded-lg p-3 text-sm" placeholder="Periodi (Anni)"/>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-app-input p-3 rounded-lg text-center">
                        <span className="text-[9px] text-slate-500 uppercase block">Totale %</span>
                        <span className={`text-base font-mono font-bold ${parseFloat(cgTotal) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{cgTotal}</span>
                    </div>
                    <div className="bg-app-input p-3 rounded-lg text-center">
                        <span className="text-[9px] text-slate-500 uppercase block">CAGR %</span>
                        <span className="text-base font-mono font-bold text-cyan-400">{cgCagr}</span>
                    </div>
                </div>
            </div>

            {/* CARD: INFLAZIONE */}
            <div className="glass-card rounded-2xl p-6">
                <div className="flex justify-between mb-4">
                    <span className="industrial-label text-red-400">Inflazione</span>
                </div>
                <div className="space-y-3 mb-4">
                    <input type="number" value={infVal} onChange={e=>setInfVal(e.target.value)} className="w-full industrial-input rounded-lg p-3 text-sm" placeholder="Valore Attuale"/>
                    <div className="grid grid-cols-2 gap-3">
                        <input type="number" value={infRate} onChange={e=>setInfRate(e.target.value)} className="industrial-input rounded-lg p-3 text-sm" placeholder="Infl. %"/>
                        <input type="number" value={infYears} onChange={e=>setInfYears(e.target.value)} className="industrial-input rounded-lg p-3 text-sm" placeholder="Anni"/>
                    </div>
                </div>
                <div className="bg-app-input p-3 rounded-lg text-center">
                    <span className="text-[9px] text-slate-500 uppercase block">Valore Futuro</span>
                    <span className="text-lg font-mono font-bold text-white">{infResult}</span>
                </div>
            </div>

            {/* CARD: TEMPO RADDOPPIO */}
            <div className="glass-card rounded-2xl p-6">
                <div className="flex justify-between mb-4">
                    <span className="industrial-label text-purple-400">Tempo Raddoppio</span>
                    <span className="text-[9px] text-slate-600 font-mono">RULE_72</span>
                </div>
                <div className="mb-6">
                    <label className="industrial-label">Tasso Interesse %</label>
                    <input type="number" value={dblRate} onChange={e=>setDblRate(e.target.value)} className="w-full industrial-input rounded-lg p-3 text-sm" placeholder="Es. 7"/>
                </div>
                <div className="bg-app-input p-3 rounded-lg text-center">
                    <span className="text-[9px] text-slate-500 uppercase block">Raddoppio In</span>
                    <span className="text-lg font-mono font-bold text-purple-400">{dblYears}</span>
                </div>
            </div>

        </div>
      </div>

    </div>
  );
}
