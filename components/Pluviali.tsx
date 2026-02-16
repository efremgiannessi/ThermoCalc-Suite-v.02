
import { useState, useEffect } from 'react';
import { CloudRain, ArrowDown, Droplets, Umbrella, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

interface Props {
  showToast: (msg: string) => void;
}

interface PipeData {
    dn: number;
    label: string;
    capacity: number; // l/s
    count: number;
    utilization: number;
}

const RAIN_PRESETS = [
    { label: 'Standard (UNI EN)', val: 100, desc: 'Pioggia Forte' },
    { label: 'Severo', val: 140, desc: 'Nubifragio' },
    { label: 'Estremo', val: 200, desc: 'Alluvionale' },
    { label: 'Nord Italia', val: 120, desc: 'Media Nord' },
    { label: 'Sud Italia', val: 90, desc: 'Media Sud' }
];

const COEFF_PRESETS = [
    { label: 'Impermeabile (Guaina/Lamiera)', val: 1.0 },
    { label: 'Tegole / Coppi', val: 0.9 },
    { label: 'Ghiaia / Tetto Verde Estens.', val: 0.7 },
    { label: 'Giardino Pensile Intens.', val: 0.5 }
];

// Capacità di scarico approssimativa per pluviali verticali (riempimento 33% per sicurezza o tabellare)
// Valori in litri/secondo
const PIPE_SIZES = [
    { dn: 60, cap: 2.1 },
    { dn: 80, cap: 4.8 },
    { dn: 100, cap: 8.5 },
    { dn: 120, cap: 13.2 },
    { dn: 140, cap: 19.5 },
    { dn: 160, cap: 26.0 }
];

export default function Pluviali({ showToast }: Props) {
  const [area, setArea] = useState<string>('');
  const [intensity, setIntensity] = useState<string>('120');
  const [coeff, setCoeff] = useState<string>('1.0');
  
  const [totalFlowLs, setTotalFlowLs] = useState<number>(0);
  const [totalFlowLmin, setTotalFlowLmin] = useState<number>(0);
  const [results, setResults] = useState<PipeData[]>([]);
  const [gutterSize, setGutterSize] = useState<string>('--');

  useEffect(() => {
    const A = parseFloat(area) || 0;
    const I = parseFloat(intensity) || 0;
    const C = parseFloat(coeff) || 1.0;

    if (A > 0 && I > 0) {
        // Q (l/s) = (A * I * C) / 3600
        const q_ls = (A * I * C) / 3600;
        const q_lmin = q_ls * 60;
        
        setTotalFlowLs(q_ls);
        setTotalFlowLmin(q_lmin);

        // Calculate pipes
        const pipeResults: PipeData[] = PIPE_SIZES.map(pipe => {
            const count = Math.ceil(q_ls / pipe.cap);
            const actualCap = count * pipe.cap;
            const util = (q_ls / actualCap) * 100;
            return {
                dn: pipe.dn,
                label: `DN ${pipe.dn}`,
                capacity: pipe.cap,
                count: Math.max(1, count), // Minimo 1 anche se flusso basso
                utilization: util
            };
        });
        setResults(pipeResults);

        // Estimate Gutter Size (Sviluppo) based on flow per meter approx
        // Sviluppo 25cm (D100), 33cm (D125), 40cm, 50cm
        // Empirica
        let gSize = '25 cm';
        if (q_ls > 5) gSize = '33 cm';
        if (q_ls > 12) gSize = '40 cm';
        if (q_ls > 20) gSize = '50 cm';
        if (q_ls > 40) gSize = '60+ cm';
        setGutterSize(gSize);

    } else {
        setTotalFlowLs(0);
        setTotalFlowLmin(0);
        setResults([]);
        setGutterSize('--');
    }
  }, [area, intensity, coeff]);

  const copy = (t: string) => {
    navigator.clipboard.writeText(t);
    showToast('Copiato!');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-slide-in">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 no-print">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="bg-blue-500/20 w-10 h-10 rounded-xl flex items-center justify-center text-blue-500 border border-blue-500/20">
                    <CloudRain size={20} />
                </span>
                Sistemi di Drenaggio
            </h2>
            <div className="bg-blue-900/20 px-3 py-1 rounded-lg border border-blue-500/20 text-[10px] text-blue-300 font-mono">
                UNI EN 12056-3
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* INPUT PANEL */}
            <div className="lg:col-span-4 space-y-6">
                <div className="glass-panel rounded-2xl p-6 border-blue-500/10">
                    <h3 className="text-sm font-bold text-blue-500 uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Dati Copertura</h3>
                    
                    <div className="space-y-5">
                        <div className="relative group">
                            <label className="industrial-label">Superficie in Pianta (A)</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    value={area} 
                                    onChange={e=>setArea(e.target.value)} 
                                    className="w-full glass-input rounded-xl p-3 pl-4 text-white font-mono text-xl outline-none focus:border-blue-500/50" 
                                    placeholder="0"
                                />
                                <span className="absolute right-4 top-3.5 text-xs text-slate-500 font-bold">m²</span>
                            </div>
                        </div>

                        <div>
                            <label className="industrial-label">Intensità Pioggia (I)</label>
                            <select 
                                value={intensity} 
                                onChange={e=>setIntensity(e.target.value)} 
                                className="w-full glass-input rounded-xl p-3 text-white outline-none cursor-pointer text-xs mb-2"
                            >
                                {RAIN_PRESETS.map(p => (
                                    <option key={p.val} value={p.val} className="bg-app-panel">{p.label} - {p.val} mm/h</option>
                                ))}
                                <option value="custom" className="bg-app-panel">Manuale...</option>
                            </select>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    value={intensity} 
                                    onChange={e=>setIntensity(e.target.value)} 
                                    className="w-full glass-input rounded-xl p-3 text-slate-300 font-mono text-sm outline-none" 
                                />
                                <span className="absolute right-4 top-3.5 text-[10px] text-slate-500 font-bold">mm/h</span>
                            </div>
                        </div>

                        <div>
                            <label className="industrial-label">Materiale Copertura (C)</label>
                            <select 
                                value={coeff} 
                                onChange={e=>setCoeff(e.target.value)} 
                                className="w-full glass-input rounded-xl p-3 text-white outline-none cursor-pointer text-xs"
                            >
                                {COEFF_PRESETS.map(p => (
                                    <option key={p.val} value={p.val} className="bg-app-panel">{p.label} ({p.val})</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* TOTAL FLOW CARD */}
                <div className="bg-gradient-to-br from-blue-900/40 to-slate-900/50 rounded-2xl p-6 border border-blue-500/30 text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    
                    <span className="industrial-label text-blue-400 !mb-2">Portata di Progetto (Q)</span>
                    <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={()=>copy(totalFlowLs.toFixed(2))}>
                        <div className="text-4xl font-black text-white font-mono group-hover:text-blue-200 transition-colors">
                            {totalFlowLs.toFixed(2)} <span className="text-lg text-slate-500">l/s</span>
                        </div>
                        <div className="text-xs text-slate-400 font-mono font-bold">
                            {totalFlowLmin.toFixed(0)} l/min
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                        <div className="bg-black/20 rounded-lg p-2">
                             <div className="text-[9px] text-slate-500 uppercase font-bold">Sviluppo Gronda</div>
                             <div className="text-white font-bold">{gutterSize}</div>
                        </div>
                        <div className="bg-black/20 rounded-lg p-2">
                             <div className="text-[9px] text-slate-500 uppercase font-bold">Sup. Servita</div>
                             <div className="text-white font-bold">{area} m²</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RESULTS MATRIX */}
            <div className="lg:col-span-8">
                <div className="glass-panel rounded-2xl overflow-hidden border border-white/10 h-full flex flex-col">
                    <div className="bg-white/5 p-4 border-b border-white/10 flex justify-between items-center">
                         <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                             <ArrowDown size={14} className="text-blue-500"/> Matrice Dimensionale Pluviali
                         </h3>
                    </div>
                    
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto custom-scrollbar">
                        {results.length > 0 ? (
                            results.map((r, i) => (
                                <div key={r.dn} className={`rounded-xl p-4 border transition-all ${r.utilization > 90 ? 'bg-orange-900/10 border-orange-500/30' : 'bg-black/20 border-white/5 hover:border-blue-500/30'}`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white border border-white/10">{r.dn}</div>
                                            <span className="text-xs font-bold text-slate-300 uppercase">{r.label}</span>
                                        </div>
                                        <div className="text-[10px] font-mono text-slate-500">{r.capacity} l/s cad.</div>
                                    </div>
                                    
                                    <div className="flex items-end gap-2 mb-2">
                                        <span className="text-3xl font-black text-white leading-none">{r.count}</span>
                                        <span className="text-xs text-slate-500 font-bold uppercase mb-1">Pezzi</span>
                                    </div>

                                    {/* Capacity Bar */}
                                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1">
                                        <div 
                                            className={`h-full rounded-full ${r.utilization > 90 ? 'bg-orange-500' : 'bg-blue-500'}`} 
                                            style={{width: `${Math.min(r.utilization, 100)}%`}}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-[9px]">
                                        <span className="text-slate-500">Utilizzo</span>
                                        <span className={`${r.utilization > 90 ? 'text-orange-400' : 'text-blue-400'}`}>{r.utilization.toFixed(0)}%</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center text-slate-600 flex flex-col items-center">
                                <Umbrella size={48} className="mb-4 opacity-20"/>
                                <span className="text-xs font-bold uppercase tracking-widest">Inserisci i dati per calcolare</span>
                            </div>
                        )}
                    </div>

                    <div className="bg-blue-900/10 p-4 border-t border-white/10 text-[10px] text-slate-400 leading-relaxed flex items-start gap-3">
                        <AlertTriangle size={14} className="text-blue-500 shrink-0 mt-0.5"/>
                        <p>
                            Il calcolo considera pluviali verticali liberi. Il numero indicato è il minimo matematico per smaltire la portata di progetto. 
                            Si raccomanda di posizionare i pluviali agli angoli dell'edificio e di prevedere sempre troppopieni di sicurezza in caso di ostruzione.
                        </p>
                    </div>
                </div>
            </div>
        </div>

      {/* LEGENDA TECNICA */}
      <div className="mt-10 border-t border-white/10 pt-6 no-print">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Info size={14} /> Specifiche Tecniche & Guida
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[10px] text-slate-400">
              <div>
                  <strong className="text-slate-300 block mb-1">Funzionalità Principali</strong>
                  Calcolo del numero di pluviali necessari per smaltire le acque meteoriche da una copertura piana o inclinata. Determina la portata di progetto totale in base all'intensità di pioggia locale.
              </div>
              <div>
                  <strong className="text-slate-300 block mb-1">Modalità d'Uso</strong>
                  Inserisci la superficie in pianta della copertura. Seleziona l'intensità di pioggia (o inserisci valore manuale) e il coefficiente di deflusso (materiale). Il sistema suggerisce varie configurazioni di diametri.
              </div>
              <div>
                  <strong className="text-slate-300 block mb-1">Riferimenti Normativi</strong>
                  UNI EN 12056-3. Formula Q = (A * I * C) / 3600. Capacità scarico pluviali calcolata con grado di riempimento convenzionale (0.33 per sicurezza).
              </div>
          </div>
      </div>
    </div>
  );
}