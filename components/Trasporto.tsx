import { useState, useEffect } from 'react';

interface Props {
  showToast: (msg: string) => void;
}

// --- DATA FOR ORDINARI TABLE ---
const ORDINARI_ROWS = [
  { km: 25,  norm: 0.79, p240: 0.84, p300: 1.05, p320: 1.12, p350: 1.16 },
  { km: 30,  norm: 0.82, p240: 0.92, p300: 1.08, p320: 1.13, p350: 1.16 },
  { km: 40,  norm: 0.89, p240: 0.99, p300: 1.14, p320: 1.13, p350: 1.16 },
  { km: 50,  norm: 0.97, p240: 1.08, p300: 1.23, p320: 1.28, p350: 1.63 },
  { km: 60,  norm: 1.08, p240: 1.16, p300: 1.29, p320: 1.28, p350: 1.63 },
  { km: 70,  norm: 1.16, p240: 1.24, p300: 1.39, p320: 1.28, p350: 1.63 },
  { km: 75,  norm: 1.21, p240: 1.26, p300: 1.45, p320: 1.51, p350: 2.03 },
  { km: 80,  norm: 1.24, p240: 1.31, p300: 1.48, p320: 1.51, p350: 2.03 },
  { km: 90,  norm: 1.34, p240: 1.44, p300: 1.58, p320: 1.51, p350: 2.03 },
  { km: 100, norm: 1.44, p240: 1.55, p300: 1.70, p320: 1.68, p350: 2.55 },
  { km: 110, norm: 1.51, p240: 1.65, p300: 1.80, p320: 1.68, p350: 2.55 },
  { km: 120, norm: 1.61, p240: 1.73, p300: 1.90, p320: 1.68, p350: 2.55 },
  { km: 125, norm: 1.68, p240: 1.76, p300: 1.94, p320: 1.92, p350: 3.71 },
  { km: 130, norm: 1.71, p240: 1.83, p300: 1.98, p320: 1.92, p350: 3.71 },
  { km: 140, norm: 1.80, p240: 1.93, p300: 2.08, p320: 1.92, p350: 3.71 },
  { km: 150, norm: 1.90, p240: 2.02, p300: 2.18, p320: 2.27, p350: 4.05 },
  { km: 160, norm: 2.00, p240: 2.12, p300: 2.27, p320: 2.27, p350: 4.05 },
  { km: 170, norm: 2.08, p240: 2.22, p300: 2.35, p320: 2.27, p350: 4.05 },
  { km: 175, norm: 2.11, p240: 2.26, p300: 2.42, p320: 2.60, p350: 4.59 },
  { km: 180, norm: 2.17, p240: 2.30, p300: 2.47, p320: 2.60, p350: 4.59 },
  { km: 190, norm: 2.22, p240: 2.40, p300: 2.57, p320: 2.60, p350: 4.59 },
  { km: 200, norm: 2.28, p240: 2.49, p300: 2.67, p320: 2.96, p350: 4.70 },
  { km: 210, norm: 2.35, p240: 2.57, p300: 2.77, p320: 2.96, p350: 4.70 },
  { km: 220, norm: 2.42, p240: 2.65, p300: 2.86, p320: 2.96, p350: 4.70 },
  { km: 225, norm: 2.44, p240: 2.69, p300: 2.94, p320: 3.31, p350: 4.86 },
  { km: 230, norm: 2.47, p240: 2.74, p300: 2.96, p320: 3.31, p350: 4.86 },
  { km: 240, norm: 2.54, p240: 2.82, p300: 3.06, p320: 3.31, p350: 4.86 },
  { km: 250, norm: 2.60, p240: 2.91, p300: 3.14, p320: 3.66, p350: 4.97 },
  { km: 260, norm: 2.67, p240: 2.99, p300: 3.26, p320: 3.66, p350: 4.97 },
  { km: 270, norm: 2.76, p240: 3.07, p300: 3.36, p320: 3.66, p350: 4.97 },
  { km: 275, norm: 2.84, p240: 3.13, p300: 3.45, p320: 4.00, p350: 5.21 },
  { km: 280, norm: 2.86, p240: 3.16, p300: 3.48, p320: 4.00, p350: 5.21 },
  { km: 290, norm: 2.96, p240: 3.26, p300: 3.61, p320: 4.00, p350: 5.21 },
  { km: 300, norm: 3.06, p240: 3.36, p300: 3.78, p320: 4.32, p350: 5.78 },
];

