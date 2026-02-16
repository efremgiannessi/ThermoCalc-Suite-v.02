
import { useState, useEffect } from 'react';
import { Droplets, Zap, Database, TrendingDown, Ruler, Info } from 'lucide-react';

interface Props {
  showToast: (msg: string) => void;
}

type TabMode = 'sizing' | 'drop' | 'pumps';

// --- DATABASE FLUIDI ---
const FLUIDS = [
    { id: 'water', name: 'Acqua (4°C)', density: 1000 },
    { id: 'sea', name: 'Acqua Mare', density: 1025 },
    { id: 'diesel', name: 'Gasolio', density: 835 },
    { id: 'oil_hyd', name: 'Olio Idraulico', density: 880 },
    { id: 'petrol', name: 'Benzina', density: 720 },
    { id: 'milk', name: 'Latte', density: 1030 },
];

// --- DATABASE TUBAZIONI (Diametri Interni in mm) ---
const PIPE_DB = {
    acciaio: {
        name: 'Acciaio (ASTM Sched 40)',
        roughness: 130, // Hazen-Williams C
        sizes: [
            { dn: 15, label: '1/2"', id: 15.8 },
            { dn: 20, label: '3/4"', id: 20.9 },
            { dn: 25, label: '1"', id: 26.6 },
            { dn: 32, label: '1 1/4"', id: 35.1 },
            { dn: 40, label: '1 1/2"', id: 40.9 },
            { dn: 50, label: '2"', id: 52.5 },
            { dn: 65, label: '2 1/2"', id: 62.7 },
            { dn: 80, label: '3"', id: 77.9 },
            { dn: 100, label: '4"', id: 102.3 },
            { dn: 125, label: '5"', id: 128.2 },
            { dn: 150, label: '6"', id: 154.1 },
            { dn: 200, label: '8"', id: 202.7 },
        ]
    },
    pe100: {
        name: 'PE100 (PN16 SDR11)',
        roughness: 150,
        sizes: [
            { dn: 20, label: 'OD 20', id: 16.2 },
            { dn: 25, label: 'OD 25', id: 20.4 },
            { dn: 32, label: 'OD 32', id: 26.0 },
            { dn: 40, label: 'OD 40', id: 32.6 },
            { dn: 50, label: 'OD 50', id: 40.8 },
            { dn: 63, label: 'OD 63', id: 51.4 },
            { dn: 75, label: 'OD 75', id: 61.4 },
            { dn: 90, label: 'OD 90', id: 73.6 },
            { dn: 110, label: 'OD 110', id: 90.0 },
            { dn: 125, label: 'OD 125', id: 102.2 },
        ]
    },
    rame: {
        name: 'Rame (UNI EN 1057)',
        roughness: 140,
        sizes: [
            { dn: 12, label: '12x1', id: 10 },
            { dn: 14, label: '14x1', id: 12 },
            { dn: 16, label: '16x1', id: 14 },
            { dn: 18, label: '18x1', id: 16 },
            { dn: 22, label: '22x1', id: 20 },
            { dn: 28, label: '28x1.5', id: 25 },
            { dn: 35, label: '35x1.5', id: 32 },
            { dn: 42, label: '42x1.5', id: 39 },
            { dn: 54, label: '54x2', id: 50 },
        ]
    },
    pvc: {
        name: 'PVC (PN10)',
        roughness: 150,
        sizes: [
            { dn: 32, label: 'OD 32', id: 29.2 },
            { dn: 40, label: 'OD 40', id: 37.0 },
            { dn: 50, label: 'OD 50', id: 46.2 },
            { dn: 63, label: 'OD 63', id: 58.2 },
            { dn: 75, label: 'OD 75', id: 69.4 },
            { dn: 90, label: 'OD 90', id: 83.4 },
            { dn: 110, label: 'OD 110', id: 101.8 },
        ]
    }
};

type MaterialKey = keyof typeof PIPE_DB;

