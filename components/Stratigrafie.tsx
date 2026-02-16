
import { useState, useMemo } from 'react';
import { 
  Layers, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Download, 
  FileText, 
  Zap,
  Droplets,
  Wind,
  Info
} from 'lucide-react';

interface Props {
  showToast: (msg: string) => void;
}

// --- CATEGORIE MATERIALI ---
type MaterialCategory = 'structure' | 'vapor' | 'insulation' | 'waterproofing' | 'finish';

interface Material {
  id: string;
  name: string;
  cat: MaterialCategory;
  lambda: number; // W/mK (0 se non rilevante termicamente)
  density: number; // kg/m3
  cp: number; // J/kgK (Calore specifico)
  mu: number; // Fattore resistenza vapore
  color: string;
  pattern: string; // ID for SVG pattern
  defaultThick: number; // cm
}

// --- DATABASE MATERIALI COMPLETO ---
const MATERIALS_DB: Material[] = [
    // STRUTTURE
    { id: 'cls_armato', name: 'Soletta CLS Armato', cat: 'structure', lambda: 2.3, density: 2400, cp: 1000, mu: 90, color: '#94a3b8', pattern: 'concrete', defaultThick: 20 },
    { id: 'pref_tegolo', name: 'Tegolo Prefabbricato (TT/Alare)', cat: 'structure', lambda: 1.8, density: 2300, cp: 1000, mu: 80, color: '#cbd5e1', pattern: 'concrete', defaultThick: 5 },
    { id: 'lam_grecata', name: 'Lamiera Grecata Acciaio', cat: 'structure', lambda: 50, density: 7800, cp: 450, mu: 100000, color: '#3b82f6', pattern: 'steel', defaultThick: 0.1 },
    { id: 'legno_xlam', name: 'Pannello X-LAM', cat: 'structure', lambda: 0.13, density: 470, cp: 1600, mu: 50, color: '#d97706', pattern: 'wood', defaultThick: 10 },
    { id: 'osb', name: 'Pannello OSB', cat: 'structure', lambda: 0.13, density: 600, cp: 1700, mu: 200, color: '#b45309', pattern: 'wood', defaultThick: 2 },
    
    // BARRIERE / FRENI VAPORE
    { id: 'bv_bitume', name: 'Barriera Vapore Bituminosa (Alu)', cat: 'vapor', lambda: 0.17, density: 1100, cp: 1000, mu: 500000, color: '#1e293b', pattern: 'solid', defaultThick: 0.4 },
    { id: 'bv_pe', name: 'Telo PE (Polietilene)', cat: 'vapor', lambda: 0.33, density: 920, cp: 2200, mu: 100000, color: '#38bdf8', pattern: 'solid', defaultThick: 0.05 },
    { id: 'primer', name: 'Primer Bituminoso', cat: 'vapor', lambda: 0, density: 900, cp: 1000, mu: 1000, color: '#000000', pattern: 'dots', defaultThick: 0.1 },

    // ISOLANTI
    { id: 'eps_100', name: 'EPS 100 (Polistirene Espanso)', cat: 'insulation', lambda: 0.036, density: 20, cp: 1450, mu: 40, color: '#fcd34d', pattern: 'dots_sparse', defaultThick: 10 },
    { id: 'eps_graph', name: 'EPS Grafite', cat: 'insulation', lambda: 0.031, density: 20, cp: 1450, mu: 40, color: '#94a3b8', pattern: 'dots_sparse', defaultThick: 10 },
    { id: 'xps', name: 'XPS (Polistirene Estruso)', cat: 'insulation', lambda: 0.034, density: 35, cp: 1450, mu: 150, color: '#fef08a', pattern: 'solid', defaultThick: 10 },
    { id: 'pir', name: 'PIR (Poliisocianurato)', cat: 'insulation', lambda: 0.023, density: 32, cp: 1400, mu: 60, color: '#fde68a', pattern: 'solid', defaultThick: 8 },
    { id: 'rock_wool_hd', name: 'Lana di Roccia (Alta Densità)', cat: 'insulation', lambda: 0.038, density: 110, cp: 1030, mu: 1, color: '#a8a29e', pattern: 'crosshatch', defaultThick: 12 },
    { id: 'glass_wool', name: 'Lana di Vetro', cat: 'insulation', lambda: 0.035, density: 25, cp: 1030, mu: 1, color: '#fef3c7', pattern: 'crosshatch', defaultThick: 12 },
    { id: 'wood_fiber', name: 'Fibra di Legno', cat: 'insulation', lambda: 0.039, density: 160, cp: 2100, mu: 5, color: '#d97706', pattern: 'wood', defaultThick: 14 },
    { id: 'cell_glass', name: 'Vetro Cellulare (Foamglass)', cat: 'insulation', lambda: 0.050, density: 120, cp: 1000, mu: 100000, color: '#475569', pattern: 'solid', defaultThick: 10 },

    // IMPERMEABILIZZANTI
    { id: 'mem_bit_4mm', name: 'Guaina Bituminosa 4mm (APP/SBS)', cat: 'waterproofing', lambda: 0.17, density: 1100, cp: 1000, mu: 20000, color: '#334155', pattern: 'solid', defaultThick: 0.4 },
    { id: 'mem_pvc', name: 'Manto Sintetico PVC', cat: 'waterproofing', lambda: 0.16, density: 1300, cp: 1000, mu: 20000, color: '#e2e8f0', pattern: 'solid', defaultThick: 0.15 },
    { id: 'mem_tpo', name: 'Manto Sintetico TPO/FPO', cat: 'waterproofing', lambda: 0.20, density: 1000, cp: 1000, mu: 50000, color: '#f1f5f9', pattern: 'solid', defaultThick: 0.15 },
    { id: 'mem_epdm', name: 'Membrana EPDM', cat: 'waterproofing', lambda: 0.25, density: 1200, cp: 1000, mu: 60000, color: '#1e293b', pattern: 'solid', defaultThick: 0.12 },
    { id: 'liquid', name: 'Impermeabilizzante Liquido', cat: 'waterproofing', lambda: 0.20, density: 1400, cp: 1000, mu: 2000, color: '#0ea5e9', pattern: 'solid', defaultThick: 0.2 },

    // FINITURE & ZAVORRE
    { id: 'gravel', name: 'Ghiaia tonda lavata', cat: 'finish', lambda: 0.7, density: 1800, cp: 1000, mu: 1, color: '#cbd5e1', pattern: 'circles', defaultThick: 5 },
    { id: 'soil_green', name: 'Substrato Tetto Verde (Intensivo)', cat: 'finish', lambda: 0.8, density: 1200, cp: 1500, mu: 1, color: '#84cc16', pattern: 'organic', defaultThick: 15 },
    { id: 'concrete_screed', name: 'Massetto Pendenze', cat: 'finish', lambda: 1.4, density: 2000, cp: 1000, mu: 10, color: '#94a3b8', pattern: 'concrete', defaultThick: 5 },
    { id: 'paver', name: 'Quadrotta cls / Pavimentazione', cat: 'finish', lambda: 1.8, density: 2300, cp: 1000, mu: 50, color: '#64748b', pattern: 'concrete', defaultThick: 4 },
];

