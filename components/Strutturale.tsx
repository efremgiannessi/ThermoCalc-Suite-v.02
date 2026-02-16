
import { useState, useMemo } from 'react';
import { Trello, Construction, Box, Scale, ArrowDownToLine, Wind, Info } from 'lucide-react';

interface Props {
  showToast: (msg: string) => void;
}

type Mode = 'statica' | 'carichi' | 'sezioni' | 'plinto' | 'vento';

// --- DATI VENTO NTC 2018 ---
const ZONES_NTC = [
    { id: 1, label: 'Zona 1 (Valle d\'Aosta, Piemonte, Lombardia...)', vb0: 25, a0: 1000, ks: 0.40 },
    { id: 2, label: 'Zona 2 (Toscana, Marche, Umbria, Lazio...)', vb0: 27, a0: 750, ks: 0.40 },
    { id: 3, label: 'Zona 3 (Liguria, Toscana costa, Lazio costa...)', vb0: 27, a0: 500, ks: 0.37 },
    { id: 4, label: 'Zona 4 (Sicilia e Sardegna - parte)', vb0: 28, a0: 500, ks: 0.36 },
    { id: 5, label: 'Zona 5 (Sicilia e Sardegna - parte)', vb0: 30, a0: 750, ks: 0.35 },
    { id: 6, label: 'Zona 6 (Calabria, Basilicata...)', vb0: 28, a0: 500, ks: 0.30 },
    { id: 7, label: 'Zona 7 (Puglia, Molise...)', vb0: 28, a0: 500, ks: 0.29 },
    { id: 8, label: 'Zona 8 (Emilia Romagna costa)', vb0: 30, a0: 500, ks: 0.29 },
    { id: 9, label: 'Zona 9 (Isole minori)', vb0: 31, a0: 500, ks: 0.28 },
];

const EXPOSURE_CATS = [
    { id: 'I', label: 'Cat. I - Mare, costiera (k_r=0.17)', kr: 0.17, z0: 0.01, zmin: 2 },
    { id: 'II', label: 'Cat. II - Aperta campagna (k_r=0.19)', kr: 0.19, z0: 0.05, zmin: 4 },
    { id: 'III', label: 'Cat. III - Suburbana (k_r=0.20)', kr: 0.20, z0: 0.10, zmin: 5 },
    { id: 'IV', label: 'Cat. IV - Urbana (k_r=0.22)', kr: 0.22, z0: 0.30, zmin: 8 },
    { id: 'V', label: 'Cat. V - Centri storici (k_r=0.23)', kr: 0.23, z0: 0.70, zmin: 12 },
];

