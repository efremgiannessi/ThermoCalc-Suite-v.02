import React, { useState, useEffect } from 'react';
import { RotateCcw, ShieldCheck, LineChart as LineChartIcon, BookOpen } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import InputControl from './InputControl';
import ResultCard from './ResultCard';

interface Props {
  showToast: (msg: string) => void;
}

// --- DATA CONSTANTS ---

const MATERIALS = [
  { label: 'EPS 80', value: 0.036 },
  { label: 'EPS 100', value: 0.035 },
  { label: 'EPS 120', value: 0.034 },
  { label: 'EPS 150', value: 0.033 },
  { label: 'EPS 200', value: 0.032 },
  { label: 'EPS 200 GRAFITATO', value: 0.030 },
  { label: 'LANA ROCCIA FLATROOK 70', value: 0.039 },
  { label: 'LANA ROCCIA FLATROOK 60', value: 0.038 },
  { label: 'LANA ROCCIA FLATROOK 50', value: 0.036 },
  { label: 'LANA DI VETRO', value: 0.045 },
];

const CLIMATE_ZONES = ['A', 'B', 'C', 'D', 'E', 'F'];

const SURFACES = [
  { label: 'Opache Verticali (Muri)', value: 'vert' },
  { label: 'Opache Orizzontali (Tetti)', value: 'horiz' },
  { label: 'Chiusure Trasparenti', value: 'transp' },
];

// Reference U-Values (Approximation based on standard IT Limits 2015/2021)
// Format: [Vert, Horiz, Transp]
const U_LIMITS: Record<string, number[]> = {
  'A': [0.43, 0.35, 3.00],
  'B': [0.43, 0.35, 3.00],
  'C': [0.34, 0.33, 2.00],
  'D': [0.29, 0.26, 1.80],
  'E': [0.26, 0.22, 1.40],
  'F': [0.24, 0.20, 1.10], // Strict
};