export default function Idraulica({ showToast }: Props) {
  const [activeTab, setActiveTab] = useState<TabMode>('sizing');
  
  // COMMON STATE
  const [flow, setFlow] = useState<string>('10'); // m3/h
  const [material, setMaterial] = useState<MaterialKey>('acciaio');
  
  // SIZING STATE
  const [targetV, setTargetV] = useState<string>('1.5'); // m/s
  const [sizingResults, setSizingResults] = useState<any[]>([]);

  // DROP STATE (Perdite di Carico)
  const [dropPipeIdx, setDropPipeIdx] = useState<number>(0); // Index in sizes array
  const [length, setLength] = useState<string>('100'); // m
  const [headLoss, setHeadLoss] = useState({ bar: 0, mca: 0, v: 0 });

  // PUMPS STATE
  const [fluidIdx, setFluidIdx] = useState<number>(0);
  const [pumpH, setPumpH] = useState<string>('20'); // m
  const [pumpEff, setPumpEff] = useState<string>('0.75');
  const [pumpRes, setPumpRes] = useState({ hydKw: 0, shaftKw: 0 });

  // --- CALC SIZING ---
  useEffect(() => {
    const Q_m3h = parseFloat(flow) || 0;
    const V_target = parseFloat(targetV) || 1.5;

    if (Q_m3h > 0 && V_target > 0) {
        const Q_m3s = Q_m3h / 3600;
        // Calculate Theoretical Diameter
        // A = Q/V -> D = sqrt(4A/pi)
        const A_theo = Q_m3s / V_target;
        // const D_theo_mm = Math.sqrt((4 * A_theo) / Math.PI) * 1000;

        // Check against DB
        const sizes = PIPE_DB[material].sizes;
        const results = sizes.map(p => {
            const A_actual = Math.PI * Math.pow((p.id/1000)/2, 2);
            const V_actual = Q_m3s / A_actual;
            return {
                ...p,
                v: V_actual,
                diff: Math.abs(V_actual - V_target)
            };
        }).sort((a,b) => a.diff - b.diff); // Sort by closest velocity

        setSizingResults(results.slice(0, 5)); // Take top 5 suggestions
    }
  }, [flow, targetV, material]);

  // --- CALC HEAD LOSS (Hazen-Williams) ---
  useEffect(() => {
    const Q_m3h = parseFloat(flow) || 0;
    const L = parseFloat(length) || 0;
    const matData = PIPE_DB[material];
    const size = matData.sizes[dropPipeIdx];
    
    if (Q_m3h > 0 && L > 0 && size) {
        const C = matData.roughness;
        const D_mm = size.id;
        const D_m = D_mm / 1000;
        
        const Q_m3s = Q_m3h / 3600;
        
        // Velocity
        const A = Math.PI * Math.pow(D_m/2, 2);
        const V = Q_m3s / A;

        // Hazen-Williams Formula (Metric)
        // J (m/m) = 10.67 * Q^1.852 * C^-1.852 * D^-4.87
        const J = 10.67 * Math.pow(Q_m3s, 1.852) * Math.pow(C, -1.852) * Math.pow(D_m, -4.87);
        
        const TotalLoss_m = J * L;
        const TotalLoss_bar = TotalLoss_m / 10.197;

        setHeadLoss({
            bar: TotalLoss_bar,
            mca: TotalLoss_m,
            v: V
        });
    }
  }, [flow, length, material, dropPipeIdx]);

  // --- CALC PUMPS ---
  useEffect(() => {
    const Q_m3h = parseFloat(flow) || 0;
    const H = parseFloat(pumpH) || 0;
    const eff = parseFloat(pumpEff) || 0.75;
    const rho = FLUIDS[fluidIdx].density;

    if (Q_m3h > 0 && H > 0 && eff > 0) {
        const Q_m3s = Q_m3h / 3600;
        // P(W) = rho * g * Q * H
        const Ph_W = rho * 9.81 * Q_m3s * H;
        const Pm_W = Ph_W / eff;

        setPumpRes({
            hydKw: Ph_W / 1000,
            shaftKw: Pm_W / 1000
        });
    }
  }, [flow, pumpH, pumpEff, fluidIdx]);

  const copy = (t: string) => {
    navigator.clipboard.writeText(t);
    showToast('Copiato!');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-slide-in pb-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 no-print">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="bg-cyan-500/20 w-10 h-10 rounded-xl flex items-center justify-center text-cyan-500 border border-cyan-500/20">
                    <Droplets size={20} />
                </span>
                Ingegneria Idraulica
            </h2>
            
            <div className="bg-black/20 p-1 rounded-xl flex border border-white/10 overflow-x-auto">
                <button 
                    onClick={() => setActiveTab('sizing')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'sizing' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                    <Ruler size={14} /> Dimensionamento
                </button>
                <button 
                    onClick={() => setActiveTab('drop')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'drop' ? 'bg-red-500 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                    <TrendingDown size={14} /> Perdite Carico
                </button>
                <button 
                    onClick={() => setActiveTab('pumps')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'pumps' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                    <Zap size={14} /> Pompe
                </button>
            </div>
        </div>

        {/* --- COMMON INPUTS --- */}
        <div className="glass-panel rounded-2xl p-6 border-cyan-500/10 grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="relative group">
                <label className="industrial-label">Portata di Progetto (Q)</label>
                <div className="flex gap-2 items-center">
                    <input type="number" value={flow} onChange={e=>setFlow(e.target.value)} className="w-full glass-input rounded-xl p-3 font-mono text-xl outline-none focus:border-cyan-500/50 text-white" placeholder="0"/>
                    <span className="text-xs font-bold text-slate-500 w-12 text-center">m³/h</span>
                </div>
                <div className="mt-1 text-[9px] text-slate-500 text-right">
                    {flow ? `≈ ${(parseFloat(flow) * 16.6667).toFixed(1)} l/min` : ''}
                </div>
             </div>

             {activeTab !== 'pumps' && (
                <div>
                    <label className="industrial-label flex justify-between">
                        <span>Materiale Tubazione</span>
                        <span className="text-cyan-500 font-mono">C={PIPE_DB[material].roughness}</span>
                    </label>
                    <select 
                        value={material} 
                        onChange={e => {
                            setMaterial(e.target.value as MaterialKey);
                            setDropPipeIdx(0); // Reset index on material change
                        }}
                        className="w-full glass-input rounded-xl p-3 text-white outline-none cursor-pointer"
                    >
                        {Object.entries(PIPE_DB).map(([k, v]) => (
                            <option key={k} value={k} className="bg-app-panel">{v.name}</option>
                        ))}
                    </select>
                </div>
             )}

             {activeTab === 'pumps' && (
                <div>
                    <label className="industrial-label">Fluido di Processo</label>
                    <select 
                        value={fluidIdx} 
                        onChange={e => setFluidIdx(parseInt(e.target.value))}
                        className="w-full glass-input rounded-xl p-3 text-white outline-none cursor-pointer"
                    >
                        {FLUIDS.map((f, i) => (
                            <option key={f.id} value={i} className="bg-app-panel">{f.name} ({f.density} kg/m³)</option>
                        ))}
                    </select>
                </div>
             )}
        </div>

        {/* --- SIZING TAB --- */}
        {activeTab === 'sizing' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
                <div className="lg:col-span-4 glass-panel rounded-2xl p-6 border-white/5">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Parametri Velocità</h3>
                    
                    <label className="industrial-label">Velocità Target (m/s)</label>
                    <input type="number" value={targetV} onChange={e=>setTargetV(e.target.value)} className="w-full glass-input rounded-xl p-3 font-mono text-lg text-white mb-4" />
                    
                    <div className="bg-white/5 rounded-xl p-4 text-[10px] text-slate-400 space-y-2">
                        <div className="flex justify-between"><span>Aspirazione Pompe</span><span className="text-white">0.5 - 1.5 m/s</span></div>
                        <div className="flex justify-between"><span>Mandata Acqua</span><span className="text-white">1.5 - 3.0 m/s</span></div>
                        <div className="flex justify-between"><span>Acqua Calda / Vapore</span><span className="text-white">2.0 - 4.0 m/s</span></div>
                        <div className="flex justify-between"><span>Aria Compressa</span><span className="text-white">6.0 - 15.0 m/s</span></div>
                    </div>
                </div>

                <div className="lg:col-span-8 glass-panel rounded-2xl p-6 bg-cyan-900/10 border-cyan-500/20">
                     <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Database size={14}/> Suggerimenti Database</h3>
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] text-slate-500 uppercase border-b border-white/10">
                                    <th className="pb-2">DN / Label</th>
                                    <th className="pb-2 text-right">Ø Interno</th>
                                    <th className="pb-2 text-right">Velocità Reale</th>
                                    <th className="pb-2 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {sizingResults.map((r, i) => (
                                    <tr key={i} className={`border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors ${i === 0 ? 'bg-emerald-500/10' : ''}`}>
                                        <td className="py-3 font-bold text-white pl-2">
                                            {r.label} <span className="text-xs font-normal text-slate-500 ml-1">DN{r.dn}</span>
                                        </td>
                                        <td className="py-3 text-right font-mono text-slate-300">{r.id.toFixed(1)} mm</td>
                                        <td className={`py-3 text-right font-mono font-bold ${r.v > 3 ? 'text-red-400' : (r.v > 2 ? 'text-amber-400' : 'text-emerald-400')}`}>
                                            {r.v.toFixed(2)} m/s
                                        </td>
                                        <td className="py-3 text-center">
                                            {i === 0 && <span className="text-[9px] bg-emerald-500 text-black font-bold px-2 py-0.5 rounded-full uppercase">Best Match</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                     </div>
                </div>
            </div>
        )}

        {/* --- DROP TAB --- */}
        {activeTab === 'drop' && (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                <div className="glass-panel rounded-2xl p-6 border-red-500/10">
                    <h3 className="text-sm font-bold text-red-500 uppercase tracking-widest mb-4">Dettagli Condotta</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="industrial-label">Diametro Commerciale</label>
                            <select 
                                value={dropPipeIdx} 
                                onChange={e => setDropPipeIdx(parseInt(e.target.value))}
                                className="w-full glass-input rounded-xl p-3 text-white outline-none cursor-pointer"
                            >
                                {PIPE_DB[material].sizes.map((s, i) => (
                                    <option key={i} value={i} className="bg-app-panel">
                                        {s.label} (ID: {s.id} mm)
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="industrial-label">Lunghezza Tratta (m)</label>
                            <input type="number" value={length} onChange={e=>setLength(e.target.value)} className="w-full glass-input rounded-xl p-3 font-mono text-white"/>
                        </div>
                    </div>
                    
                    <div className="mt-6 bg-white/5 p-4 rounded-xl flex justify-between items-center">
                        <span className="text-xs text-slate-400 uppercase font-bold">Velocità Fluido</span>
                        <span className="font-mono text-white font-bold">{headLoss.v.toFixed(2)} m/s</span>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="glass-panel rounded-2xl p-8 text-center bg-red-950/20 border-red-500/20 flex-1 flex flex-col justify-center" onClick={()=>copy(headLoss.bar.toFixed(3))}>
                        <span className="industrial-label text-red-500 !mb-2 flex items-center justify-center gap-2"><TrendingDown size={14}/> Perdita di Carico Totale</span>
                        <div className="text-5xl font-black text-white font-mono">{headLoss.bar.toFixed(3)} <span className="text-xl text-slate-500">bar</span></div>
                        <div className="text-xs text-red-300/60 mt-2 font-mono">≈ {(headLoss.bar * 10.197).toFixed(2)} m.c.a.</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                             <div className="text-[9px] text-slate-500 uppercase font-bold mb-1">Perdita Specifica</div>
                             <div className="text-lg font-mono text-slate-300">{(headLoss.mca / parseFloat(length) * 100).toFixed(1)} cm/m</div>
                         </div>
                         <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                             <div className="text-[9px] text-slate-500 uppercase font-bold mb-1">Formula</div>
                             <div className="text-lg font-mono text-slate-300">Hazen-W.</div>
                         </div>
                    </div>
                </div>
             </div>
        )}

        {/* --- PUMPS TAB --- */}
        {activeTab === 'pumps' && (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                 <div className="glass-panel rounded-2xl p-6 border-indigo-500/10">
                    <h3 className="text-sm font-bold text-indigo-500 uppercase tracking-widest mb-4">Specifiche Pompa</h3>
                    <div className="space-y-4">
                        <div>
                             <label className="industrial-label">Prevalenza Totale (H)</label>
                             <div className="flex gap-2 items-center">
                                <input type="number" value={pumpH} onChange={e=>setPumpH(e.target.value)} className="w-full glass-input rounded-xl p-3 text-white" />
                                <span className="text-xs font-bold text-slate-500 w-8 text-center">m</span>
                             </div>
                        </div>
                        <div>
                             <label className="industrial-label">Rendimento (η)</label>
                             <input type="number" value={pumpEff} onChange={e=>setPumpEff(e.target.value)} step="0.01" max="1" className="w-full glass-input rounded-xl p-3 text-white" placeholder="0.75"/>
                        </div>
                        <div className="bg-indigo-500/10 p-4 rounded-xl text-xs text-indigo-300 mt-4 border border-indigo-500/20">
                            Densità Fluido: <strong>{FLUIDS[fluidIdx].density} kg/m³</strong>
                        </div>
                    </div>
                 </div>

                 <div className="flex flex-col gap-4">
                     <div className="glass-panel rounded-2xl p-8 text-center bg-indigo-900/10 border-indigo-500/20 flex-1 flex flex-col justify-center" onClick={()=>copy(pumpRes.shaftKw.toFixed(2))}>
                         <span className="industrial-label text-indigo-400 !mb-2 flex items-center justify-center gap-2"><Zap size={14}/> Potenza all'Asse</span>
                         <div className="text-5xl font-black text-white font-mono">{pumpRes.shaftKw.toFixed(2)} <span className="text-xl text-slate-500">kW</span></div>
                         <div className="text-xs text-indigo-300/60 mt-2 font-mono">≈ {(pumpRes.shaftKw * 1.341).toFixed(2)} HP</div>
                     </div>
                     <div className="glass-panel rounded-2xl p-4 text-center border border-white/5">
                         <span className="industrial-label text-slate-500">Potenza Idraulica (No Perdite)</span>
                         <div className="text-xl font-bold text-slate-300 font-mono">{pumpRes.hydKw.toFixed(2)} kW</div>
                     </div>
                 </div>
             </div>
        )}

      {/* LEGENDA TECNICA */}
      <div className="mt-10 border-t border-white/10 pt-6 no-print">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Info size={14} /> Specifiche Tecniche & Guida
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[10px] text-slate-400">
              <div>
                  <strong className="text-slate-300 block mb-1">Funzionalità Principali</strong>
                  Calcolo idraulico completo per tubazioni in pressione. Dimensionamento ottimale diametri, calcolo perdite di carico distribuite e dimensionamento potenza pompe centrifughe.
              </div>
              <div>
                  <strong className="text-slate-300 block mb-1">Modalità d'Uso</strong>
                  Inserisci la portata di progetto. Scegli "Dimensionamento" per trovare il tubo ideale in base alla velocità. Usa "Perdite Carico" per verificare una tratta esistente.
              </div>
              <div>
                  <strong className="text-slate-300 block mb-1">Riferimenti Normativi</strong>
                  Equazione di Hazen-Williams per perdite di carico (Acqua). Equazione di Continuità (Q=V*A) per dimensionamento. Rendimenti pompe stimati standard.
              </div>
          </div>
      </div>
    </div>
  );
}