// --- DATA FOR ECCEZIONALI TABLE ---
const ECCEZIONALI_ROWS = [
  { km: 25,  u16: 1.83, u19: 2.10, u23: 3.68, u27: 4.60, u31: 4.97, o31: 5.97 },
  { km: 50,  u16: 2.15, u19: 2.53, u23: 4.03, u27: 5.30, u31: 5.75, o31: 6.90 },
  { km: 75,  u16: 2.55, u19: 3.01, u23: 4.60, u27: 5.75, u31: 6.07, o31: 7.29 },
  { km: 100, u16: 3.09, u19: 3.49, u23: 5.27, u27: 6.10, u31: 6.50, o31: 7.81 },
  { km: 125, u16: 3.47, u19: 3.79, u23: 5.86, u27: 6.53, u31: 7.15, o31: 8.58 },
  { km: 150, u16: 4.14, u19: 4.46, u23: 6.67, u27: 7.45, u31: 8.06, o31: 9.68 },
  { km: 175, u16: 4.60, u19: 4.92, u23: 7.45, u27: 8.25, u31: 9.52, o31: 11.42 },
  { km: 200, u16: 5.16, u19: 5.54, u23: 8.47, u27: 8.92, u31: 10.27, o31: 12.32 },
  { km: 225, u16: 5.75, u19: 6.10, u23: 9.17, u27: 9.84, u31: 11.05, o31: 13.26 },
  { km: 250, u16: 6.18, u19: 6.53, u23: 10.11, u27: 10.75, u31: 12.02, o31: 14.42 },
  { km: 275, u16: 6.64, u19: 6.99, u23: 11.42, u27: 12.10, u31: 13.79, o31: 16.55 },
  { km: 300, u16: 7.15, u19: 7.45, u23: 12.79, u27: 13.41, u31: 15.32, o31: 18.39 },
];

type OrdinariType = 'norm' | 'p240' | 'p300' | 'p320' | 'p350';
type EccezionaliType = 'u16' | 'u19' | 'u23' | 'u27' | 'u31' | 'o31';

interface TransportItem {
  id: string;
  typeLabel: string;
  details: string;
  cost: number;
  weight: number; // Quintali
}