export default function IsoCalc({ showToast }: Props) {
  // --- STATE ---
  const [selectedMat, setSelectedMat] = useState<string>('');
  const [lambda, setLambda] = useState<string>('');
  
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [selectedSurface, setSelectedSurface] = useState<string>('');
  const [targetU, setTargetU] = useState<string>('');
  
  const [result, setResult] = useState<number | null>(null);

  // --- HANDLERS ---

  const handleMaterialChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedMat(val);
    const mat = MATERIALS.find(m => m.label === val);
    if (mat) {
      setLambda(mat.value.toString());
    }
  };

  const handleZoneChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSelectedZone(e.target.value);
  };

  const handleSurfaceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSelectedSurface(e.target.value);
  };

  // Auto-fill Target U when Zone or Surface changes
  useEffect(() => {
    if (selectedZone && selectedSurface) {
      const limits = U_LIMITS[selectedZone];
      let uVal = 0;
      if (selectedSurface === 'vert') uVal = limits[0];
      if (selectedSurface === 'horiz') uVal = limits[1];
      if (selectedSurface === 'transp') uVal = limits[2];
      
      if (uVal > 0) setTargetU(uVal.toString());
    }
  }, [selectedZone, selectedSurface]);

  // Real-time Calculation
  useEffect(() => {
    const l = parseFloat(lambda.replace(',', '.'));
    const u = parseFloat(targetU.replace(',', '.'));

    if (!isNaN(l) && !isNaN(u) && u !== 0) {
      // Formula: (Lambda / U) * 100 to get cm
      const thick = (l / u) * 100;
      setResult(thick);
    } else {
      setResult(null);
    }
  }, [lambda, targetU]);

  const handleReset = () => {
    setSelectedMat('');
    setLambda('');
    setSelectedZone('');
    setSelectedSurface('');
    setTargetU('');
    setResult(null);
    showToast("Parametri resettati");
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-slide-in pb-12">
        
        {/* IsoCalc Sticky Navbar (Contextual) */}
        <div className="sticky top-0 z-30 bg-app-bg/80 backdrop-blur-lg border-b border-white/5 -mx-6 px-6 py-4 flex items-center justify-between no-print">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                </div>
                <span className="text-xl font-black tracking-tighter text-white">Iso<span className="text-orange-500">Calc</span></span>
            </div>
            <button 
                onClick={handleReset}
                className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg flex items-center gap-2"
            >
                <RotateCcw size={10} /> Reset
            </button>
        </div>

        {/* SECTION 1: MATERIAL */}
        <section className="animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-widest">1. Materiale & Conducibilità</h2>
          </div>
          
          <div className="glass-panel rounded-2xl p-5 border-orange-500/10">
            <InputControl 
              label="Seleziona Materiale" 
              type="select" 
              value={selectedMat} 
              onChange={handleMaterialChange} 
              options={MATERIALS.map(m => ({ label: m.label, value: m.label }))}
            />
            
            <InputControl 
              label="Conducibilità Termica (λ)" 
              value={lambda} 
              onChange={(e) => setLambda(e.target.value)} 
              type="number"
              placeholder="0.035"
              suffix="W/mK"
            />
          </div>
        </section>

        {/* SECTION 2: TARGET */}
        <section className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-widest">2. Obiettivo Trasmittanza (U)</h2>
          </div>

          <div className="glass-panel rounded-2xl p-5 border-orange-500/10">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <InputControl 
                  label="Zona" 
                  type="select" 
                  value={selectedZone} 
                  onChange={handleZoneChange} 
                  options={CLIMATE_ZONES.map(z => ({ label: `ZONA ${z}`, value: z }))}
                />
              </div>
              <div className="col-span-2">
                <InputControl 
                  label="Superficie" 
                  type="select" 
                  value={selectedSurface} 
                  onChange={handleSurfaceChange} 
                  options={SURFACES}
                />
              </div>
            </div>

            <InputControl 
              label="Trasmittanza Obiettivo (U)" 
              value={targetU} 
              onChange={(e) => setTargetU(e.target.value)} 
              type="number"
              placeholder="0.26"
              suffix="W/m²K"
            />
          </div>
        </section>

        {/* RESULT STICKY */}
        <ResultCard result={result} />

        {/* CHART SECTION */}
        <section className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-widest">3. Analisi Prestazionale (U vs d)</h2>
          </div>
          <div className="glass-panel rounded-2xl p-6 border-orange-500/10 bg-app-panel/40 h-[300px]">
            <span className="industrial-label mb-4 flex items-center gap-2"><LineChartIcon size={12}/> Curve di Trasmittanza Termica</span>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={Array.from({length: 21}, (_, i) => {
                const d = i * 2; // cm
                const l = parseFloat(lambda) || 0.035;
                const u = d === 0 ? 5 : (l / (d / 100));
                return { d, u: parseFloat(u.toFixed(3)) };
              })}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="d" stroke="#4b5563" fontSize={10} label={{ value: 'Spessore (cm)', position: 'insideBottom', offset: -5, fontSize: 8, fill: '#4b5563' }} />
                <YAxis stroke="#4b5563" fontSize={10} label={{ value: 'U (W/m²K)', angle: -90, position: 'insideLeft', fontSize: 8, fill: '#4b5563' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0a0f1d', border: '1px solid #1f2937', borderRadius: '8px', fontSize: '10px' }} />
                <Line type="monotone" dataKey="u" stroke="#f97316" strokeWidth={2} dot={false} />
                {targetU && (
                  <ReferenceLine y={parseFloat(targetU)} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'right', value: 'Limite', fill: '#ef4444', fontSize: 8 }} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* ACADEMIC DESCRIPTION */}
        <section className="animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-widest">4. Approfondimento Accademico</h2>
          </div>
          <div className="glass-panel rounded-2xl p-6 border-orange-500/10 bg-app-panel/20 space-y-4">
            <div className="flex items-start gap-3">
              <BookOpen size={16} className="text-orange-500 mt-1 shrink-0" />
              <div className="text-[11px] text-slate-400 leading-relaxed">
                <p className="mb-2"><strong className="text-white">Fisica Tecnica Ambientale:</strong> Il calcolo dello spessore dell'isolante si basa sulla legge di Fourier per la conduzione stazionaria. La trasmittanza termica <em className="text-orange-400">U</em> è l'inverso della resistenza termica totale <em className="text-orange-400">Rt</em>.</p>
                <p className="font-mono text-[10px] bg-black/30 p-2 rounded border border-white/5 text-center">U = 1 / (Rsi + Σ(di / λi) + Rse)</p>
                <p className="mt-2">In questo modulo semplificato, consideriamo la resistenza superficiale interna ed esterna come trascurabili o già incluse nel target di progetto per isolare il contributo del solo strato coibente.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SPECIFIC FOOTER */}
        <div className="mt-12 py-8 border-t border-white/5 text-center no-print">
            <div className="flex flex-col items-center gap-6">
                
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/5 shadow-[0_0_15px_rgba(249,115,22,0.15)] animate-pulse">
                    <ShieldCheck size={12} className="text-orange-500" />
                    <span className="text-[10px] font-black text-orange-500 tracking-[0.2em] uppercase">IP Security Protocol</span>
                </div>

                {/* Credits */}
                <div className="space-y-1">
                    <h3 className="text-xl font-black uppercase tracking-tighter text-white">
                        Developed by <span className="text-orange-600">Efrem Giannessi</span>
                    </h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">
                        Concrete Optimization Engineering Solutions
                    </p>
                </div>

                {/* Disclaimer Box */}
                <div className="max-w-md w-full bg-black/40 rounded-lg p-4 border border-white/5">
                    <p className="text-[9px] text-slate-600 font-medium leading-relaxed uppercase tracking-wide">
                        Legal: Core algorithms are the exclusive property of Efrem Giannessi. Unauthorized reproduction or reverse engineering is strictly prohibited and protected by international IP laws.
                    </p>
                </div>

                {/* Link */}
                <a href="https://efremgiannessi.org" target="_blank" rel="noreferrer" className="text-[10px] font-bold text-orange-600 hover:text-orange-400 uppercase tracking-widest transition-colors">
                    EFREMGIANNESSI.ORG
                </a>
            </div>
        </div>
    </div>
  );
}