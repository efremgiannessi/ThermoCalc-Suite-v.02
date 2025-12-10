import { useState, useEffect } from 'react';

interface Props {
  showToast: (msg: string) => void;
}

export default function Trasporto({ showToast }: Props) {
  // Input
  const [km, setKm] = useState<string>('');
  const [rateKm, setRateKm] = useState<string>('2.20'); // €/km standard
  const [trips, setTrips] = useState<string>('1');
  
  const [waitHours, setWaitHours] = useState<string>('0');
  const [waitRate, setWaitRate] = useState<string>('65.00'); // €/h fermo macchina
  
  const [extraCost, setExtraCost] = useState<string>('0'); // Permessi, autostrada extra
  const [avgSpeed, setAvgSpeed] = useState<string>('65'); // km/h camion

  // Output
  const [costTravel, setCostTravel] = useState(0);
  const [costWait, setCostWait] = useState(0);
  const [costExtra, setCostExtra] = useState(0);
  const [total, setTotal] = useState(0);
  const [timeEst, setTimeEst] = useState('--:--');
  
  // Chart Data
  const [chartData, setChartData] = useState({ travel: 0, wait: 0, extra: 0 });

  useEffect(() => {
    const k = parseFloat(km) || 0;
    const rk = parseFloat(rateKm) || 0;
    const t = parseFloat(trips) || 1;
    const wh = parseFloat(waitHours) || 0;
    const wr = parseFloat(waitRate) || 0;
    const ex = parseFloat(extraCost) || 0;
    const spd = parseFloat(avgSpeed) || 65;

    // Calcoli
    // Nota: Spesso nei trasporti si calcola andata e ritorno se il vettore carica solo per noi,
    // oppure solo andata se a viaggio. Qui assumiamo che l'utente inserisca i km totali tassabili a viaggio.
    const cTravel = k * rk * t;
    const cWait = wh * wr * t; // Attesa per ogni viaggio
    const cExtra = ex * t;     // Extra per ogni viaggio
    
    setCostTravel(cTravel);
    setCostWait(cWait);
    setCostExtra(cExtra);
    const tot = cTravel + cWait + cExtra;
    setTotal(tot);

    // Percentuali Chart
    if (tot > 0) {
        setChartData({
            travel: (cTravel / tot) * 100,
            wait: (cWait / tot) * 100,
            extra: (cExtra / tot) * 100
        });
    } else {
        setChartData({ travel: 0, wait: 0, extra: 0 });
    }

    // Stima tempo guida (solo andata per singolo viaggio basata sui km inseriti)
    if (k > 0 && spd > 0) {
        const hours = k / spd;
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        setTimeEst(`${h}h ${m}m`);
    } else {
        setTimeEst('--:--');
    }

  }, [km, rateKm, trips, waitHours, waitRate, extraCost, avgSpeed]);

  const copy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    showToast('Copiato!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-slide-in">
        
        {/* Header */}
        <div className="flex items-center justify-between no-print">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="bg-amber-500/20 w-10 h-10 rounded-xl flex items-center justify-center text-amber-500 border border-amber-500/20">
                    <i className="fa-solid fa-truck-fast"></i>
                </span>
                Preventivo Trasporti
            </h2>
            <div className="text-[10px] bg-white/5 px-3 py-1 rounded-full border border-white/10 text-slate-400">
                <i className="fa-solid fa-road mr-2"></i>Logistica
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* INPUTS */}
            <div className="lg:col-span-8 space-y-6">
                
                {/* Sezione Viaggio */}
                <div className="glass-panel rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Parametri Viaggio</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] text-slate-400 font-bold uppercase mb-2 block ml-1">Distanza Totale (A/R)</label>
                                <div className="relative">
                                    <input type="number" value={km} onChange={e => setKm(e.target.value)} className="w-full glass-input rounded-xl p-3 pl-4 text-white font-mono text-lg outline-none focus:border-amber-500/50" placeholder="0"/>
                                    <span className="absolute right-4 top-3.5 text-xs text-slate-500 font-bold">KM</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-400 font-bold uppercase mb-2 block ml-1">Tariffa Kilometrica</label>
                                <div className="relative">
                                    <input type="number" value={rateKm} onChange={e => setRateKm(e.target.value)} className="w-full glass-input rounded-xl p-3 pl-4 text-white font-mono text-lg outline-none focus:border-amber-500/50" placeholder="0.00"/>
                                    <span className="absolute right-4 top-3.5 text-xs text-slate-500 font-bold">€/km</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                             <div>
                                <label className="text-[10px] text-slate-400 font-bold uppercase mb-2 block ml-1">Numero Viaggi</label>
                                <div className="relative">
                                    <input type="number" value={trips} onChange={e => setTrips(e.target.value)} className="w-full glass-input rounded-xl p-3 pl-4 text-white font-mono text-lg outline-none focus:border-amber-500/50" placeholder="1"/>
                                    <span className="absolute right-4 top-3.5 text-xs text-slate-500 font-bold"><i className="fa-solid fa-repeat"></i></span>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-400 font-bold uppercase mb-2 block ml-1">Velocità Media (Stima)</label>
                                <div className="relative">
                                    <input type="number" value={avgSpeed} onChange={e => setAvgSpeed(e.target.value)} className="w-full glass-input rounded-xl p-3 pl-4 text-slate-300 font-mono text-sm outline-none focus:border-amber-500/50" placeholder="65"/>
                                    <span className="absolute right-4 top-3.5 text-xs text-slate-500 font-bold">km/h</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sezione Extra e Tempi */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-panel rounded-2xl p-6">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><i className="fa-regular fa-clock"></i> Tempi & Attese</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">Ore Attesa (Carico/Scarico)</label>
                                <input type="number" value={waitHours} onChange={e => setWaitHours(e.target.value)} className="w-full glass-input rounded-xl p-2 text-white text-center outline-none"/>
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">Costo Orario Fermo</label>
                                <div className="relative">
                                    <input type="number" value={waitRate} onChange={e => setWaitRate(e.target.value)} className="w-full glass-input rounded-xl p-2 text-white text-center outline-none"/>
                                    <span className="absolute right-3 top-2 text-[10px] text-slate-500">€/h</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="glass-panel rounded-2xl p-6">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><i className="fa-solid fa-plus"></i> Costi Accessori</h3>
                        <div className="space-y-4">
                             <div>
                                <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">Permessi / Scorta / Pedaggi</label>
                                <div className="relative">
                                    <input type="number" value={extraCost} onChange={e => setExtraCost(e.target.value)} className="w-full glass-input rounded-xl p-2 text-white text-center outline-none" placeholder="0.00"/>
                                    <span className="absolute right-3 top-2 text-[10px] text-slate-500">€</span>
                                </div>
                                <p className="text-[9px] text-slate-600 mt-2 text-center">* Costo applicato per singolo viaggio</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* OUTPUTS */}
            <div className="lg:col-span-4 space-y-6">
                <div className="glass-panel rounded-2xl p-6 sticky top-24 border-t-4 border-amber-500 print-break-inside">
                     <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <i className="fa-solid fa-calculator text-amber-500"></i> Totale Stimato
                   </h3>

                   {/* Donut Chart */}
                   <div className="flex justify-center mb-6 relative no-print">
                        <div 
                            className="w-32 h-32 rounded-full relative"
                            style={{
                                background: `conic-gradient(
                                    #f59e0b 0% ${chartData.travel}%,
                                    #ef4444 ${chartData.travel}% ${chartData.travel + chartData.wait}%,
                                    #3b82f6 ${chartData.travel + chartData.wait}% 100%
                                )`
                            }}
                        >
                            <div className="absolute inset-2 bg-slate-900 rounded-full flex items-center justify-center flex-col">
                                <span className="text-[10px] text-slate-500 uppercase">Totale</span>
                                <span className="font-bold text-white text-sm">€{total.toFixed(0)}</span>
                            </div>
                        </div>
                        <div className="absolute -right-2 top-0 flex flex-col gap-2 text-[9px] font-bold uppercase">
                            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-500"></span>Viaggio</div>
                            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-500"></span>Attesa</div>
                            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-500"></span>Extra</div>
                        </div>
                   </div>

                   <div className="space-y-3 mb-6">
                       <div className="flex justify-between items-center p-2 rounded hover:bg-white/5 transition-colors">
                            <span className="text-xs text-slate-400 uppercase tracking-wider">Viaggio ({km} km)</span>
                            <span className="font-mono text-white">€ {costTravel.toLocaleString('it-IT', {minimumFractionDigits: 2})}</span>
                       </div>
                       <div className="flex justify-between items-center p-2 rounded hover:bg-white/5 transition-colors">
                            <span className="text-xs text-slate-400 uppercase tracking-wider">Fermo ({waitHours}h)</span>
                            <span className="font-mono text-white">€ {costWait.toLocaleString('it-IT', {minimumFractionDigits: 2})}</span>
                       </div>
                       <div className="flex justify-between items-center p-2 rounded hover:bg-white/5 transition-colors">
                            <span className="text-xs text-slate-400 uppercase tracking-wider">Extra</span>
                            <span className="font-mono text-white">€ {costExtra.toLocaleString('it-IT', {minimumFractionDigits: 2})}</span>
                       </div>
                       
                       <div className="h-px bg-white/10 my-2"></div>
                       
                       <div className="flex justify-between items-center p-2 bg-amber-500/10 rounded border border-amber-500/20">
                            <span className="text-xs text-amber-500 font-bold uppercase tracking-wider">Tempo Guida</span>
                            <span className="font-mono text-amber-400 font-bold">{timeEst}</span>
                       </div>
                   </div>

                   <div className="bg-gradient-to-br from-amber-900/40 to-slate-900/50 p-6 rounded-xl border border-amber-500/30 text-center cursor-pointer hover:scale-[1.02] transition-transform group" onClick={() => copy(total.toFixed(2))}>
                      <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">Costo Totale</div>
                      <div className="text-3xl font-bold text-white font-mono group-hover:text-amber-200 transition-colors">€ {total.toLocaleString('it-IT', {minimumFractionDigits: 2})}</div>
                      <div className="text-[10px] text-slate-500 mt-2">
                        {(total / (parseFloat(km) || 1)).toLocaleString('it-IT', {minimumFractionDigits: 2})} €/km complessivi
                      </div>
                   </div>

                   <button onClick={handlePrint} className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl border border-white/10 transition-colors no-print">
                       <i className="fa-solid fa-print mr-2"></i> Stampa Preventivo
                   </button>
                </div>

                {/* Info Box */}
                <div className="glass-panel p-4 rounded-xl border border-white/5 bg-blue-500/5 no-print">
                    <div className="flex gap-3">
                        <div className="mt-1 text-blue-400"><i className="fa-solid fa-circle-info"></i></div>
                        <div>
                            <h4 className="text-xs font-bold text-blue-400 uppercase mb-1">Nota Logistica</h4>
                            <p className="text-[10px] text-slate-400 leading-relaxed">
                                Il calcolo del tempo di guida è puramente indicativo e basato sulla velocità media inserita. Non include le pause obbligatorie per legge (tacho) o traffico.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}