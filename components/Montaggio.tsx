import { useState, useEffect, useMemo } from 'react';

interface Props {
  showToast: (msg: string) => void;
}

type Mode = 'tegolo' | 'capriata' | 'costi';

// --- DATA DEFINITIONS ---
type Category = 'Fondazioni' | 'Verticali' | 'Pareti' | 'Orizzontali' | 'Copertura' | 'Accessori' | 'Esterni';

interface MountingItem {
  id: string;
  cat: Category;
  name: string;
  detail: string;
  threshold: string;
  rateStd: number; // Avg of range
  rateXL: number;  // Avg of range
  crit: string;
}

const MOUNTING_DATA: MountingItem[] = [
  // Fondazioni
  { id: 'f1', cat: 'Fondazioni', name: 'Plinti', detail: 'A bicchiere (isolati)', threshold: '> 2.5 x 2.5 m', rateStd: 14, rateXL: 10, crit: 'Pulizia e livello magrone' },
  { id: 'f2', cat: 'Fondazioni', name: 'Bicchiere', detail: 'Su getto in opera H > 1.5 m', threshold: '-', rateStd: 17.5, rateXL: 12, crit: 'Precisione ferri di ripresa' },
  // Verticali
  { id: 'v1', cat: 'Verticali', name: 'Pilastri', detail: 'Monopiano H > 8 m', threshold: '-', rateStd: 12, rateXL: 8, crit: 'Fissaggio cunei alla base' },
  { id: 'v2', cat: 'Verticali', name: 'Pilastri', detail: 'Pluripiano H > 12 m', threshold: '-', rateStd: 7.5, rateXL: 5, crit: 'Lentezza e precisione mensole' },
  { id: 'v3', cat: 'Verticali', name: 'Scale/Vani', detail: 'Rampe e Scatolari', threshold: '-', rateStd: 6.5, rateXL: 4, crit: 'Quote millimetriche' },
  // Pareti
  { id: 'p1', cat: 'Pareti', name: 'Vert. Normali', detail: 'Massicci H > 10 m', threshold: '-', rateStd: 14, rateXL: 10.5, crit: '2 puntelli per pannello' },
  { id: 'p2', cat: 'Pareti', name: 'Vert. T. Termico', detail: 'Taglio Termico H > 10 m', threshold: '-', rateStd: 12, rateXL: 8.5, crit: 'Delicati. Rischio rottura' },
  { id: 'p3', cat: 'Pareti', name: 'Hor. Normali', detail: 'Massicci L > 8 m', threshold: '-', rateStd: 24, rateXL: 17.5, crit: 'Veloci, si impilano bene' },
  { id: 'p4', cat: 'Pareti', name: 'Hor. T. Termico', detail: 'Taglio Termico L > 8 m', threshold: '-', rateStd: 19, rateXL: 14, crit: 'Meno pezzi per carico' },
  // Orizzontali
  { id: 'o1', cat: 'Orizzontali', name: 'Travi', detail: 'Principali (L/T) L > 15 m', threshold: '-', rateStd: 16, rateXL: 12, crit: 'Appoggi in neoprene' },
  { id: 'o2', cat: 'Orizzontali', name: 'Gronde', detail: 'Canaline L > 12 m', threshold: '-', rateStd: 16, rateXL: 12, crit: 'Allineamento pendenze' },
  { id: 'o3', cat: 'Orizzontali', name: 'Capriate', detail: 'Doppia Pendenza L > 20 m', threshold: '-', rateStd: 11.5, rateXL: 6.5, crit: 'Trasporto eccezionale' },
  // Copertura
  { id: 'c1', cat: 'Copertura', name: 'Tegoli', detail: 'TT / Alari L > 18 m', threshold: '-', rateStd: 19, rateXL: 12, crit: 'Superficie esposta al vento' },
  { id: 'c2', cat: 'Copertura', name: 'Arcarecci', detail: 'Travetti Secondari L > 8 m', threshold: '-', rateStd: 50, rateXL: 37.5, crit: 'Se lunghi servono 2 funi' },
  { id: 'c3', cat: 'Copertura', name: 'Solai', detail: 'Alveolari / Lastre L > 10 m', threshold: '-', rateStd: 37.5, rateXL: 25, crit: 'Gestione fori in cantiere' },
  // Accessori
  { id: 'a1', cat: 'Accessori', name: 'Velette', detail: 'Coronamento L > 6 m', threshold: '-', rateStd: 17.5, rateXL: 12, crit: 'Fragili, flettono nel tiro' },
  { id: 'a2', cat: 'Accessori', name: 'Coppelle', detail: 'Raccordi curvi', threshold: '-', rateStd: 40, rateXL: 30, crit: 'Elementi leggeri finitura' },
  // Esterni
  { id: 'e1', cat: 'Esterni', name: 'Recinzioni', detail: 'Pannello con Piede L > 5 m', threshold: '-', rateStd: 25, rateXL: 17.5, crit: 'Preparazione terreno' },
  { id: 'e2', cat: 'Esterni', name: 'Muri', detail: 'Sostegno (L / T) H > 3 m', threshold: '-', rateStd: 17.5, rateXL: 12, crit: 'Stabilità provvisoria' },
];