interface Layer {
  uid: string;
  materialId: string;
  thick: number; // cm
  customDesc?: string;
}

export default function Stratigrafie({ }: Props) {
  const [layers, setLayers] = useState<Layer[]>([
     { uid: '1', materialId: 'gravel', thick: 5 },
     { uid: '2', materialId: 'mem_bit_4mm', thick: 0.4 },
     { uid: '3', materialId: 'mem_bit_4mm', thick: 0.4 },
     { uid: '4', materialId: 'pir', thick: 10 },
     { uid: '5', materialId: 'bv_bitume', thick: 0.4 },
     { uid: '6', materialId: 'pref_tegolo', thick: 5 },
  ]);
  const [activeCat, setActiveCat] = useState<MaterialCategory>('insulation');
  const [projectName, setProjectName] = useState('Nuova Copertura Industriale');

  // --- CALCOLO PROPRIETÀ ---
  const results = useMemo(() => {
    let r_tot = 0; // m2K/W
    let total_mass = 0; // kg/m2
    let total_thick = 0; // cm
    let thermal_capacity_areal = 0; // J/m2K (Stima inerzia)

    // Resistenze liminari (Flusso Ascendente Invernale standard)
    const Rsi = 0.10;
    const Rse = 0.04;

    layers.forEach(l => {
        const mat = MATERIALS_DB.find(m => m.id === l.materialId);
        if(mat) {
            const d_meter = l.thick / 100;
            
            // Thermal Resistance
            if (mat.lambda > 0) {
                r_tot += d_meter / mat.lambda;
            }

            // Mass
            total_mass += d_meter * mat.density;

            // Heat Capacity (Areal) = d * rho * cp
            thermal_capacity_areal += d_meter * mat.density * mat.cp;

            total_thick += l.thick;
        }
    });

    r_tot += Rsi + Rse;
    const U = r_tot > 0 ? 1 / r_tot : 0;
    
    // Stima sfasamento (semplificata, solo indicativa basata su massa e cp)
    // Formula approx: Phi = 1.38 * thickness * sqrt(rho * cp / lambda) ... ma qui sommiamo i contributi
    // Usiamo una metrica qualitativa basata su Capacity
    let lag_est = "Basso (< 6h)";
    if (thermal_capacity_areal > 40000) lag_est = "Medio (6-9h)";
    if (thermal_capacity_areal > 70000) lag_est = "Buono (9-12h)";
    if (thermal_capacity_areal > 100000) lag_est = "Eccellente (> 12h)";

    return {
        U: U.toFixed(3),
        R: r_tot.toFixed(2),
        Mass: total_mass.toFixed(1),
        Thick: total_thick.toFixed(1),
        Capacity: (thermal_capacity_areal / 1000).toFixed(0), // kJ/m2K
        Lag: lag_est
    };
  }, [layers]);

  // --- ACTIONS ---
  const addLayer = (mat: Material) => {
      const newLayer: Layer = {
          uid: Date.now().toString(),
          materialId: mat.id,
          thick: mat.defaultThick
      };
      setLayers([newLayer, ...layers]);
  };

  const removeLayer = (uid: string) => {
      setLayers(layers.filter(l => l.uid !== uid));
  };

  const moveLayer = (uid: string, dir: 'up' | 'down') => {
      const idx = layers.findIndex(l => l.uid === uid);
      if (idx === -1) return;
      const newLayers = [...layers];
      if (dir === 'up' && idx > 0) {
          [newLayers[idx], newLayers[idx - 1]] = [newLayers[idx - 1], newLayers[idx]];
      } else if (dir === 'down' && idx < layers.length - 1) {
          [newLayers[idx], newLayers[idx + 1]] = [newLayers[idx + 1], newLayers[idx]];
      }
      setLayers(newLayers);
  };

  const updateThick = (uid: string, val: string) => {
      const v = parseFloat(val);
      if (v >= 0) {
          setLayers(layers.map(l => l.uid === uid ? { ...l, thick: v } : l));
      }
  };

  // --- RENDER HELPERS ---
  const getCatLabel = (c: MaterialCategory) => {
      switch(c) {
          case 'structure': return 'Strutture';
          case 'vapor': return 'Teli & Vapore';
          case 'insulation': return 'Isolanti';
          case 'waterproofing': return 'Impermeabilizzazioni';
          case 'finish': return 'Finiture & Zavorre';
      }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-slide-in pb-20">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 no-print">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="bg-orange-500/20 w-10 h-10 rounded-xl flex items-center justify-center text-orange-500 border border-orange-500/20">
                    <Layers size={20} />
                </span>
                Configuratore Stratigrafie
            </h2>
            <div className="flex gap-2">
                 <button onClick={() => window.print()} className="bg-white/10 hover:bg-white/20 text-slate-300 px-4 py-2 rounded-lg text-sm font-bold transition-colors border border-white/5 flex items-center gap-2">
                    <Download size={14}/> PDF / Stampa
                 </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT: MATERIAL PICKER (No Print) */}
            <div className="lg:col-span-3 space-y-4 no-print h-fit sticky top-4">
                <div className="glass-panel rounded-2xl p-4 border-orange-500/10">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Libreria Materiali</h3>
                    
                    {/* Category Tabs */}
                    <div className="flex flex-wrap gap-1 mb-4">
                        {(['finish', 'waterproofing', 'insulation', 'vapor', 'structure'] as MaterialCategory[]).map(cat => (
                            <button 
                                key={cat}
                                onClick={() => setActiveCat(cat)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${activeCat === cat ? 'bg-orange-500 text-white border-orange-400' : 'bg-black/30 border-white/5 text-slate-500 hover:text-white'}`}
                                title={getCatLabel(cat)}
                            >
                                {cat === 'finish' && <Layers size={14}/>}
                                {cat === 'waterproofing' && <Droplets size={14}/>}
                                {cat === 'insulation' && <Zap size={14}/>}
                                {cat === 'vapor' && <Wind size={14}/>}
                                {cat === 'structure' && <div className="font-black text-[9px]">STR</div>}
                            </button>
                        ))}
                    </div>

                    <div className="text-xs font-bold text-orange-500 mb-2 uppercase">{getCatLabel(activeCat)}</div>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
                        {MATERIALS_DB.filter(m => m.cat === activeCat).map(mat => (
                            <button 
                                key={mat.id}
                                onClick={() => addLayer(mat)}
                                className="w-full text-left p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-orange-500/30 transition-all group"
                            >
                                <div className="text-[11px] font-bold text-slate-200 group-hover:text-white">{mat.name}</div>
                                <div className="flex justify-between mt-1 text-[9px] text-slate-500 font-mono">
                                    <span>λ {mat.lambda}</span>
                                    <span>ρ {mat.density}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* CENTER: LAYER EDITOR & PREVIEW */}
            <div className="lg:col-span-9 space-y-6">
                
                {/* PROJECT HEADER INPUT */}
                <div className="glass-panel rounded-2xl p-4 border-white/5 flex items-center gap-4">
                     <FileText size={20} className="text-orange-500"/>
                     <input 
                        type="text" 
                        value={projectName} 
                        onChange={e => setProjectName(e.target.value)}
                        className="bg-transparent text-xl font-bold text-white outline-none w-full placeholder-slate-600"
                        placeholder="Nome Progetto / Sezione..."
                     />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* LISTA LIVELLI (EDITOR) - No Print */}
                    <div className="space-y-3 no-print">
                        <div className="flex justify-between items-center px-2">
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest"><ArrowUp size={10} className="inline"/> Esterno</span>
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Spessore (cm)</span>
                        </div>
                        
                        <div className="space-y-2">
                            {layers.map((layer, idx) => {
                                const mat = MATERIALS_DB.find(m => m.id === layer.materialId);
                                if (!mat) return null;
                                return (
                                    <div key={layer.uid} className="bg-app-panel border border-white/5 p-3 rounded-xl flex items-center gap-3 group hover:border-orange-500/30 transition-all">
                                        <div className="flex flex-col gap-1">
                                            <button onClick={() => moveLayer(layer.uid, 'up')} disabled={idx === 0} className="text-slate-600 hover:text-white disabled:opacity-20"><ArrowUp size={12}/></button>
                                            <button onClick={() => moveLayer(layer.uid, 'down')} disabled={idx === layers.length - 1} className="text-slate-600 hover:text-white disabled:opacity-20"><ArrowDown size={12}/></button>
                                        </div>
                                        
                                        <div className="flex-1">
                                            <div className="text-xs font-bold text-white">{mat.name}</div>
                                            <div className="text-[10px] text-slate-500">{getCatLabel(mat.cat)}</div>
                                        </div>

                                        <input 
                                            type="number" 
                                            value={layer.thick} 
                                            onChange={e => updateThick(layer.uid, e.target.value)}
                                            className="w-16 bg-black/30 border border-white/10 rounded-lg p-1.5 text-center text-sm font-mono text-orange-400 focus:border-orange-500 outline-none"
                                        />

                                        <button onClick={() => removeLayer(layer.uid)} className="text-slate-600 hover:text-red-500 transition-colors">
                                            <Trash2 size={14}/>
                                        </button>
                                    </div>
                                );
                            })}
                            
                            {layers.length === 0 && (
                                <div className="text-center py-10 border-2 border-dashed border-white/5 rounded-xl text-slate-600 text-xs">
                                    Nessun livello. Aggiungi materiali dalla libreria.
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center px-2">
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest"><ArrowDown size={10} className="inline"/> Interno</span>
                        </div>
                    </div>

                    {/* PREVIEW GRAFICA (PRINTABLE) */}
                    <div className="print-full-width">
                        <div className="rounded-2xl p-6 border border-white/10 bg-white text-slate-900 min-h-[500px] flex flex-col relative print:border-none print:shadow-none shadow-xl">
                             {/* SVG PATTERNS DEFINITION */}
                             <svg width="0" height="0" style={{position:'absolute', width:0, height:0, overflow:'hidden'}}>
                                <defs>
                                    <pattern id="concrete" width="10" height="10" patternUnits="userSpaceOnUse">
                                        <path d="M0,10 L10,0 M2,12 L12,2 M-2,8 L8,-2" stroke="#000" strokeWidth="0.5" strokeOpacity="0.1"/>
                                        <circle cx="5" cy="5" r="1" fill="#000" fillOpacity="0.1"/>
                                    </pattern>
                                    <pattern id="dots" width="4" height="4" patternUnits="userSpaceOnUse">
                                        <circle cx="2" cy="2" r="0.5" fill="#000" fillOpacity="0.3"/>
                                    </pattern>
                                    <pattern id="dots_sparse" width="10" height="10" patternUnits="userSpaceOnUse">
                                        <circle cx="5" cy="5" r="1" fill="#000" fillOpacity="0.1"/>
                                    </pattern>
                                    <pattern id="crosshatch" width="8" height="8" patternUnits="userSpaceOnUse">
                                        <path d="M0,0 L8,8 M8,0 L0,8" stroke="#000" strokeWidth="0.5" strokeOpacity="0.1"/>
                                    </pattern>
                                    <pattern id="lines" width="10" height="10" patternUnits="userSpaceOnUse">
                                        <path d="M0,5 L10,5" stroke="#000" strokeWidth="1" strokeOpacity="0.2"/>
                                    </pattern>
                                    <pattern id="steel" width="20" height="10" patternUnits="userSpaceOnUse">
                                        <path d="M0,10 L5,0 L15,0 L20,10" fill="none" stroke="#000" strokeWidth="0.5" strokeOpacity="0.3"/>
                                    </pattern>
                                    <pattern id="wood" width="20" height="20" patternUnits="userSpaceOnUse">
                                        <path d="M0,0 Q10,10 20,0 M0,20 Q10,10 20,20" stroke="#000" strokeWidth="0.5" strokeOpacity="0.1" fill="none"/>
                                    </pattern>
                                    <pattern id="circles" width="10" height="10" patternUnits="userSpaceOnUse">
                                        <circle cx="5" cy="5" r="3" stroke="#000" strokeWidth="0.5" strokeOpacity="0.2" fill="none"/>
                                    </pattern>
                                    <pattern id="organic" width="20" height="20" patternUnits="userSpaceOnUse">
                                        <path d="M0,10 Q5,0 10,10 T20,10" stroke="#000" strokeWidth="0.5" strokeOpacity="0.2" fill="none"/>
                                        <path d="M5,15 L7,12 L9,15" fill="#000" fillOpacity="0.2"/>
                                    </pattern>
                                </defs>
                             </svg>

                             {/* TITLE PRINT ONLY */}
                             <div className="hidden print:block mb-4 border-b border-black pb-2">
                                <h1 className="text-xl font-bold uppercase">{projectName}</h1>
                                <div className="text-[10px] text-gray-500">Generato con OmniCalc Engineering Suite</div>
                             </div>

                             {/* STRATIGRAPHY VISUALIZER */}
                             <div className="flex-1 flex flex-col justify-start relative w-full mb-6">
                                {layers.map((layer, idx) => {
                                    const mat = MATERIALS_DB.find(m => m.id === layer.materialId);
                                    if (!mat) return null;
                                    
                                    // Visual height calculation (min 10px, proportional to thickness)
                                    // Scale: 1 cm = 4px (approx), capped logic
                                    let h = Math.max(12, layer.thick * 4);
                                    if (layer.thick < 0.2) h = 4; // Thin membranes
                                    
                                    return (
                                        <div key={layer.uid} className="w-full flex" style={{height: `${h}px`}}>
                                            {/* Scale Bar */}
                                            <div className="w-12 border-r border-black/20 flex flex-col justify-center items-end pr-2 text-[9px] font-mono text-slate-500 leading-none">
                                                {layer.thick}
                                            </div>
                                            {/* Layer Graphic */}
                                            <div 
                                                className="flex-1 relative border-b border-black/10"
                                                style={{
                                                    backgroundColor: mat.color, 
                                                    opacity: 0.8
                                                }}
                                            >
                                                {/* Pattern Overlay */}
                                                <div className="absolute inset-0 w-full h-full">
                                                   <svg width="100%" height="100%" preserveAspectRatio="none">
                                                      <rect width="100%" height="100%" fill={`url(#${mat.pattern})`} />
                                                   </svg>
                                                </div>
                                                
                                                {/* Number Marker */}
                                                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-5 h-5 bg-white border border-black rounded-full flex items-center justify-center text-[10px] text-black font-bold z-10 shadow-sm">
                                                    {idx + 1}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                             </div>

                             {/* LEGEND TABLE */}
                             <div className="mt-auto">
                                <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-2 border-b border-black/10 pb-1">Legenda Materiali</h4>
                                <table className="w-full text-[9px] text-left">
                                    <thead>
                                        <tr className="text-slate-500 border-b border-gray-200">
                                            <th className="py-1 w-6">#</th>
                                            <th className="py-1">Materiale</th>
                                            <th className="py-1 text-right">Spess. (cm)</th>
                                            <th className="py-1 text-right">λ (W/mK)</th>
                                            <th className="py-1 text-right">R (m²K/W)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-slate-900">
                                        {layers.map((l, i) => {
                                            const m = MATERIALS_DB.find(x => x.id === l.materialId);
                                            if(!m) return null;
                                            const r = m.lambda > 0 ? (l.thick/100)/m.lambda : 0;
                                            return (
                                                <tr key={l.uid} className="border-b border-gray-100 last:border-0">
                                                    <td className="py-1 font-bold">{i+1}</td>
                                                    <td className="py-1">{m.name}</td>
                                                    <td className="py-1 text-right font-mono">{l.thick}</td>
                                                    <td className="py-1 text-right font-mono text-slate-500">{m.lambda > 0 ? m.lambda : '-'}</td>
                                                    <td className="py-1 text-right font-mono font-bold">{r > 0 ? r.toFixed(3) : '-'}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                             </div>
                        </div>
                    </div>
                </div>

                {/* RESULTS DASHBOARD */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
                    <div className="bg-orange-500 text-white rounded-xl p-4 shadow-lg shadow-orange-900/20 print:shadow-none print:border print:border-black print:text-black print:bg-white">
                        <div className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Trasmittanza U</div>
                        <div className="text-3xl font-black font-mono">{results.U} <span className="text-sm font-sans">W/m²K</span></div>
                        <div className="text-[9px] mt-1 opacity-70">R_tot: {results.R} m²K/W</div>
                    </div>
                    
                    <div className="bg-slate-800 text-white rounded-xl p-4 border border-white/5 print:border-black print:text-black print:bg-white">
                        <div className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Massa Superf.</div>
                        <div className="text-2xl font-bold font-mono">{results.Mass} <span className="text-sm font-sans">kg/m²</span></div>
                    </div>

                    <div className="bg-slate-800 text-white rounded-xl p-4 border border-white/5 print:border-black print:text-black print:bg-white">
                        <div className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Spessore Tot.</div>
                        <div className="text-2xl font-bold font-mono">{results.Thick} <span className="text-sm font-sans">cm</span></div>
                    </div>

                    <div className="bg-slate-800 text-white rounded-xl p-4 border border-white/5 print:border-black print:text-black print:bg-white">
                        <div className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Sfasamento (Est)</div>
                        <div className="text-lg font-bold font-mono leading-tight">{results.Lag}</div>
                        <div className="text-[9px] mt-1 opacity-50">Capacità: {results.Capacity} kJ/m²K</div>
                    </div>
                </div>

                <div className="hidden print:block mt-6 pt-4 border-t border-black text-[9px] text-gray-500 text-center">
                    Documento generato automaticamente. I valori sono indicativi e devono essere verificati da un termotecnico abilitato secondo le normative vigenti (UNI EN ISO 6946).
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
                  Costruzione di pacchetti stratigrafici personalizzati per coperture e pareti. Calcolo immediato di Trasmittanza (U), Resistenza termica totale (R) e parametri massivi (kg/mq).
              </div>
              <div>
                  <strong className="text-slate-300 block mb-1">Modalità d'Uso</strong>
                  Seleziona i materiali dalla libreria a sinistra. Ordina i livelli (dall'esterno all'interno) e modifica gli spessori. Genera un report PDF completo con il diagramma.
              </div>
              <div>
                  <strong className="text-slate-300 block mb-1">Riferimenti Normativi</strong>
                  Calcolo U secondo UNI EN ISO 6946. Comprende resistenze liminari (Rsi, Rse) per flusso termico ascendente (coperture).
              </div>
          </div>
      </div>
    </div>
  );
}