export default function Trasporto({ showToast }: Props) {
  const [activeTab, setActiveTab] = useState<'logistica' | 'ordinari' | 'eccezionali'>('logistica');

  // --- LOGISTICA STATE ---
  const [km, setKm] = useState<string>('');
  const [rateKm, setRateKm] = useState<string>('2.20');
  const [trips, setTrips] = useState<string>('1');
  const [waitHours, setWaitHours] = useState<string>('0');
  const [waitRate, setWaitRate] = useState<string>('65.00');
  const [extraCost, setExtraCost] = useState<string>('0');
  const [avgSpeed, setAvgSpeed] = useState<string>('65');
  const [costTravel, setCostTravel] = useState(0);
  const [costWait, setCostWait] = useState(0);
  const [costExtra, setCostExtra] = useState(0);
  const [total, setTotal] = useState(0);
  const [timeEst, setTimeEst] = useState('--:--');
  const [chartData, setChartData] = useState({ travel: 0, wait: 0, extra: 0 });

  // --- ORDINARI STATE ---
  const [ordMc, setOrdMc] = useState<string>('');
  const [ordKm, setOrdKm] = useState<number>(25);
  const [ordType, setOrdType] = useState<OrdinariType>('norm');
  const [ordSpecWeight, setOrdSpecWeight] = useState<string>('2500'); // kg/mc
  const [ordTotalCost, setOrdTotalCost] = useState<number>(0);
  const [ordRate, setOrdRate] = useState<number>(0);
  const [ordList, setOrdList] = useState<TransportItem[]>([]);

  // --- ECCEZIONALI STATE ---
  const [excMc, setExcMc] = useState<string>('');
  const [excKm, setExcKm] = useState<number>(25);
  const [excType, setExcType] = useState<EccezionaliType>('u16');
  const [excSpecWeight, setExcSpecWeight] = useState<string>('2500'); // kg/mc
  const [excTotalCost, setExcTotalCost] = useState<number>(0);
  const [excRate, setExcRate] = useState<number>(0);
  const [excList, setExcList] = useState<TransportItem[]>([]);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('trasportoData');
    if (saved) {
        try {
            const d = JSON.parse(saved);
            if(d.km) setKm(d.km);
            if(d.rateKm) setRateKm(d.rateKm);
            if(d.trips) setTrips(d.trips);
            if(d.waitHours) setWaitHours(d.waitHours);
            if(d.waitRate) setWaitRate(d.waitRate);
            if(d.extraCost) setExtraCost(d.extraCost);
            if(d.avgSpeed) setAvgSpeed(d.avgSpeed);
            if(d.ordMc) setOrdMc(d.ordMc);
            if(d.ordKm) setOrdKm(d.ordKm);
            if(d.ordType) setOrdType(d.ordType);
            if(d.ordSpecWeight) setOrdSpecWeight(d.ordSpecWeight);
            if(d.ordList) setOrdList(d.ordList);
            if(d.excMc) setExcMc(d.excMc);
            if(d.excKm) setExcKm(d.excKm);
            if(d.excType) setExcType(d.excType);
            if(d.excSpecWeight) setExcSpecWeight(d.excSpecWeight);
            if(d.excList) setExcList(d.excList);
        } catch(e) {}
    }
  }, []);

  const handleSave = () => {
      const data = { km, rateKm, trips, waitHours, waitRate, extraCost, avgSpeed, ordMc, ordKm, ordType, ordSpecWeight, ordList, excMc, excKm, excType, excSpecWeight, excList };
      localStorage.setItem('trasportoData', JSON.stringify(data));
      showToast('Dati salvati!');
  };

  const handleReset = () => {
      if (window.confirm("Sei sicuro di voler resettare tutti i dati del preventivo trasporti? Questa azione non può essere annullata.")) {
        // Logistica
        setKm('');
        setRateKm('2.20');
        setTrips('1');
        setWaitHours('0');
        setWaitRate('65.00');
        setExtraCost('0');
        setAvgSpeed('65');
        // Ordinari
        setOrdMc('');
        setOrdKm(25);
        setOrdType('norm');
        setOrdSpecWeight('2500');
        setOrdList([]);
        // Eccezionali
        setExcMc('');
        setExcKm(25);
        setExcType('u16');
        setExcSpecWeight('2500');
        setExcList([]);
        
        // Clear local storage
        localStorage.removeItem('trasportoData');
        showToast('Dati resettati con successo');
      }
  };

  const handleShare = async () => {
      let text = 'Report Trasporto\n';
      if(activeTab === 'logistica') {
          text += `Logistica: Totale € ${total.toFixed(2)}`;
      } else if(activeTab === 'ordinari') {
          const listTotal = ordList.reduce((acc, item) => acc + item.cost, 0);
          text += `Ordinari: Totale Riepilogo € ${listTotal.toFixed(2)} (${ordList.length} voci)`;
      } else {
          const listTotal = excList.reduce((acc, item) => acc + item.cost, 0);
          text += `Eccezionali: Totale Riepilogo € ${listTotal.toFixed(2)} (${excList.length} voci)`;
      }
      
      if (navigator.share) {
          try { await navigator.share({ title: 'Trasporto', text }); } catch {}
      } else {
          navigator.clipboard.writeText(text);
          showToast('Copiato negli appunti');
      }
  };

  // --- LOGISTICA EFFECTS ---
  useEffect(() => {
    const k = parseFloat(km) || 0;
    const rk = parseFloat(rateKm) || 0;
    const t = parseFloat(trips) || 1;
    const wh = parseFloat(waitHours) || 0;
    const wr = parseFloat(waitRate) || 0;
    const ex = parseFloat(extraCost) || 0;
    const spd = parseFloat(avgSpeed) || 65;

    const cTravel = k * rk * t;
    const cWait = wh * wr * t; 
    const cExtra = ex * t;     
    
    setCostTravel(cTravel);
    setCostWait(cWait);
    setCostExtra(cExtra);
    const tot = cTravel + cWait + cExtra;
    setTotal(tot);

    if (tot > 0) {
        setChartData({
            travel: (cTravel / tot) * 100,
            wait: (cWait / tot) * 100,
            extra: (cExtra / tot) * 100
        });
    } else {
        setChartData({ travel: 0, wait: 0, extra: 0 });
    }

    if (k > 0 && spd > 0) {
        const hours = k / spd;
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        setTimeEst(`${h}h ${m}m`);
    } else {
        setTimeEst('--:--');
    }
  }, [km, rateKm, trips, waitHours, waitRate, extraCost, avgSpeed]);

  // --- ORDINARI EFFECTS ---
  useEffect(() => {
    const mc = parseFloat(ordMc) || 0;
    const specW = parseFloat(ordSpecWeight) || 2500;
    
    // Find row
    const row = ORDINARI_ROWS.find(r => r.km === ordKm) || ORDINARI_ROWS[0];
    const rate = row[ordType];
    setOrdRate(rate);

    // Calc weight in Quintali (100kg)
    const weightQle = (mc * specW) / 100;
    
    // Assuming table price is €/Quintale for that distance
    const cost = weightQle * rate;
    
    setOrdTotalCost(cost);
  }, [ordMc, ordKm, ordType, ordSpecWeight]);

  // --- ECCEZIONALI EFFECTS ---
  useEffect(() => {
    const mc = parseFloat(excMc) || 0;
    const specW = parseFloat(excSpecWeight) || 2500;
    
    // Find row
    const row = ECCEZIONALI_ROWS.find(r => r.km === excKm) || ECCEZIONALI_ROWS[0];
    const rate = row[excType];
    setExcRate(rate);

    // Calc weight in Quintali (100kg)
    const weightQle = (mc * specW) / 100;
    
    // Assuming table price is €/Quintale for that distance
    const cost = weightQle * rate;
    
    setExcTotalCost(cost);
  }, [excMc, excKm, excType, excSpecWeight]);

  // --- LIST HELPERS ---
  const getOrdTypeLabel = (t: OrdinariType) => {
      switch(t) {
          case 'norm': return 'Normali';
          case 'p240': return 'Pareti h 240';
          case 'p300': return 'Pareti h 300';
          case 'p320': return 'Pareti h 320';
          case 'p350': return 'Pareti h 350';
          default: return t;
      }
  };

  const getExcTypeLabel = (t: EccezionaliType) => {
      switch(t) {
          case 'u16': return 'Fino 16m';
          case 'u19': return 'Fino 19m';
          case 'u23': return 'Fino 23m';
          case 'u27': return 'Fino 27m';
          case 'u31': return 'Fino 31m';
          case 'o31': return 'Oltre 31m';
          default: return t;
      }
  };

  const addOrdItem = () => {
      if(ordTotalCost <= 0) return;
      const weightQle = ((parseFloat(ordMc) || 0) * (parseFloat(ordSpecWeight) || 0) / 100);
      const newItem: TransportItem = {
          id: Date.now().toString(),
          typeLabel: getOrdTypeLabel(ordType),
          details: `${ordKm} km - ${weightQle.toFixed(1)} q.li`,
          cost: ordTotalCost,
          weight: weightQle
      };
      setOrdList([...ordList, newItem]);
      showToast('Aggiunto al riepilogo');
  };

  const addExcItem = () => {
      if(excTotalCost <= 0) return;
      const weightQle = ((parseFloat(excMc) || 0) * (parseFloat(excSpecWeight) || 0) / 100);
      const newItem: TransportItem = {
          id: Date.now().toString(),
          typeLabel: getExcTypeLabel(excType),
          details: `${excKm} km - ${weightQle.toFixed(1)} q.li`,
          cost: excTotalCost,
          weight: weightQle
      };
      setExcList([...excList, newItem]);
      showToast('Aggiunto al riepilogo');
  };

  const removeListItem = (listType: 'ord' | 'exc', id: string) => {
      if(listType === 'ord') {
          setOrdList(ordList.filter(i => i.id !== id));
      } else {
          setExcList(excList.filter(i => i.id !== id));
      }
  };

  const copy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    showToast('Copiato!');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-slide-in">
        
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 no-print">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="bg-amber-500/20 w-10 h-10 rounded-xl flex items-center justify-center text-amber-500 border border-amber-500/20">
                    <i className="fa-solid fa-truck-fast"></i>
                </span>
                Preventivo Trasporti
            </h2>
            
            <div className="bg-black/20 p-1 rounded-xl flex border border-white/10 overflow-x-auto">
                <button 
                    onClick={() => setActiveTab('logistica')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all whitespace-nowrap ${activeTab === 'logistica' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                    Logistica
                </button>
                <button 
                    onClick={() => setActiveTab('ordinari')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all whitespace-nowrap ${activeTab === 'ordinari' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                    Ordinari
                </button>
                <button 
                    onClick={() => setActiveTab('eccezionali')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all whitespace-nowrap ${activeTab === 'eccezionali' ? 'bg-red-500 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                    Eccezionali
                </button>
            </div>
        </div>

      <div className="flex justify-end gap-2 mb-2 no-print">
          <button onClick={handleReset} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm font-bold transition-colors border border-red-500/20 flex items-center gap-2"><i className="fa-solid fa-rotate-left"></i> Reset</button>
          <button onClick={handleSave} className="bg-white/10 hover:bg-white/20 text-slate-300 px-4 py-2 rounded-lg text-sm font-bold transition-colors border border-white/5 flex items-center gap-2"><i className="fa-solid fa-floppy-disk"></i> Salva</button>
          <button onClick={handleShare} className="bg-white/10 hover:bg-white/20 text-slate-300 px-4 py-2 rounded-lg text-sm font-bold transition-colors border border-white/5 flex items-center gap-2"><i className="fa-solid fa-share-nodes"></i> Condividi</button>
          <button onClick={() => window.print()} className="bg-white/10 hover:bg-white/20 text-slate-300 px-4 py-2 rounded-lg text-sm font-bold transition-colors border border-white/5 flex items-center gap-2"><i className="fa-solid fa-print"></i> Stampa</button>
      </div>

        {/* ==================== SEZIONE LOGISTICA (EXISTING) ==================== */}
        {activeTab === 'logistica' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
                {/* INPUTS */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Sezione Viaggio */}
                    <div className="glass-panel rounded-2xl p-6 print-break-inside">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print-break-inside">
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
        )}

        {/* ==================== SEZIONE ORDINARI ==================== */}
        {activeTab === 'ordinari' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
                {/* CALCOLATORE */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="glass-panel rounded-2xl p-8 sticky top-24 border-t-4 border-indigo-500 print-break-inside">
                         <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                             <i className="fa-solid fa-calculator text-indigo-500"></i> Calcolo Ordinari
                         </h3>
                         
                         <div className="space-y-6">
                            {/* MC Input */}
                            <div className="relative">
                                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 block ml-1">Volume Totale</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={ordMc} 
                                        onChange={(e) => setOrdMc(e.target.value)} 
                                        className="w-full glass-input rounded-xl p-4 pl-4 text-white font-mono text-2xl outline-none focus:border-indigo-500/50" 
                                        placeholder="0"
                                    />
                                    <span className="absolute right-4 top-5 text-sm text-slate-500 font-bold">mc</span>
                                </div>
                            </div>

                            {/* Select Km */}
                            <div>
                                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 block ml-1">Fascia Stabilimento</label>
                                <div className="relative">
                                    <select 
                                        value={ordKm} 
                                        onChange={(e) => setOrdKm(parseInt(e.target.value))} 
                                        className="w-full glass-input rounded-xl p-3 text-white appearance-none cursor-pointer outline-none"
                                    >
                                        {ORDINARI_ROWS.map(r => (
                                            <option key={r.km} value={r.km} className="bg-slate-800">Km {r.km}</option>
                                        ))}
                                    </select>
                                    <i className="fa-solid fa-chevron-down absolute right-4 top-3.5 text-slate-500 pointer-events-none"></i>
                                </div>
                            </div>

                             {/* Select Type */}
                            <div>
                                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 block ml-1">Tipologia Manufatto</label>
                                <div className="relative">
                                    <select 
                                        value={ordType} 
                                        onChange={(e) => setOrdType(e.target.value as OrdinariType)} 
                                        className="w-full glass-input rounded-xl p-3 text-white appearance-none cursor-pointer outline-none"
                                    >
                                        <option value="norm" className="bg-slate-800">Normali</option>
                                        <option value="p240" className="bg-slate-800">Pareti h 240</option>
                                        <option value="p300" className="bg-slate-800">Pareti h 300</option>
                                        <option value="p320" className="bg-slate-800">Pareti h 320</option>
                                        <option value="p350" className="bg-slate-800">Pareti h 350</option>
                                    </select>
                                    <i className="fa-solid fa-chevron-down absolute right-4 top-3.5 text-slate-500 pointer-events-none"></i>
                                </div>
                            </div>

                            <div className="h-px bg-white/10 my-4"></div>

                            {/* Specific Weight (Conversion) */}
                            <div className="bg-white/5 p-4 rounded-xl">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Peso Specifico</label>
                                    <span className="text-[10px] text-slate-600">(Default CLS: 2500)</span>
                                </div>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={ordSpecWeight} 
                                        onChange={(e) => setOrdSpecWeight(e.target.value)} 
                                        className="w-full glass-input rounded-lg p-2 text-center text-sm text-slate-300 outline-none" 
                                        placeholder="2500"
                                    />
                                    <span className="absolute right-3 top-2 text-[10px] text-slate-500">kg/mc</span>
                                </div>
                            </div>
                         </div>
                         
                         {/* Result Box */}
                         <div className="mt-8 bg-gradient-to-br from-indigo-900/50 to-slate-900/50 border border-indigo-500/30 p-6 rounded-2xl text-center">
                             <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-2">Tariffa Applicata: {ordRate} €/qle</div>
                             <div className="text-4xl font-bold text-white font-mono cursor-pointer hover:scale-105 transition-transform" onClick={() => copy(ordTotalCost.toFixed(2))}>
                                 € {ordTotalCost.toLocaleString('it-IT', {minimumFractionDigits: 2})}
                             </div>
                             <div className="text-[10px] text-slate-500 mt-2 uppercase font-bold tracking-wider">
                                 {((parseFloat(ordMc) || 0) * (parseFloat(ordSpecWeight) || 0) / 100).toFixed(1)} Quintali Totali
                             </div>
                         </div>

                         {/* Add to List Button */}
                         <button 
                            onClick={addOrdItem}
                            className="w-full mt-4 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 font-bold py-3 rounded-xl border border-indigo-500/30 transition-all flex justify-center items-center gap-2 no-print"
                         >
                             <i className="fa-solid fa-plus-circle"></i> Aggiungi al Riepilogo
                         </button>

                         {/* List Summary Section */}
                         {ordList.length > 0 && (
                             <div className="mt-6 border-t border-white/10 pt-4 animate-fade-in">
                                 <div className="flex justify-between items-center mb-3">
                                     <h4 className="text-xs font-bold text-slate-300 uppercase">Riepilogo Conteggi</h4>
                                     <button onClick={() => setOrdList([])} className="text-[10px] text-red-400 hover:text-red-300 uppercase font-bold no-print">Svuota</button>
                                 </div>
                                 <div className="space-y-2 max-h-60 overflow-auto custom-scrollbar mb-4">
                                     {ordList.map((item) => (
                                         <div key={item.id} className="bg-black/20 p-3 rounded-lg flex justify-between items-center border border-white/5">
                                             <div>
                                                 <div className="text-xs font-bold text-white">{item.typeLabel}</div>
                                                 <div className="text-[10px] text-slate-500">{item.details}</div>
                                             </div>
                                             <div className="flex items-center gap-3">
                                                 <span className="font-mono text-sm text-indigo-300">€ {item.cost.toLocaleString('it-IT', {minimumFractionDigits: 2})}</span>
                                                 <button onClick={() => removeListItem('ord', item.id)} className="text-slate-600 hover:text-red-400 transition-colors no-print"><i className="fa-solid fa-trash-can text-xs"></i></button>
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                                 <div className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20 flex justify-between items-center">
                                     <span className="text-xs font-bold text-indigo-400 uppercase">Totale Complessivo</span>
                                     <span className="text-xl font-bold text-white font-mono">€ {ordList.reduce((acc, i) => acc + i.cost, 0).toLocaleString('it-IT', {minimumFractionDigits: 2})}</span>
                                 </div>
                             </div>
                         )}
                    </div>
                </div>

                {/* TABELLA DATI */}
                <div className="lg:col-span-7">
                    <div className="glass-panel rounded-2xl overflow-hidden border border-white/10 h-full max-h-[800px] flex flex-col">
                        <div className="bg-white/5 p-4 border-b border-white/10 flex justify-between items-center">
                             <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Tabella Prezzi (€/qle)</h3>
                             <span className="text-[10px] text-slate-500 bg-black/20 px-2 py-1 rounded">Stabilimento</span>
                        </div>
                        <div className="overflow-auto flex-grow custom-scrollbar">
                            <table className="w-full text-center text-sm">
                                <thead className="text-[10px] text-slate-500 uppercase bg-black/20 sticky top-0 z-10 font-bold">
                                    <tr>
                                        <th className="p-3 border-b border-white/10 bg-slate-900">Km</th>
                                        <th className="p-3 border-b border-white/10 bg-slate-900">Normali</th>
                                        <th className="p-3 border-b border-white/10 bg-slate-900">h 240</th>
                                        <th className="p-3 border-b border-white/10 bg-slate-900">h 300</th>
                                        <th className="p-3 border-b border-white/10 bg-slate-900">h 320</th>
                                        <th className="p-3 border-b border-white/10 bg-slate-900">h 350</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-slate-300 font-mono">
                                    {ORDINARI_ROWS.map((r) => (
                                        <tr key={r.km} className={`${r.km === ordKm ? 'bg-indigo-500/20 text-white' : 'hover:bg-white/5'}`}>
                                            <td className="p-3 font-bold text-slate-400">{r.km}</td>
                                            <td className={`p-3 ${ordType === 'norm' && r.km === ordKm ? 'text-indigo-400 font-bold' : ''}`}>{r.norm.toFixed(2)} €</td>
                                            <td className={`p-3 ${ordType === 'p240' && r.km === ordKm ? 'text-indigo-400 font-bold' : ''}`}>{r.p240.toFixed(2)} €</td>
                                            <td className={`p-3 ${ordType === 'p300' && r.km === ordKm ? 'text-indigo-400 font-bold' : ''}`}>{r.p300.toFixed(2)} €</td>
                                            <td className={`p-3 ${ordType === 'p320' && r.km === ordKm ? 'text-indigo-400 font-bold' : ''}`}>{r.p320.toFixed(2)} €</td>
                                            <td className={`p-3 ${ordType === 'p350' && r.km === ordKm ? 'text-indigo-400 font-bold' : ''}`}>{r.p350.toFixed(2)} €</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* ==================== SEZIONE ECCEZIONALI (NEW) ==================== */}
        {activeTab === 'eccezionali' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
                {/* CALCOLATORE */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="glass-panel rounded-2xl p-8 sticky top-24 border-t-4 border-red-500 print-break-inside">
                         <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                             <i className="fa-solid fa-calculator text-red-500"></i> Calcolo Eccezionali
                         </h3>
                         
                         <div className="space-y-6">
                            {/* MC Input */}
                            <div className="relative">
                                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 block ml-1">Volume Totale</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={excMc} 
                                        onChange={(e) => setExcMc(e.target.value)} 
                                        className="w-full glass-input rounded-xl p-4 pl-4 text-white font-mono text-2xl outline-none focus:border-red-500/50" 
                                        placeholder="0"
                                    />
                                    <span className="absolute right-4 top-5 text-sm text-slate-500 font-bold">mc</span>
                                </div>
                            </div>

                            {/* Select Km */}
                            <div>
                                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 block ml-1">Fascia Stabilimento</label>
                                <div className="relative">
                                    <select 
                                        value={excKm} 
                                        onChange={(e) => setExcKm(parseInt(e.target.value))} 
                                        className="w-full glass-input rounded-xl p-3 text-white appearance-none cursor-pointer outline-none"
                                    >
                                        {ECCEZIONALI_ROWS.map(r => (
                                            <option key={r.km} value={r.km} className="bg-slate-800">Km {r.km}</option>
                                        ))}
                                    </select>
                                    <i className="fa-solid fa-chevron-down absolute right-4 top-3.5 text-slate-500 pointer-events-none"></i>
                                </div>
                            </div>

                             {/* Select Type */}
                            <div>
                                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 block ml-1">Tipologia Elemento</label>
                                <div className="relative">
                                    <select 
                                        value={excType} 
                                        onChange={(e) => setExcType(e.target.value as EccezionaliType)} 
                                        className="w-full glass-input rounded-xl p-3 text-white appearance-none cursor-pointer outline-none"
                                    >
                                        <option value="u16" className="bg-slate-800">Fino a 16 metri</option>
                                        <option value="u19" className="bg-slate-800">Fino a 19 metri</option>
                                        <option value="u23" className="bg-slate-800">Fino a 23 metri</option>
                                        <option value="u27" className="bg-slate-800">Fino a 27 metri</option>
                                        <option value="u31" className="bg-slate-800">Fino a 31 metri</option>
                                        <option value="o31" className="bg-slate-800">Oltre 31 metri</option>
                                    </select>
                                    <i className="fa-solid fa-chevron-down absolute right-4 top-3.5 text-slate-500 pointer-events-none"></i>
                                </div>
                            </div>

                            <div className="h-px bg-white/10 my-4"></div>

                            {/* Specific Weight (Conversion) */}
                            <div className="bg-white/5 p-4 rounded-xl">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Peso Specifico</label>
                                    <span className="text-[10px] text-slate-600">(Default CLS: 2500)</span>
                                </div>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={excSpecWeight} 
                                        onChange={(e) => setExcSpecWeight(e.target.value)} 
                                        className="w-full glass-input rounded-lg p-2 text-center text-sm text-slate-300 outline-none" 
                                        placeholder="2500"
                                    />
                                    <span className="absolute right-3 top-2 text-[10px] text-slate-500">kg/mc</span>
                                </div>
                            </div>
                         </div>
                         
                         {/* Result Box */}
                         <div className="mt-8 bg-gradient-to-br from-red-900/50 to-slate-900/50 border border-red-500/30 p-6 rounded-2xl text-center">
                             <div className="text-[10px] text-red-400 font-bold uppercase tracking-wider mb-2">Tariffa Applicata: {excRate} €/qle</div>
                             <div className="text-4xl font-bold text-white font-mono cursor-pointer hover:scale-105 transition-transform" onClick={() => copy(excTotalCost.toFixed(2))}>
                                 € {excTotalCost.toLocaleString('it-IT', {minimumFractionDigits: 2})}
                             </div>
                             <div className="text-[10px] text-slate-500 mt-2 uppercase font-bold tracking-wider">
                                 {((parseFloat(excMc) || 0) * (parseFloat(excSpecWeight) || 0) / 100).toFixed(1)} Quintali Totali
                             </div>
                         </div>

                         {/* Add to List Button */}
                         <button 
                            onClick={addExcItem}
                            className="w-full mt-4 bg-red-600/20 hover:bg-red-600/40 text-red-300 font-bold py-3 rounded-xl border border-red-500/30 transition-all flex justify-center items-center gap-2 no-print"
                         >
                             <i className="fa-solid fa-plus-circle"></i> Aggiungi al Riepilogo
                         </button>

                         {/* List Summary Section */}
                         {excList.length > 0 && (
                             <div className="mt-6 border-t border-white/10 pt-4 animate-fade-in">
                                 <div className="flex justify-between items-center mb-3">
                                     <h4 className="text-xs font-bold text-slate-300 uppercase">Riepilogo Conteggi</h4>
                                     <button onClick={() => setExcList([])} className="text-[10px] text-red-400 hover:text-red-300 uppercase font-bold no-print">Svuota</button>
                                 </div>
                                 <div className="space-y-2 max-h-60 overflow-auto custom-scrollbar mb-4">
                                     {excList.map((item) => (
                                         <div key={item.id} className="bg-black/20 p-3 rounded-lg flex justify-between items-center border border-white/5">
                                             <div>
                                                 <div className="text-xs font-bold text-white">{item.typeLabel}</div>
                                                 <div className="text-[10px] text-slate-500">{item.details}</div>
                                             </div>
                                             <div className="flex items-center gap-3">
                                                 <span className="font-mono text-sm text-red-300">€ {item.cost.toLocaleString('it-IT', {minimumFractionDigits: 2})}</span>
                                                 <button onClick={() => removeListItem('exc', item.id)} className="text-slate-600 hover:text-red-400 transition-colors no-print"><i className="fa-solid fa-trash-can text-xs"></i></button>
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                                 <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20 flex justify-between items-center">
                                     <span className="text-xs font-bold text-red-400 uppercase">Totale Complessivo</span>
                                     <span className="text-xl font-bold text-white font-mono">€ {excList.reduce((acc, i) => acc + i.cost, 0).toLocaleString('it-IT', {minimumFractionDigits: 2})}</span>
                                 </div>
                             </div>
                         )}
                    </div>
                </div>

                {/* TABELLA DATI */}
                <div className="lg:col-span-7">
                    <div className="glass-panel rounded-2xl overflow-hidden border border-white/10 h-full max-h-[800px] flex flex-col">
                        <div className="bg-white/5 p-4 border-b border-white/10 flex justify-between items-center">
                             <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Listino Eccezionali (€/qle)</h3>
                             <span className="text-[10px] text-slate-500 bg-black/20 px-2 py-1 rounded">Stabilimento</span>
                        </div>
                        <div className="overflow-auto flex-grow custom-scrollbar">
                            <table className="w-full text-center text-sm">
                                <thead className="text-[10px] text-slate-500 uppercase bg-black/20 sticky top-0 z-10 font-bold">
                                    <tr>
                                        <th className="p-3 border-b border-white/10 bg-slate-900">Km</th>
                                        <th className="p-3 border-b border-white/10 bg-slate-900 whitespace-nowrap">Fino 16</th>
                                        <th className="p-3 border-b border-white/10 bg-slate-900 whitespace-nowrap">Fino 19</th>
                                        <th className="p-3 border-b border-white/10 bg-slate-900 whitespace-nowrap">Fino 23</th>
                                        <th className="p-3 border-b border-white/10 bg-slate-900 whitespace-nowrap">Fino 27</th>
                                        <th className="p-3 border-b border-white/10 bg-slate-900 whitespace-nowrap">Fino 31</th>
                                        <th className="p-3 border-b border-white/10 bg-slate-900 whitespace-nowrap">Oltre 31</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-slate-300 font-mono">
                                    {ECCEZIONALI_ROWS.map((r) => (
                                        <tr key={r.km} className={`${r.km === excKm ? 'bg-red-500/20 text-white' : 'hover:bg-white/5'}`}>
                                            <td className="p-3 font-bold text-slate-400">{r.km}</td>
                                            <td className={`p-3 ${excType === 'u16' && r.km === excKm ? 'text-red-400 font-bold' : ''}`}>{r.u16.toFixed(2)} €</td>
                                            <td className={`p-3 ${excType === 'u19' && r.km === excKm ? 'text-red-400 font-bold' : ''}`}>{r.u19.toFixed(2)} €</td>
                                            <td className={`p-3 ${excType === 'u23' && r.km === excKm ? 'text-red-400 font-bold' : ''}`}>{r.u23.toFixed(2)} €</td>
                                            <td className={`p-3 ${excType === 'u27' && r.km === excKm ? 'text-red-400 font-bold' : ''}`}>{r.u27.toFixed(2)} €</td>
                                            <td className={`p-3 ${excType === 'u31' && r.km === excKm ? 'text-red-400 font-bold' : ''}`}>{r.u31.toFixed(2)} €</td>
                                            <td className={`p-3 ${excType === 'o31' && r.km === excKm ? 'text-red-400 font-bold' : ''}`}>{r.o31.toFixed(2)} €</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        )}

    </div>
  );
}