export default function Montaggio({ showToast }: Props) {
  const [mode, setMode] = useState<Mode>('tegolo');
  const [showRates, setShowRates] = useState(false);
  const [notes, setNotes] = useState('');

  // --- STATI TEGOLO ALARE ---
  const [tegA, setTegA] = useState<string>('9.00'); // Altezza interna
  const [tegD, setTegD] = useState<string>('24.00'); // Lunghezza max
  const [tegH, setTegH] = useState<string>('5.00'); // Sbraccio
  const [tegQI, setTegQI] = useState<string>('6.60'); // QI
  const [tegHalfD, setTegHalfD] = useState<number>(0);
  const [tegResH, setTegResH] = useState<string>('--');
  const [tegResW, setTegResW] = useState<string>('--');

  // --- STATI CAPRIATA ---
  const [capA, setCapA] = useState<string>('10.00'); // Altezza interna
  const [capB, setCapB] = useState<string>('1.70');  // Colmo
  const [capC, setCapC] = useState<string>('15.20'); // h a 45 (imbracatura)
  const [capH, setCapH] = useState<string>('5.00');  // Sbraccio
  const [capL, setCapL] = useState<string>('19.20'); // Lunghezza trave
  const [capQI, setCapQI] = useState<string>('6.25'); // QI
  const [capResH, setCapResH] = useState<string>('--');
  const [capResW, setCapResW] = useState<string>('--');

  // --- STATI COSTI ---
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isXL, setIsXL] = useState<Record<string, boolean>>({});
  const [manualOffset, setManualOffset] = useState<string>('0');
  const [platOffset, setPlatOffset] = useState<string>('0');
  const [surface, setSurface] = useState<string>('');
  const [dailyCraneCost, setDailyCraneCost] = useState<string>('2650');
  const [dailyPlatformCost, setDailyPlatformCost] = useState<string>('200');

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('montaggioData');
    if (saved) {
        try {
            const d = JSON.parse(saved);
            if(d.tegA) setTegA(d.tegA);
            if(d.tegD) setTegD(d.tegD);
            if(d.tegH) setTegH(d.tegH);
            if(d.tegQI) setTegQI(d.tegQI);
            if(d.capA) setCapA(d.capA);
            if(d.capB) setCapB(d.capB);
            if(d.capC) setCapC(d.capC);
            if(d.capH) setCapH(d.capH);
            if(d.capL) setCapL(d.capL);
            if(d.capQI) setCapQI(d.capQI);
            if(d.quantities) setQuantities(d.quantities);
            if(d.isXL) setIsXL(d.isXL);
            if(d.manualOffset) setManualOffset(d.manualOffset);
            if(d.platOffset) setPlatOffset(d.platOffset);
            if(d.surface) setSurface(d.surface);
            if(d.notes) setNotes(d.notes);
            if(d.dailyCraneCost) setDailyCraneCost(d.dailyCraneCost);
            if(d.dailyPlatformCost) setDailyPlatformCost(d.dailyPlatformCost);
        } catch(e) {}
    }
  }, []);

  const handleSave = () => {
      const data = { 
        tegA, tegD, tegH, tegQI, 
        capA, capB, capC, capH, capL, capQI, 
        quantities, isXL, manualOffset, platOffset, surface, notes,
        dailyCraneCost, dailyPlatformCost 
      };
      localStorage.setItem('montaggioData', JSON.stringify(data));
      showToast('Dati salvati!');
  };

  const handleReset = () => {
      if (window.confirm("Sei sicuro di voler resettare tutti i dati di questa sezione? Le quantità e i costi personalizzati verranno persi.")) {
          localStorage.removeItem('montaggioData');
          // Ripristino valori default
          setTegA('9.00'); setTegD('24.00'); setTegH('5.00'); setTegQI('6.60');
          setCapA('10.00'); setCapB('1.70'); setCapC('15.20'); setCapH('5.00'); setCapL('19.20'); setCapQI('6.25');
          setQuantities({});
          setIsXL({});
          setManualOffset('0');
          setPlatOffset('0');
          setSurface('');
          setNotes('');
          setDailyCraneCost('2650');
          setDailyPlatformCost('200');
          
          showToast('Dati ripristinati ai valori di fabbrica');
      }
  };

  const handleShare = async () => {
      let text = 'Report Montaggio\n';
      if(mode === 'tegolo') text += `Tegolo Alare: H=${tegResH}m, Peso=${tegResW} QI`;
      else if(mode === 'capriata') text += `Capriata: H=${capResH}m, Peso=${capResW} QI`;
      else text += `Costi: Totale € ${costResults.total.toLocaleString()} - ${costResults.days}gg`;
      
      if (navigator.share) {
          try { await navigator.share({ title: 'Montaggio', text }); } catch {}
      } else {
          navigator.clipboard.writeText(text);
          showToast('Copiato negli appunti');
      }
  };

  // Calcolo Tegolo
  useEffect(() => {
    const a = parseFloat(tegA) || 0;
    const d = parseFloat(tegD) || 0;
    const h = parseFloat(tegH) || 0;
    const qi = parseFloat(tegQI) || 0;

    const dMezzi = d / 2;
    setTegHalfD(dMezzi);

    const totH = a + dMezzi + h;
    setTegResH(totH.toFixed(2));

    const totW = d * qi;
    setTegResW(totW.toFixed(1).replace('.', ','));
  }, [tegA, tegD, tegH, tegQI]);

  // Calcolo Capriata
  useEffect(() => {
    const a = parseFloat(capA) || 0;
    const b = parseFloat(capB) || 0;
    const c = parseFloat(capC) || 0;
    const h = parseFloat(capH) || 0;
    const l = parseFloat(capL) || 0;
    const qi = parseFloat(capQI) || 0;

    // Formula Immagine: A + B + C + H
    const totH = a + b + c + h;
    setCapResH(totH.toFixed(2));

    // Formula Peso: Lunghezza * QI
    const totW = l * qi;
    setCapResW(totW.toFixed(0)); // Nell'immagine è intero (120), ma usiamo toFixed(0) o (1)
  }, [capA, capB, capC, capH, capL, capQI]);

  // Calcolo Costi
  const costResults = useMemo(() => {
    let totalRawDays = 0;
    let totalPieces = 0;
    
    MOUNTING_DATA.forEach(item => {
      const qty = quantities[item.id] || 0;
      if (qty > 0) {
        totalPieces += qty;
        const rate = isXL[item.id] ? item.rateXL : item.rateStd;
        totalRawDays += qty / rate;
      }
    });

    // Arrotondamento per eccesso alla mezza giornata
    const roundedDays = Math.ceil(totalRawDays * 2) / 2;
    
    // Giorni Finali con aggiustamenti
    const finalCraneDays = Math.max(0, roundedDays + (parseFloat(manualOffset) || 0));
    // Giorni piattaforma = giorni gru + offset specifico
    const finalPlatDays = Math.max(0, finalCraneDays + (parseFloat(platOffset) || 0));

    // Media elementi al giorno
    const avgElementsPerDay = finalCraneDays > 0 ? totalPieces / finalCraneDays : 0;

    // Tariffe
    const dailyCrane = parseFloat(dailyCraneCost) || 0;
    const dailyPlatform = parseFloat(dailyPlatformCost) || 0;
    const dailyTravel = 250; // Onere trasferta (fisso per ora o si potrebbe rendere editabile)
    
    // Calcolo Totali
    const costCrane = finalCraneDays * dailyCrane;
    const costPlatform = finalPlatDays * dailyPlatform;
    const costTravel = finalCraneDays * dailyTravel; // La trasferta segue i giorni della squadra/gru
    
    // Trasferta/Setup (1 giorno extra andata/ritorno dei mezzi)
    // Nota: questo è il costo fisso di mobilitazione, basato sulle tariffe giornaliere
    const costSetup = dailyCrane + dailyPlatform;

    const totalCost = costCrane + costPlatform + costTravel + costSetup;
    
    const surfVal = parseFloat(surface) || 0;
    const costPerSqm = surfVal > 0 ? totalCost / surfVal : 0;

    // Percentuali per grafico
    const pCrane = totalCost > 0 ? (costCrane / totalCost) * 100 : 0;
    const pPlat = totalCost > 0 ? (costPlatform / totalCost) * 100 : 0;
    const pTravel = totalCost > 0 ? ((costTravel + costSetup) / totalCost) * 100 : 0;

    return {
      days: finalCraneDays,
      platDays: finalPlatDays,
      crane: costCrane,
      plat: costPlatform,
      travel: costTravel,
      setup: costSetup,
      total: totalCost,
      perSqm: costPerSqm,
      avgEl: avgElementsPerDay,
      chart: { pCrane, pPlat, pTravel },
      rates: { dailyCrane, dailyPlatform, dailyTravel }
    };
  }, [quantities, isXL, manualOffset, platOffset, surface, dailyCraneCost, dailyPlatformCost]);

  const updateQty = (id: string, val: string) => {
    const v = parseInt(val) || 0;
    setQuantities(prev => ({...prev, [id]: v}));
  };

  const toggleXL = (id: string) => {
    setIsXL(prev => ({...prev, [id]: !prev[id]}));
  };

  const copy = (t: string) => {
    navigator.clipboard.writeText(t);
    showToast('Copiato!');
  };

  const categories = Array.from(new Set(MOUNTING_DATA.map(d => d.cat)));

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-slide-in">
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 no-print">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="bg-orange-500/20 w-10 h-10 rounded-xl flex items-center justify-center text-orange-500 border border-orange-500/20">
            <i className="fa-solid fa-screwdriver-wrench"></i>
          </span>
          Calcolo Montaggio
        </h2>
        
        {/* Tab Switcher */}
        <div className="flex gap-2">
            <div className="bg-black/20 p-1 rounded-xl flex border border-white/10 overflow-x-auto max-w-full">
                <button 
                    onClick={() => setMode('tegolo')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all whitespace-nowrap ${mode === 'tegolo' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                    Alare
                </button>
                <button 
                    onClick={() => setMode('capriata')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all whitespace-nowrap ${mode === 'capriata' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                    Capriata
                </button>
                <button 
                    onClick={() => setMode('costi')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all whitespace-nowrap ${mode === 'costi' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                    Costo Montaggio
                </button>
            </div>
        </div>
      </div>

       <div className="flex justify-end gap-2 mb-2 no-print">
          <button onClick={handleReset} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm font-bold transition-colors border border-red-500/10 flex items-center gap-2"><i className="fa-solid fa-rotate-right"></i> Reset</button>
          <button onClick={handleSave} className="bg-white/10 hover:bg-white/20 text-slate-300 px-4 py-2 rounded-lg text-sm font-bold transition-colors border border-white/5 flex items-center gap-2"><i className="fa-solid fa-floppy-disk"></i> Salva</button>
          <button onClick={handleShare} className="bg-white/10 hover:bg-white/20 text-slate-300 px-4 py-2 rounded-lg text-sm font-bold transition-colors border border-white/5 flex items-center gap-2"><i className="fa-solid fa-share-nodes"></i> Condividi</button>
          <button onClick={() => window.print()} className="bg-white/10 hover:bg-white/20 text-slate-300 px-4 py-2 rounded-lg text-sm font-bold transition-colors border border-white/5 flex items-center gap-2"><i className="fa-solid fa-print"></i> Stampa</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        
        {/* === ALARE SECTION === */}
        {mode === 'tegolo' && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in print-full-width">
            <div className="glass-panel rounded-2xl p-6 lg:p-8 space-y-6 print-break-inside">
                <h3 className="text-lg font-bold text-white mb-4 border-b border-white/5 pb-2">Parametri Alare</h3>
                <div className="space-y-5">
                    <div className="relative group">
                        <label className="flex justify-between text-[11px] text-orange-400 font-bold uppercase tracking-wider mb-2 ml-1"><span>A - Altezza Interna (m)</span></label>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-500/20 text-orange-500 flex items-center justify-center font-bold border border-orange-500/30">A</div>
                            <input type="number" value={tegA} onChange={(e) => setTegA(e.target.value)} className="w-full glass-input rounded-xl p-3 text-white font-mono text-lg outline-none focus:border-orange-500/50"/>
                        </div>
                    </div>
                    <div className="relative group">
                        <label className="flex justify-between text-[11px] text-cyan-400 font-bold uppercase tracking-wider mb-2 ml-1"><span>D - Lunghezza Max (m)</span></label>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 text-cyan-500 flex items-center justify-center font-bold border border-cyan-500/30">D</div>
                            <input type="number" value={tegD} onChange={(e) => setTegD(e.target.value)} className="w-full glass-input rounded-xl p-3 text-white font-mono text-lg outline-none focus:border-cyan-500/50"/>
                        </div>
                    </div>
                    <div className="relative group">
                        <label className="flex justify-between text-[11px] text-purple-400 font-bold uppercase tracking-wider mb-2 ml-1"><span>H Braccio / Sbraccio (m)</span></label>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-500 flex items-center justify-center font-bold border border-purple-500/30">H</div>
                            <input type="number" value={tegH} onChange={(e) => setTegH(e.target.value)} className="w-full glass-input rounded-xl p-3 text-white font-mono text-lg outline-none focus:border-purple-500/50"/>
                        </div>
                    </div>
                </div>
                <div className="mt-8 pt-6 border-t border-white/5">
                    <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-2 block ml-1">Coefficiente Peso (QI)</label>
                    <div className="flex items-center gap-3">
                        <input type="number" value={tegQI} onChange={(e) => setTegQI(e.target.value)} className="w-full bg-slate-900/40 border border-white/10 rounded-xl p-3 text-slate-300 font-mono text-center outline-none"/>
                        <span className="text-sm font-bold text-slate-500">QI</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-6 print-break-inside">
                {/* SVG Tegolo */}
                <div className="glass-panel rounded-2xl p-6 relative flex items-center justify-center bg-gradient-to-b from-slate-800/30 to-slate-900/30 min-h-[250px]">
                    <svg viewBox="0 0 400 250" className="w-full h-full drop-shadow-lg">
                        <rect x="50" y="150" width="20" height="80" fill="#334155" stroke="#475569" strokeWidth="1" />
                        <rect x="330" y="150" width="20" height="80" fill="#334155" stroke="#475569" strokeWidth="1" />
                        <line x1="20" y1="230" x2="380" y2="230" stroke="#475569" strokeWidth="2" />
                        <path d="M40 150 L200 50 L360 150" fill="none" stroke="#e2e8f0" strokeWidth="2" />
                        <line x1="40" y1="150" x2="360" y2="150" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
                        <line x1="40" y1="230" x2="40" y2="150" stroke="#fb923c" strokeWidth="1" markerEnd="url(#arrow)" />
                        <text x="30" y="190" fill="#fb923c" fontSize="12" fontWeight="bold" textAnchor="end">A</text>
                        <line x1="40" y1="40" x2="360" y2="40" stroke="#22d3ee" strokeWidth="1" />
                        <line x1="40" y1="35" x2="40" y2="45" stroke="#22d3ee" strokeWidth="1" />
                        <line x1="360" y1="35" x2="360" y2="45" stroke="#22d3ee" strokeWidth="1" />
                        {/* Spostato a sinistra per evitare sovrapposizione */}
                        <text x="100" y="30" fill="#22d3ee" fontSize="12" fontWeight="bold" textAnchor="middle">Lunghezza Max (D)</text>
                        
                        <line x1="200" y1="50" x2="200" y2="10" stroke="#c084fc" strokeWidth="2" strokeDasharray="4 2" />
                        <circle cx="200" cy="10" r="4" fill="#c084fc" />
                        <text x="210" y="20" fill="#c084fc" fontSize="10" fontWeight="bold">H Braccio</text>
                    </svg>
                </div>

                {/* Risultati Tegolo */}
                <div className="glass-panel rounded-2xl p-0 overflow-hidden border border-white/10">
                    <div className="bg-white/5 p-4 border-b border-white/5">
                        <h4 className="text-xs text-slate-400 font-bold uppercase tracking-widest text-center">Formula Altezza (A + D/2 + H)</h4>
                        <div className="flex justify-center items-center gap-2 mt-2 text-sm font-mono text-slate-300">
                            <span className="text-orange-400">{parseFloat(tegA).toFixed(2)}</span> + 
                            <span className="text-cyan-400">{tegHalfD.toFixed(2)}</span> + 
                            <span className="text-purple-400">{parseFloat(tegH).toFixed(2)}</span> =
                        </div>
                    </div>
                    <div className="p-6 bg-black/20 text-center cursor-pointer hover:bg-black/30 transition-colors" onClick={() => copy(tegResH)}>
                        <div className="text-4xl font-bold text-white flex justify-center items-center gap-3">
                            {tegResH} <span className="text-lg text-slate-500 font-sans">m</span>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5 flex items-center justify-between cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => copy(tegResW)}>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Peso (D × QI)</div>
                    <div className="text-2xl font-bold text-emerald-400 font-mono">{tegResW} <span className="text-sm text-emerald-600">QI</span></div>
                </div>
            </div>
           </div>
        )}

        {/* === CAPRIATA SECTION === */}
        {mode === 'capriata' && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in print-full-width">
            <div className="glass-panel rounded-2xl p-6 lg:p-8 space-y-6 print-break-inside">
                <h3 className="text-lg font-bold text-white mb-4 border-b border-white/5 pb-2">Parametri Capriata</h3>
                <div className="space-y-4">
                    <div className="relative group">
                        <label className="flex justify-between text-[11px] text-orange-400 font-bold uppercase tracking-wider mb-2 ml-1"><span>A - Altezza Interna (m)</span></label>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-500/20 text-orange-500 flex items-center justify-center font-bold border border-orange-500/30">A</div>
                            <input type="number" value={capA} onChange={(e) => setCapA(e.target.value)} className="w-full glass-input rounded-xl p-3 text-white font-mono text-lg outline-none focus:border-orange-500/50"/>
                        </div>
                    </div>
                    <div className="relative group">
                        <label className="flex justify-between text-[11px] text-yellow-400 font-bold uppercase tracking-wider mb-2 ml-1"><span>B - Colmo (m)</span></label>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 text-yellow-500 flex items-center justify-center font-bold border border-yellow-500/30">B</div>
                            <input type="number" value={capB} onChange={(e) => setCapB(e.target.value)} className="w-full glass-input rounded-xl p-3 text-white font-mono text-lg outline-none focus:border-yellow-500/50"/>
                        </div>
                    </div>
                    <div className="relative group">
                        <label className="flex justify-between text-[11px] text-cyan-400 font-bold uppercase tracking-wider mb-2 ml-1"><span>C - h a 45° (m)</span></label>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 text-cyan-500 flex items-center justify-center font-bold border border-cyan-500/30">C</div>
                            <input type="number" value={capC} onChange={(e) => setCapC(e.target.value)} className="w-full glass-input rounded-xl p-3 text-white font-mono text-lg outline-none focus:border-cyan-500/50"/>
                        </div>
                    </div>
                    <div className="relative group">
                        <label className="flex justify-between text-[11px] text-purple-400 font-bold uppercase tracking-wider mb-2 ml-1"><span>H Braccio / Sbraccio (m)</span></label>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-500 flex items-center justify-center font-bold border border-purple-500/30">H</div>
                            <input type="number" value={capH} onChange={(e) => setCapH(e.target.value)} className="w-full glass-input rounded-xl p-3 text-white font-mono text-lg outline-none focus:border-purple-500/50"/>
                        </div>
                    </div>
                </div>
                <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-2 block ml-1">Lunghezza Trave</label>
                        <input type="number" value={capL} onChange={(e) => setCapL(e.target.value)} className="w-full bg-slate-900/40 border border-white/10 rounded-xl p-3 text-slate-300 font-mono text-center outline-none"/>
                    </div>
                    <div>
                        <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-2 block ml-1">Coefficiente (QI)</label>
                        <input type="number" value={capQI} onChange={(e) => setCapQI(e.target.value)} className="w-full bg-slate-900/40 border border-white/10 rounded-xl p-3 text-slate-300 font-mono text-center outline-none"/>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-6 print-break-inside">
                {/* SVG Capriata */}
                <div className="glass-panel rounded-2xl p-6 relative flex items-center justify-center bg-gradient-to-b from-slate-800/30 to-slate-900/30 min-h-[250px]">
                    <svg viewBox="0 0 400 250" className="w-full h-full drop-shadow-lg">
                        {/* Pilastri */}
                        <rect x="50" y="150" width="20" height="80" fill="#334155" stroke="#475569" strokeWidth="1" />
                        <rect x="330" y="150" width="20" height="80" fill="#334155" stroke="#475569" strokeWidth="1" />
                        <line x1="20" y1="230" x2="380" y2="230" stroke="#475569" strokeWidth="2" />
                        {/* A */}
                        <line x1="40" y1="230" x2="40" y2="150" stroke="#fb923c" strokeWidth="1" markerEnd="url(#arrow)" />
                        <text x="30" y="190" fill="#fb923c" fontSize="12" fontWeight="bold" textAnchor="end">A</text>
                        {/* Trave Capriata */}
                        <path d="M50 150 L200 130 L350 150" fill="none" stroke="#e2e8f0" strokeWidth="2" />
                        <line x1="50" y1="150" x2="350" y2="150" stroke="#e2e8f0" strokeWidth="1" />
                        {/* B (Colmo) */}
                        <line x1="200" y1="130" x2="200" y2="150" stroke="#facc15" strokeWidth="2" />
                        <text x="205" y="145" fill="#facc15" fontSize="10" fontWeight="bold">B</text>
                        {/* Rigging (C) */}
                        <line x1="80" y1="145" x2="200" y2="50" stroke="#22d3ee" strokeWidth="1" />
                        <line x1="320" y1="145" x2="200" y2="50" stroke="#22d3ee" strokeWidth="1" />
                        <line x1="200" y1="130" x2="200" y2="50" stroke="#22d3ee" strokeWidth="1" strokeDasharray="2 2" />
                        <text x="190" y="90" fill="#22d3ee" fontSize="10" fontWeight="bold" textAnchor="end">C</text>
                        {/* Crane H */}
                        <line x1="200" y1="50" x2="200" y2="10" stroke="#c084fc" strokeWidth="2" strokeDasharray="4 2" />
                        <circle cx="200" cy="10" r="4" fill="#c084fc" />
                        <text x="210" y="25" fill="#c084fc" fontSize="10" fontWeight="bold">H</text>
                    </svg>
                </div>

                {/* Risultati Capriata */}
                <div className="glass-panel rounded-2xl p-0 overflow-hidden border border-white/10">
                    <div className="bg-white/5 p-4 border-b border-white/5">
                        <h4 className="text-xs text-slate-400 font-bold uppercase tracking-widest text-center">Formula Altezza (A + B + C + H)</h4>
                        <div className="flex justify-center items-center gap-2 mt-2 text-sm font-mono text-slate-300 flex-wrap">
                            <span className="text-orange-400 bg-orange-500/10 px-1 rounded">{parseFloat(capA).toFixed(2)}</span> + 
                            <span className="text-yellow-400 bg-yellow-500/10 px-1 rounded">{parseFloat(capB).toFixed(2)}</span> + 
                            <span className="text-cyan-400 bg-cyan-500/10 px-1 rounded">{parseFloat(capC).toFixed(2)}</span> + 
                            <span className="text-purple-400 bg-purple-500/10 px-1 rounded">{parseFloat(capH).toFixed(2)}</span>
                        </div>
                    </div>
                    <div className="p-6 bg-black/20 text-center cursor-pointer hover:bg-black/30 transition-colors" onClick={() => copy(capResH)}>
                        <div className="text-4xl font-bold text-white flex justify-center items-center gap-3">
                            {capResH} <span className="text-lg text-slate-500 font-sans">m</span>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5 flex items-center justify-between cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => copy(capResW)}>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Peso (L. Trave × QI)</div>
                    <div className="text-2xl font-bold text-emerald-400 font-mono">{capResW} <span className="text-sm text-emerald-600">QI</span></div>
                </div>
            </div>
           </div>
        )}

        {/* === PREVENTIVO COSTI SECTION === */}
        {mode === 'costi' && (
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in print-full-width">
             <div className="lg:col-span-8 space-y-8">
               
               {/* Categories Input */}
               {categories.map(cat => (
                 <div key={cat} className="glass-panel rounded-2xl p-6 print-break-inside">
                    <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                       {cat === 'Fondazioni' && <i className="fa-solid fa-shapes"></i>}
                       {cat === 'Verticali' && <i className="fa-solid fa-up-long"></i>}
                       {cat === 'Pareti' && <i className="fa-solid fa-border-all"></i>}
                       {cat === 'Orizzontali' && <i className="fa-solid fa-bars"></i>}
                       {cat === 'Copertura' && <i className="fa-solid fa-house-chimney-window"></i>}
                       {cat === 'Accessori' && <i className="fa-solid fa-puzzle-piece"></i>}
                       {cat === 'Esterni' && <i className="fa-solid fa-tree"></i>}
                       {cat}
                    </h3>
                    <div className="space-y-4">
                       {MOUNTING_DATA.filter(i => i.cat === cat).map(item => (
                         <div key={item.id} className="grid grid-cols-12 gap-4 items-center bg-white/5 p-3 rounded-xl border border-white/5">
                            <div className="col-span-5 md:col-span-5">
                               <div className="font-bold text-white text-sm">{item.name}</div>
                               <div className="text-[10px] text-slate-400">{item.detail}</div>
                               {item.threshold !== '-' && <div className="text-[10px] text-orange-400 font-mono mt-1">XL: {item.threshold}</div>}
                            </div>
                            <div className="col-span-3 md:col-span-4 text-[10px] text-slate-500 leading-tight hidden md:block border-l border-white/10 pl-3 no-print">
                                <span className="block text-slate-400 mb-1">Criticità:</span> {item.crit}
                            </div>
                            <div className="col-span-4 md:col-span-2">
                               <input 
                                 type="number" 
                                 min="0"
                                 placeholder="Q.tà"
                                 value={quantities[item.id] || ''}
                                 onChange={(e) => updateQty(item.id, e.target.value)}
                                 className="w-full glass-input p-2 rounded-lg text-center text-white font-bold"
                               />
                            </div>
                            <div className="col-span-3 md:col-span-1 flex flex-col items-center justify-center no-print">
                               <label className="text-[9px] uppercase font-bold text-slate-500 mb-1">XL</label>
                               <div 
                                 onClick={() => toggleXL(item.id)}
                                 className={`w-10 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${isXL[item.id] ? 'bg-orange-500' : 'bg-slate-700'}`}
                               >
                                 <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${isXL[item.id] ? 'translate-x-4' : 'translate-x-0'}`}></div>
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
               ))}
             </div>

             <div className="lg:col-span-4 space-y-6">
                <div className="glass-panel rounded-2xl p-6 sticky top-24 border-t-4 border-emerald-500 print-break-inside">
                   <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <i className="fa-solid fa-cash-register text-emerald-500"></i> Totale Costo Montaggio
                   </h3>
                   
                   <div className="space-y-4 mb-6 no-print">
                       {/* Input Superficie Totale */}
                       <div className="mb-6">
                           <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 block">Superficie Totale (m²)</label>
                           <input 
                               type="number" 
                               value={surface} 
                               onChange={(e) => setSurface(e.target.value)} 
                               placeholder="0.00" 
                               className="w-full glass-input rounded-xl p-3 text-white font-bold text-center outline-none border border-white/10 focus:border-emerald-500/50"
                           />
                       </div>

                        {/* Parametri Economici */}
                        <div className="mb-6 border-t border-white/5 pt-4">
                            <label className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider mb-3 block">Parametri Economici</label>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div>
                                    <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1 block">Tariffa Gru €/gg</label>
                                    <input 
                                        type="number"
                                        placeholder="2650"
                                        value={dailyCraneCost} 
                                        onChange={(e) => setDailyCraneCost(e.target.value)} 
                                        className="w-full bg-slate-800/50 rounded-lg p-2 text-white text-xs text-center border border-white/5 focus:border-emerald-500/50 outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1 block">Tariffa Piattaf. €/gg</label>
                                    <input 
                                        type="number"
                                        placeholder="200"
                                        value={dailyPlatformCost} 
                                        onChange={(e) => setDailyPlatformCost(e.target.value)} 
                                        className="w-full bg-slate-800/50 rounded-lg p-2 text-white text-xs text-center border border-white/5 focus:border-emerald-500/50 outline-none transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                       {/* Input Adjustments */}
                       <div className="grid grid-cols-2 gap-3 mb-4">
                           <div>
                               <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1 block">Adj Giorni</label>
                               <input 
                                   type="number"
                                   step="0.5"
                                   placeholder="+/-" 
                                   value={manualOffset} 
                                   onChange={(e) => setManualOffset(e.target.value)} 
                                   className="w-full bg-slate-800/50 rounded-lg p-2 text-white text-xs text-center border border-white/5 focus:border-emerald-500/50 outline-none transition-colors"
                               />
                           </div>
                           <div>
                               <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1 block">Adj Piattaf.</label>
                               <input 
                                   type="number"
                                   step="0.5" 
                                   placeholder="+/-"
                                   value={platOffset} 
                                   onChange={(e) => setPlatOffset(e.target.value)} 
                                   className="w-full bg-slate-800/50 rounded-lg p-2 text-white text-xs text-center border border-white/5 focus:border-emerald-500/50 outline-none transition-colors"
                               />
                           </div>
                       </div>
                   </div>

                    {/* Cost Breakdown Visual */}
                   <div className="mb-6 no-print">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 block">Analisi Costi</label>
                        <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden flex">
                            <div className="bg-emerald-500 h-full" style={{width: `${costResults.chart.pCrane}%`}} title="Gru & Squadra"></div>
                            <div className="bg-blue-500 h-full" style={{width: `${costResults.chart.pPlat}%`}} title="Piattaforme"></div>
                            <div className="bg-orange-500 h-full" style={{width: `${costResults.chart.pTravel}%`}} title="Trasferta & Setup"></div>
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-500 mt-1 uppercase font-bold">
                            <span className="text-emerald-500">Squadra {costResults.chart.pCrane.toFixed(0)}%</span>
                            <span className="text-blue-500">Mezzi {costResults.chart.pPlat.toFixed(0)}%</span>
                            <span className="text-orange-500">Logistica {costResults.chart.pTravel.toFixed(0)}%</span>
                        </div>
                   </div>
                   
                   <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                         <span className="text-sm text-slate-300">Giorni Lavoro</span>
                         <span className="text-xl font-mono font-bold text-white">{costResults.days} gg</span>
                      </div>
                      <div className="h-px bg-white/10 my-2"></div>
                      <div className="flex justify-between items-center">
                         <span className="text-xs text-slate-400 uppercase tracking-wider">Gru ({costResults.rates.dailyCrane}€/gg)</span>
                         <span className="font-mono text-slate-200">€ {costResults.crane.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-xs text-slate-400 uppercase tracking-wider">Piattaforme ({costResults.platDays}gg)</span>
                         <span className="font-mono text-slate-200">€ {costResults.plat.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-xs text-slate-400 uppercase tracking-wider">Trasferta ({costResults.rates.dailyTravel}€/gg)</span>
                         <span className="font-mono text-slate-200">€ {costResults.travel.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-xs text-orange-400 uppercase tracking-wider">Setup (A/R) +1gg</span>
                         <span className="font-mono text-orange-400">€ {costResults.setup.toLocaleString()}</span>
                      </div>
                   </div>

                   <div className="bg-gradient-to-br from-emerald-900/50 to-slate-900/50 p-6 rounded-xl border border-emerald-500/30 text-center cursor-pointer hover:scale-[1.02] transition-transform mt-6" onClick={() => copy(costResults.total.toString())}>
                      <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Costo Totale Stimato</div>
                      <div className="text-3xl font-bold text-white font-mono">€ {costResults.total.toLocaleString()}</div>
                   </div>

                   {/* Costo al Metro Quadro & Media Elementi */}
                   <div className="mt-4 grid grid-cols-2 gap-3">
                       <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                           <div className="text-[9px] text-slate-400 uppercase tracking-widest mb-1">Media Pz/Gg</div>
                           <div className="text-lg font-bold text-orange-400 font-mono">{costResults.avgEl.toFixed(1)}</div>
                       </div>
                       <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                           <div className="text-[9px] text-slate-400 uppercase tracking-widest mb-1">Costo al m²</div>
                           <div className="text-lg font-bold text-cyan-400 font-mono">€ {costResults.perSqm.toFixed(2)}</div>
                       </div>
                   </div>
                   
                   {/* Note di Cantiere */}
                   <div className="mt-4 no-print">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 block">Note di Cantiere</label>
                        <textarea 
                            value={notes} 
                            onChange={(e) => setNotes(e.target.value)} 
                            className="w-full glass-input rounded-xl p-3 text-sm text-white outline-none min-h-[100px]"
                            placeholder="Inserisci dettagli, limitazioni di accesso, orari..."
                        ></textarea>
                   </div>
                   {/* Visualizzazione Note solo in Stampa */}
                   {notes && (
                       <div className="hidden print:block mt-6 p-4 border border-slate-300 rounded-xl bg-slate-50">
                           <h4 className="font-bold text-sm uppercase mb-2">Note di Cantiere</h4>
                           <p className="text-sm whitespace-pre-wrap">{notes}</p>
                       </div>
                   )}
                </div>
             </div>

             {/* Tabella Rese Espandibile */}
             <div className="lg:col-span-12 mt-4 no-print">
                <button 
                    onClick={() => setShowRates(!showRates)} 
                    className="w-full glass-panel p-4 flex items-center justify-between text-slate-400 hover:text-white hover:bg-white/5 transition-all rounded-xl"
                >
                    <span className="font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                        <i className="fa-solid fa-table-list"></i> Tabella Rese Riferimento (Pezzi/Giorno)
                    </span>
                    <i className={`fa-solid fa-chevron-down transition-transform duration-300 ${showRates ? 'rotate-180' : ''}`}></i>
                </button>

                {showRates && (
                    <div className="glass-panel mt-4 p-6 rounded-2xl animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categories.map(cat => (
                                <div key={cat} className="space-y-2">
                                    <h4 className="text-xs font-bold text-emerald-500 uppercase border-b border-white/5 pb-1 mb-2">{cat}</h4>
                                    {MOUNTING_DATA.filter(d => d.cat === cat).map(item => (
                                        <div key={item.id} className="flex justify-between items-center text-xs">
                                            <span className="text-slate-300">{item.name}</span>
                                            <div className="flex gap-3 font-mono">
                                                <span className="text-slate-500" title="Standard">Std: <span className="text-white">{item.rateStd}</span></span>
                                                <span className="text-slate-500" title="XL">XL: <span className="text-orange-400">{item.rateXL}</span></span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
             </div>
           </div>
        )}

      </div>
    </div>
  );
}