export default function Strutturale({ showToast }: Props) {
  const [mode, setMode] = useState<Mode>('statica');

  // --- STATICA TRAVE ---
  const [span, setSpan] = useState<string>('5.00'); // Luce (m)
  const [load, setLoad] = useState<string>('10.00'); // Carico Distribuito (kN/m)
  
  const staticRes = useMemo(() => {
      const L = parseFloat(span) || 0;
      const q = parseFloat(load) || 0;
      
      if(L > 0 && q > 0) {
          const M = (q * Math.pow(L, 2)) / 8;
          const V = (q * L) / 2;
          const R = V;
          return { M, V, R };
      }
      return { M: 0, V: 0, R: 0 };
  }, [span, load]);

  // --- COMBINAZIONE CARICHI (SLU) ---
  const [g1, setG1] = useState<string>(''); // Peso Proprio
  const [g2, setG2] = useState<string>(''); // Permanenti
  const [qk, setQk] = useState<string>(''); // Variabili
  
  const loadRes = useMemo(() => {
      const vG1 = parseFloat(g1) || 0;
      const vG2 = parseFloat(g2) || 0;
      const vQk = parseFloat(qk) || 0;
      
      const slu = (1.3 * vG1) + (1.5 * vG2) + (1.5 * vQk);
      const sle = vG1 + vG2 + vQk;
      
      return { slu, sle };
  }, [g1, g2, qk]);

  // --- SEZIONI (RETTANGOLARE) ---
  const [b, setB] = useState<string>('30'); // cm
  const [h, setH] = useState<string>('50'); // cm
  
  const sectionRes = useMemo(() => {
      const vB = parseFloat(b) || 0;
      const vH = parseFloat(h) || 0;
      
      if (vB > 0 && vH > 0) {
          const Area = vB * vH; 
          const J = (vB * Math.pow(vH, 3)) / 12;
          const W = (vB * Math.pow(vH, 2)) / 6;
          
          return { Area, J, W };
      }
      return { Area: 0, J: 0, W: 0 };
  }, [b, h]);

  // --- PLINTO DI FONDAZIONE ---
  const [plintoN, setPlintoN] = useState<string>('800'); // kN (SLU)
  const [sigmaT, setSigmaT] = useState<string>('2.0'); // kg/cm2 (daN/cm2)
  const [colSide, setColSide] = useState<string>('30'); // cm (lato pilastro quadrato)

  const plintoRes = useMemo(() => {
      const N_kn = parseFloat(plintoN) || 0; // kN
      const sigma = parseFloat(sigmaT) || 0; // kg/cm2
      const c = parseFloat(colSide) || 0; // cm

      if(N_kn > 0 && sigma > 0) {
          // Conversione N in kg (daN) approx
          const N_kg = N_kn * 100;
          const N_tot = N_kg * 1.10;
          const Area_min = N_tot / sigma;
          const B_min = Math.sqrt(Area_min);
          const B_design = Math.ceil(B_min / 5) * 5;
          const H_rigid = (B_design - c) / 2;
          const H_design = Math.ceil(H_rigid / 5) * 5; 
          const Vol = (B_design/100) * (B_design/100) * (H_design/100); // mc
          const W_plinto = Vol * 2500; // kg
          const Sigma_real = (N_kg + W_plinto) / (B_design * B_design);

          return { B: B_design, H: H_design, W: W_plinto, Sigma: Sigma_real, Vol: Vol };
      }
      return { B: 0, H: 0, W: 0, Sigma: 0, Vol: 0 };
  }, [plintoN, sigmaT, colSide]);

  // --- VENTO NTC 2018 ---
  const [windZoneId, setWindZoneId] = useState<number>(1);
  const [windAlt, setWindAlt] = useState<string>('100'); // m
  const [windExpCat, setWindExpCat] = useState<string>('III');
  const [windZ, setWindZ] = useState<string>('10'); // Altezza edificio
  const [windCp, setWindCp] = useState<string>('0.8'); // Coeff pressione +1.0 o +0.8

  const windRes = useMemo(() => {
      const z = parseFloat(windZ) || 0;
      const as = parseFloat(windAlt) || 0;
      const cp = parseFloat(windCp) || 0.8;
      
      const zone = ZONES_NTC.find(z => z.id === windZoneId) || ZONES_NTC[0];
      const exp = EXPOSURE_CATS.find(e => e.id === windExpCat) || EXPOSURE_CATS[2];

      // 1. Calcolo vb (Velocità Riferimento)
      // ca = 1 per as <= a0
      // ca = 1 + ks * (as/a0 - 1) per a0 < as <= 1500
      let ca = 1;
      if (as > zone.a0) {
          ca = 1 + zone.ks * (as / zone.a0 - 1);
      }
      const vb = zone.vb0 * ca; // m/s

      // 2. Pressione Cinetica Base qb (N/m2) = 0.5 * rho * vb^2. Rho = 1.25 kg/m3
      const qb = 0.5 * 1.25 * Math.pow(vb, 2); // N/m2

      // 3. Coefficiente di Esposizione Ce(z)
      // z_calc = max(z, zmin)
      const z_calc = Math.max(z, exp.zmin);
      const ct = 1; // Coeff topografia (semplificato a 1)
      
      // Formula NTC 3.3.7: Ce(z) = kr^2 * ct * ln(z/z0) * [7 + ct * ln(z/z0)]
      const ln_z_z0 = Math.log(z_calc / exp.z0);
      const ce = Math.pow(exp.kr, 2) * ct * ln_z_z0 * (7 + ct * ln_z_z0);

      // 4. Pressione del Vento p = qb * Ce * Cp * Cd (Cd=1)
      // p in N/m2 -> Convertire in kN/m2 (/1000) o kg/m2 (/9.81)
      const p_pa = qb * ce * cp;
      const p_kn = p_pa / 1000;
      const p_kg = p_pa / 9.81;

      return {
          vb: vb,
          qb: qb,
          ce: ce,
          p_kn: p_kn,
          p_kg: p_kg,
          z_calc: z_calc
      };
  }, [windZoneId, windAlt, windExpCat, windZ, windCp]);

  const copy = (t: string) => {
    navigator.clipboard.writeText(t);
    showToast('Copiato!');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-slide-in pb-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 no-print">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="bg-rose-500/20 w-10 h-10 rounded-xl flex items-center justify-center text-rose-500 border border-rose-500/20">
                    <Trello size={20} />
                </span>
                Analisi Strutturale Rapida
            </h2>
            
            <div className="bg-black/20 p-1 rounded-xl flex border border-white/10 overflow-x-auto custom-scrollbar">
                <button 
                    onClick={() => setMode('statica')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all whitespace-nowrap flex items-center gap-2 ${mode === 'statica' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                    <Construction size={14} /> Trave App.
                </button>
                <button 
                    onClick={() => setMode('carichi')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all whitespace-nowrap flex items-center gap-2 ${mode === 'carichi' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                    <Scale size={14} /> Carichi NTC
                </button>
                <button 
                    onClick={() => setMode('sezioni')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all whitespace-nowrap flex items-center gap-2 ${mode === 'sezioni' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                    <Box size={14} /> Inerzia
                </button>
                <button 
                    onClick={() => setMode('plinto')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all whitespace-nowrap flex items-center gap-2 ${mode === 'plinto' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                    <ArrowDownToLine size={14} /> Plinto
                </button>
                <button 
                    onClick={() => setMode('vento')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all whitespace-nowrap flex items-center gap-2 ${mode === 'vento' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                    <Wind size={14} /> Vento NTC
                </button>
            </div>
        </div>

        {/* --- STATICA TRAVE --- */}
        {mode === 'statica' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass-panel rounded-2xl p-6 border-rose-500/10">
                        <h3 className="text-sm font-bold text-rose-500 uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Dati Statici</h3>
                        <div className="space-y-5">
                            <div>
                                <label className="industrial-label">Luce di Calcolo (L)</label>
                                <div className="relative">
                                    <input type="number" value={span} onChange={e=>setSpan(e.target.value)} className="w-full glass-input rounded-xl p-3 font-mono text-white outline-none focus:border-rose-500/50" />
                                    <span className="absolute right-4 top-3.5 text-xs text-slate-500 font-bold">m</span>
                                </div>
                            </div>
                            <div>
                                <label className="industrial-label">Carico Uniforme (q)</label>
                                <div className="relative">
                                    <input type="number" value={load} onChange={e=>setLoad(e.target.value)} className="w-full glass-input rounded-xl p-3 font-mono text-white outline-none focus:border-rose-500/50" />
                                    <span className="absolute right-4 top-3.5 text-xs text-slate-500 font-bold">kN/m</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8 space-y-6">
                    <div className="glass-panel rounded-2xl p-8 bg-gradient-to-b from-slate-800/30 to-slate-900/30 min-h-[200px] flex flex-col justify-between relative border-rose-500/10">
                        <div className="absolute top-4 right-4 text-[10px] text-slate-500 font-mono">SCHEMA STATICO</div>
                        <svg viewBox="0 0 400 150" className="w-full h-full">
                            {[20, 60, 100, 140, 180, 220, 260, 300, 340, 380].map(x => (
                                <g key={x}><line x1={x} y1="20" x2={x} y2="60" stroke="#fb7185" strokeWidth="2" /></g>
                            ))}
                            <line x1="20" y1="20" x2="380" y2="20" stroke="#fb7185" strokeWidth="2" />
                            <text x="200" y="15" fill="#fb7185" fontSize="10" fontWeight="bold" textAnchor="middle">q = {load} kN/m</text>
                            <line x1="20" y1="65" x2="380" y2="65" stroke="#e2e8f0" strokeWidth="4" />
                            <path d="M20 65 L10 85 L30 85 Z" fill="#94a3b8" />
                            <path d="M380 65 L370 85 L390 85 Z" fill="#94a3b8" />
                            <path d="M20 65 Q 200 140 380 65" fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4 2" opacity="0.6"/>
                            <text x="200" y="110" fill="#f43f5e" fontSize="10" fontWeight="bold" textAnchor="middle">M_max</text>
                        </svg>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-rose-950/20 border border-rose-500/20 rounded-xl p-4 text-center cursor-pointer hover:bg-rose-900/20 transition-colors" onClick={()=>copy(staticRes.M.toFixed(2))}>
                            <div className="text-[10px] text-rose-400 uppercase font-bold mb-1">Momento M_max</div>
                            <div className="text-3xl font-black text-white font-mono">{staticRes.M.toFixed(2)}</div>
                            <div className="text-[10px] text-slate-500">kN·m</div>
                        </div>
                        <div className="bg-slate-800/50 border border-white/5 rounded-xl p-4 text-center">
                            <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Taglio V_max</div>
                            <div className="text-2xl font-bold text-white font-mono">{staticRes.V.toFixed(2)}</div>
                            <div className="text-[10px] text-slate-500">kN</div>
                        </div>
                        <div className="bg-slate-800/50 border border-white/5 rounded-xl p-4 text-center">
                            <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Reazioni (Ra = Rb)</div>
                            <div className="text-2xl font-bold text-white font-mono">{staticRes.R.toFixed(2)}</div>
                            <div className="text-[10px] text-slate-500">kN</div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- CARICHI NTC --- */}
        {mode === 'carichi' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                <div className="glass-panel rounded-2xl p-6 border-orange-500/10">
                    <h3 className="text-sm font-bold text-orange-500 uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Analisi dei Carichi (kN/m²)</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="industrial-label">G1 - Peso Proprio</label><input type="number" value={g1} onChange={e=>setG1(e.target.value)} className="w-full glass-input rounded-xl p-3 text-white" placeholder="0.00" /></div>
                            <div className="flex items-end pb-3 text-xs text-slate-500 font-mono">x 1.30</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="industrial-label">G2 - Permanenti</label><input type="number" value={g2} onChange={e=>setG2(e.target.value)} className="w-full glass-input rounded-xl p-3 text-white" placeholder="0.00" /></div>
                            <div className="flex items-end pb-3 text-xs text-slate-500 font-mono">x 1.50</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="industrial-label">Qk - Variabili</label><input type="number" value={qk} onChange={e=>setQk(e.target.value)} className="w-full glass-input rounded-xl p-3 text-white" placeholder="0.00" /></div>
                            <div className="flex items-end pb-3 text-xs text-slate-500 font-mono">x 1.50</div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col justify-center space-y-4">
                    <div className="glass-panel rounded-2xl p-8 bg-orange-950/20 border-orange-500/20 text-center" onClick={()=>copy(loadRes.slu.toFixed(2))}>
                        <div className="industrial-label text-orange-500 !mb-2 flex items-center justify-center gap-2"><Scale size={14}/> Carico SLU (Design)</div>
                        <div className="text-5xl font-black text-white font-mono">{loadRes.slu.toFixed(2)}</div>
                        <div className="text-sm text-orange-300/60 mt-2 font-mono">kN/m²</div>
                    </div>
                    <div className="glass-panel rounded-2xl p-4 text-center border border-white/5">
                        <div className="industrial-label text-slate-500">Carico SLE (Raro)</div>
                        <div className="text-2xl font-bold text-white font-mono">{loadRes.sle.toFixed(2)} <span className="text-xs text-slate-500">kN/m²</span></div>
                    </div>
                </div>
            </div>
        )}

        {/* --- SEZIONI --- */}
        {mode === 'sezioni' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                <div className="glass-panel rounded-2xl p-6 border-indigo-500/10">
                    <h3 className="text-sm font-bold text-indigo-500 uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Geometria Sezione (Rettangolare)</h3>
                    <div className="flex gap-8 items-center">
                        <div className="w-32 h-40 border-2 border-white/20 relative flex items-center justify-center bg-white/5">
                            <div className="absolute -left-6 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 rotate-270">H</div>
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-400">B</div>
                            <div className="w-1 h-1 bg-indigo-500 rounded-full"></div>
                        </div>
                        <div className="flex-1 space-y-4">
                            <div><label className="industrial-label">Base (cm)</label><input type="number" value={b} onChange={e=>setB(e.target.value)} className="w-full glass-input rounded-xl p-3 text-white" /></div>
                            <div><label className="industrial-label">Altezza (cm)</label><input type="number" value={h} onChange={e=>setH(e.target.value)} className="w-full glass-input rounded-xl p-3 text-white" /></div>
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="glass-panel rounded-2xl p-6 flex justify-between items-center bg-indigo-950/20 border-indigo-500/20">
                        <div><div className="text-[10px] text-indigo-400 uppercase font-bold">Momento Inerzia (Jx)</div><div className="text-[9px] text-slate-500 font-mono">bh³/12</div></div>
                        <div className="text-right"><div className="text-3xl font-black text-white font-mono">{sectionRes.J.toLocaleString('it-IT', {maximumFractionDigits: 0})}</div><div className="text-xs text-slate-500">cm⁴</div></div>
                    </div>
                    <div className="glass-panel rounded-2xl p-6 flex justify-between items-center border border-white/5">
                        <div><div className="text-[10px] text-slate-400 uppercase font-bold">Modulo Resistenza (Wx)</div><div className="text-[9px] text-slate-600 font-mono">bh²/6</div></div>
                        <div className="text-right"><div className="text-2xl font-bold text-white font-mono">{sectionRes.W.toLocaleString('it-IT', {maximumFractionDigits: 0})}</div><div className="text-xs text-slate-500">cm³</div></div>
                    </div>
                    <div className="glass-panel rounded-2xl p-6 flex justify-between items-center border border-white/5">
                        <div><div className="text-[10px] text-slate-400 uppercase font-bold">Area (A)</div></div>
                        <div className="text-right"><div className="text-2xl font-bold text-white font-mono">{sectionRes.Area.toLocaleString('it-IT')}</div><div className="text-xs text-slate-500">cm²</div></div>
                    </div>
                </div>
            </div>
        )}

        {/* --- PLINTO --- */}
        {mode === 'plinto' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass-panel rounded-2xl p-6 border-emerald-500/10">
                        <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Dati Geotecnici & Carico</h3>
                        <div className="space-y-5">
                            <div>
                                <label className="industrial-label">Carico Assiale SLU (Ned)</label>
                                <div className="relative">
                                    <input type="number" value={plintoN} onChange={e=>setPlintoN(e.target.value)} className="w-full glass-input rounded-xl p-3 font-mono text-white outline-none focus:border-emerald-500/50" placeholder="0" />
                                    <span className="absolute right-4 top-3.5 text-xs text-slate-500 font-bold">kN</span>
                                </div>
                            </div>
                            <div>
                                <label className="industrial-label">Portata Terreno (σ_amm)</label>
                                <div className="relative">
                                    <input type="number" value={sigmaT} onChange={e=>setSigmaT(e.target.value)} className="w-full glass-input rounded-xl p-3 font-mono text-white outline-none focus:border-emerald-500/50" placeholder="0.0" />
                                    <span className="absolute right-4 top-3.5 text-xs text-slate-500 font-bold">kg/cm²</span>
                                </div>
                            </div>
                            <div>
                                <label className="industrial-label">Lato Pilastro (Quadro)</label>
                                <div className="relative">
                                    <input type="number" value={colSide} onChange={e=>setColSide(e.target.value)} className="w-full glass-input rounded-xl p-3 font-mono text-white outline-none focus:border-emerald-500/50" placeholder="0" />
                                    <span className="absolute right-4 top-3.5 text-xs text-slate-500 font-bold">cm</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 text-[9px] text-slate-500 bg-white/5 p-3 rounded-lg">
                            * Dimensionamento per plinto rigido (diffusione 45°) con peso proprio stimato (+10%). Verifica a carico centrato.
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8 space-y-6">
                    <div className="glass-panel rounded-2xl p-8 bg-gradient-to-b from-slate-800/30 to-slate-900/30 min-h-[220px] relative border-emerald-500/10 flex items-center justify-center">
                        <div className="absolute top-4 right-4 text-[10px] text-slate-500 font-mono">SEZIONE PLINTO</div>
                        
                        {/* Plinto SVG Visualization */}
                        <svg viewBox="0 0 300 180" className="h-full drop-shadow-xl">
                            {/* Ground Line */}
                            <line x1="20" y1="150" x2="280" y2="150" stroke="#64748b" strokeWidth="1" strokeDasharray="4 2"/>
                            
                            {/* Column */}
                            <rect x="135" y="20" width="30" height="60" fill="#334155" stroke="#94a3b8" strokeWidth="1"/>
                            <text x="150" y="45" fill="#e2e8f0" fontSize="8" textAnchor="middle" fontWeight="bold">Pilastro</text>
                            
                            {/* Load Arrow */}
                            <line x1="150" y1="5" x2="150" y2="20" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrow-rose)"/>
                            <text x="160" y="15" fill="#ef4444" fontSize="10" fontWeight="bold">N</text>

                            {/* Plinto Body */}
                            <path d="M80 150 L220 150 L220 110 L165 80 L135 80 L80 110 Z" fill="#475569" stroke="#e2e8f0" strokeWidth="2"/>
                            
                            {/* Dimensions */}
                            <line x1="80" y1="165" x2="220" y2="165" stroke="#10b981" strokeWidth="1"/>
                            <line x1="80" y1="162" x2="80" y2="168" stroke="#10b981" strokeWidth="1"/>
                            <line x1="220" y1="162" x2="220" y2="168" stroke="#10b981" strokeWidth="1"/>
                            <text x="150" y="175" fill="#10b981" fontSize="10" fontWeight="bold" textAnchor="middle">B = {plintoRes.B} cm</text>

                            <line x1="60" y1="150" x2="60" y2="80" stroke="#10b981" strokeWidth="1"/>
                            <line x1="57" y1="150" x2="63" y2="150" stroke="#10b981" strokeWidth="1"/>
                            <line x1="57" y1="80" x2="63" y2="80" stroke="#10b981" strokeWidth="1"/>
                            <text x="50" y="120" fill="#10b981" fontSize="10" fontWeight="bold" textAnchor="end">H = {plintoRes.H} cm</text>

                            {/* Rigid Cone */}
                            <line x1="135" y1="80" x2="80" y2="135" stroke="#fbbf24" strokeWidth="1" strokeDasharray="2 2" opacity="0.6"/>
                            <text x="100" y="100" fill="#fbbf24" fontSize="8" opacity="0.8">45°</text>
                        </svg>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-4 text-center cursor-pointer hover:bg-emerald-900/20 transition-colors" onClick={()=>copy(plintoRes.B.toString())}>
                            <div className="text-[10px] text-emerald-400 uppercase font-bold mb-1">Lato Base (B)</div>
                            <div className="text-3xl font-black text-white font-mono">{plintoRes.B}</div>
                            <div className="text-[10px] text-slate-500">cm (Quadro)</div>
                        </div>
                        <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-4 text-center cursor-pointer hover:bg-emerald-900/20 transition-colors" onClick={()=>copy(plintoRes.H.toString())}>
                            <div className="text-[10px] text-emerald-400 uppercase font-bold mb-1">Altezza (H)</div>
                            <div className="text-3xl font-black text-white font-mono">{plintoRes.H}</div>
                            <div className="text-[10px] text-slate-500">cm (Rigido)</div>
                        </div>
                        <div className="bg-slate-800/50 border border-white/5 rounded-xl p-4 flex flex-col justify-center gap-1 col-span-2 lg:col-span-1">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-slate-400 uppercase font-bold">Peso Proprio</span>
                                <span className="text-sm font-mono text-white">{plintoRes.W.toFixed(0)} kg</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-slate-400 uppercase font-bold">Sigma Terreno</span>
                                <span className={`text-sm font-mono font-bold ${plintoRes.Sigma > parseFloat(sigmaT) ? 'text-red-500' : 'text-emerald-400'}`}>{plintoRes.Sigma.toFixed(2)} kg/cm²</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-slate-400 uppercase font-bold">Calcestruzzo</span>
                                <span className="text-sm font-mono text-white">{plintoRes.Vol.toFixed(2)} m³</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- VENTO NTC 2018 --- */}
        {mode === 'vento' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
                <div className="lg:col-span-5 space-y-6">
                    <div className="glass-panel rounded-2xl p-6 border-sky-500/10">
                        <h3 className="text-sm font-bold text-sky-500 uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Parametri Ambientali NTC</h3>
                        <div className="space-y-5">
                            <div>
                                <label className="industrial-label">Zona Vento</label>
                                <select 
                                    value={windZoneId} 
                                    onChange={(e) => setWindZoneId(parseInt(e.target.value))}
                                    className="w-full glass-input rounded-xl p-3 text-white outline-none cursor-pointer"
                                >
                                    {ZONES_NTC.map(z => (
                                        <option key={z.id} value={z.id} className="bg-app-panel">{z.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="industrial-label">Altitudine s.l.m. (m)</label>
                                <input type="number" value={windAlt} onChange={e=>setWindAlt(e.target.value)} className="w-full glass-input rounded-xl p-3 text-white font-mono" />
                            </div>
                            <div>
                                <label className="industrial-label">Categoria Esposizione</label>
                                <select 
                                    value={windExpCat} 
                                    onChange={(e) => setWindExpCat(e.target.value)}
                                    className="w-full glass-input rounded-xl p-3 text-white outline-none cursor-pointer"
                                >
                                    {EXPOSURE_CATS.map(e => (
                                        <option key={e.id} value={e.id} className="bg-app-panel">{e.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="h-px bg-white/5 my-2"></div>
                            <div>
                                <label className="industrial-label">Altezza Edificio z (m)</label>
                                <input type="number" value={windZ} onChange={e=>setWindZ(e.target.value)} className="w-full glass-input rounded-xl p-3 text-white font-mono text-lg border-sky-500/30 focus:border-sky-500" />
                            </div>
                            <div>
                                <label className="industrial-label">Coeff. Aerodinamico (Cp)</label>
                                <input type="number" step="0.1" value={windCp} onChange={e=>setWindCp(e.target.value)} className="w-full glass-input rounded-xl p-3 text-white font-mono" placeholder="es. 0.8 o 1.2" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-7 space-y-6">
                    <div className="glass-panel rounded-2xl p-8 bg-sky-950/10 border-sky-500/20 flex flex-col items-center justify-center relative min-h-[300px]">
                        <div className="absolute top-4 right-4 text-[10px] text-sky-500/50 font-mono">RISULTATI DI CALCOLO</div>
                        
                        <div className="w-full max-w-sm text-center mb-8" onClick={()=>copy(windRes.p_kn.toFixed(2))}>
                            <div className="industrial-label text-sky-400 !mb-2 flex items-center justify-center gap-2">Pressione Vento SLU</div>
                            <div className="text-6xl font-black text-white font-mono flex justify-center items-baseline gap-2">
                                {windRes.p_kn.toFixed(2)} 
                                <span className="text-xl text-slate-500 font-sans font-bold">kN/m²</span>
                            </div>
                            <div className="text-xs text-sky-300/60 mt-2 font-mono">≈ {windRes.p_kg.toFixed(0)} kg/m²</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full">
                            <div className="bg-slate-800/50 rounded-xl p-3 border border-white/5">
                                <div className="text-[9px] text-slate-400 uppercase font-bold mb-1">Velocità Rif. vb</div>
                                <div className="text-lg font-mono text-white">{windRes.vb.toFixed(1)} m/s</div>
                            </div>
                            <div className="bg-slate-800/50 rounded-xl p-3 border border-white/5">
                                <div className="text-[9px] text-slate-400 uppercase font-bold mb-1">Press. Cinetica qb</div>
                                <div className="text-lg font-mono text-white">{(windRes.qb/1000).toFixed(3)} kN/m²</div>
                            </div>
                            <div className="bg-slate-800/50 rounded-xl p-3 border border-white/5">
                                <div className="text-[9px] text-slate-400 uppercase font-bold mb-1">Coeff. Esposizione Ce</div>
                                <div className="text-lg font-mono text-sky-400 font-bold">{windRes.ce.toFixed(2)}</div>
                            </div>
                            <div className="bg-slate-800/50 rounded-xl p-3 border border-white/5">
                                <div className="text-[9px] text-slate-400 uppercase font-bold mb-1">Altezza Calc. z</div>
                                <div className="text-lg font-mono text-white">{windRes.z_calc.toFixed(1)} m</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-[10px] text-slate-400 leading-relaxed flex gap-3">
                        <Wind size={16} className="shrink-0 text-sky-500" />
                        <div>
                            Calcolo semplificato per pressione statica equivalente su superficie verticale secondo NTC 2018 (Eq. 3.3.1).
                            <br/>Formula: p = qb * Ce(z) * Cp * Cd (con Cd=1).
                            <br/>La pressione cinetica qb assume densità aria 1.25 kg/m³.
                        </div>
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
                  Modulo per il pre-dimensionamento rapido di elementi strutturali. Calcolo statico trave singola, combinazione carichi SLU/SLE, proprietà geometriche e inerziali sezioni, dimensionamento plinti e pressione vento.
              </div>
              <div>
                  <strong className="text-slate-300 block mb-1">Modalità d'Uso</strong>
                  Seleziona il modulo (Trave, Carichi, Inerzia, Plinto, Vento). Inserisci i parametri geometrici e di carico. I risultati si aggiornano in tempo reale.
              </div>
              <div>
                  <strong className="text-slate-300 block mb-1">Riferimenti Normativi</strong>
                  NTC 2018 (DM 17/01/2018). Coeff. Sicurezza SLU (1.3 G1, 1.5 G2/Q). Vento secondo cap. 3.3. Plinti ipotizzati rigidi (diffusione 45°).
              </div>
          </div>
      </div>
    </div>
  );
}
