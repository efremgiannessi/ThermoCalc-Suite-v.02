
import { useState, useEffect } from 'react';
import { ArrowRightLeft, Copy, RotateCcw, Info } from 'lucide-react';

interface Props {
  showToast: (msg: string) => void;
}

type Category = 'lunghezza' | 'superficie' | 'volume' | 'massa' | 'pressione' | 'energia' | 'potenza' | 'temperatura';

interface Unit {
  id: string;
  label: string;
  factor: number; // Factor to base unit
  offset?: number; // For temperature
}

const UNITS: Record<Category, Unit[]> = {
  lunghezza: [
    { id: 'm', label: 'Metri (m)', factor: 1 },
    { id: 'km', label: 'Chilometri (km)', factor: 1000 },
    { id: 'cm', label: 'Centimetri (cm)', factor: 0.01 },
    { id: 'mm', label: 'Millimetri (mm)', factor: 0.001 },
    { id: 'in', label: 'Pollici (in)', factor: 0.0254 },
    { id: 'ft', label: 'Piedi (ft)', factor: 0.3048 },
    { id: 'yd', label: 'Iarde (yd)', factor: 0.9144 },
    { id: 'mi', label: 'Miglia (mi)', factor: 1609.34 },
    { id: 'nm', label: 'Miglia Nautiche', factor: 1852 },
  ],
  superficie: [
    { id: 'mq', label: 'Metri Quadri (m²)', factor: 1 },
    { id: 'kmq', label: 'Chilometri Quadri (km²)', factor: 1000000 },
    { id: 'cmq', label: 'Centimetri Quadri (cm²)', factor: 0.0001 },
    { id: 'ha', label: 'Ettari (ha)', factor: 10000 },
    { id: 'sqft', label: 'Piedi Quadri (sq ft)', factor: 0.092903 },
    { id: 'sqin', label: 'Pollici Quadri (sq in)', factor: 0.00064516 },
    { id: 'ac', label: 'Acri (ac)', factor: 4046.86 },
  ],
  volume: [
    { id: 'mc', label: 'Metri Cubi (m³)', factor: 1 },
    { id: 'l', label: 'Litri (L)', factor: 0.001 },
    { id: 'ml', label: 'Millilitri (ml)', factor: 0.000001 },
    { id: 'gal_us', label: 'Galloni US (gal)', factor: 0.00378541 },
    { id: 'gal_uk', label: 'Galloni UK (gal)', factor: 0.00454609 },
    { id: 'ft3', label: 'Piedi Cubi (ft³)', factor: 0.0283168 },
    { id: 'in3', label: 'Pollici Cubi (in³)', factor: 0.000016387 },
  ],
  massa: [
    { id: 'kg', label: 'Chilogrammi (kg)', factor: 1 },
    { id: 'g', label: 'Grammi (g)', factor: 0.001 },
    { id: 't', label: 'Tonnellate (t)', factor: 1000 },
    { id: 'lb', label: 'Libbre (lb)', factor: 0.453592 },
    { id: 'oz', label: 'Once (oz)', factor: 0.0283495 },
  ],
  pressione: [
    { id: 'pa', label: 'Pascal (Pa)', factor: 1 },
    { id: 'kpa', label: 'KiloPascal (kPa)', factor: 1000 },
    { id: 'bar', label: 'Bar', factor: 100000 },
    { id: 'atm', label: 'Atmosfere (atm)', factor: 101325 },
    { id: 'psi', label: 'PSI', factor: 6894.76 },
    { id: 'mmhg', label: 'mmHg (Torr)', factor: 133.322 },
  ],
  energia: [
    { id: 'j', label: 'Joule (J)', factor: 1 },
    { id: 'kj', label: 'KiloJoule (kJ)', factor: 1000 },
    { id: 'cal', label: 'Calorie (cal)', factor: 4.184 },
    { id: 'kcal', label: 'KiloCalorie (kcal)', factor: 4184 },
    { id: 'wh', label: 'Watt-ora (Wh)', factor: 3600 },
    { id: 'kwh', label: 'KiloWatt-ora (kWh)', factor: 3600000 },
    { id: 'btu', label: 'BTU', factor: 1055.06 },
  ],
  potenza: [
    { id: 'w', label: 'Watt (W)', factor: 1 },
    { id: 'kw', label: 'KiloWatt (kW)', factor: 1000 },
    { id: 'hp', label: 'Cavalli Vapore (hp)', factor: 745.7 },
    { id: 'btuh', label: 'BTU/h', factor: 0.293071 },
  ],
  temperatura: [
    { id: 'c', label: 'Celsius (°C)', factor: 1, offset: 0 },
    { id: 'f', label: 'Fahrenheit (°F)', factor: 1, offset: 0 }, // Special handling needed
    { id: 'k', label: 'Kelvin (K)', factor: 1, offset: 0 }, // Special handling needed
  ]
};

export default function Convertitore({ showToast }: Props) {
  const [category, setCategory] = useState<Category>('lunghezza');
  const [valFrom, setValFrom] = useState<string>('1');
  const [unitFrom, setUnitFrom] = useState<string>('');
  const [unitTo, setUnitTo] = useState<string>('');
  const [result, setResult] = useState<string>('--');

  // Initialize defaults when category changes
  useEffect(() => {
    setUnitFrom(UNITS[category][0].id);
    setUnitTo(UNITS[category][1]?.id || UNITS[category][0].id);
  }, [category]);

  // Calculation Logic
  useEffect(() => {
    const val = parseFloat(valFrom);
    if (isNaN(val)) {
      setResult('--');
      return;
    }

    if (category === 'temperatura') {
      let tempInC = val;
      // Convert to Celsius first
      if (unitFrom === 'f') tempInC = (val - 32) * 5/9;
      if (unitFrom === 'k') tempInC = val - 273.15;
      
      // Convert from Celsius to Target
      let finalVal = tempInC;
      if (unitTo === 'f') finalVal = (tempInC * 9/5) + 32;
      if (unitTo === 'k') finalVal = tempInC + 273.15;
      
      setResult(finalVal.toFixed(2));
    } else {
      // Standard linear conversion
      const fromU = UNITS[category].find(u => u.id === unitFrom);
      const toU = UNITS[category].find(u => u.id === unitTo);
      
      if (fromU && toU) {
        const baseVal = val * fromU.factor;
        const finalVal = baseVal / toU.factor;
        
        // Smart formatting
        if (finalVal < 0.0001 || finalVal > 100000) {
            setResult(finalVal.toExponential(4));
        } else {
            setResult(finalVal.toLocaleString('it-IT', { maximumFractionDigits: 4 }));
        }
      }
    }
  }, [valFrom, unitFrom, unitTo, category]);

  const handleSwap = () => {
    setUnitFrom(unitTo);
    setUnitTo(unitFrom);
  };

  const copyResult = () => {
    if (result !== '--') {
      const u = UNITS[category].find(x => x.id === unitTo)?.label.split('(')[1].replace(')', '') || '';
      navigator.clipboard.writeText(`${result} ${u}`);
      showToast('Copiato!');
    }
  };

  const categories: {id: Category, label: string, icon: string}[] = [
    { id: 'lunghezza', label: 'Lunghezza', icon: 'fa-ruler-horizontal' },
    { id: 'superficie', label: 'Superficie', icon: 'fa-vector-square' },
    { id: 'volume', label: 'Volume', icon: 'fa-cube' },
    { id: 'massa', label: 'Massa', icon: 'fa-weight-hanging' },
    { id: 'pressione', label: 'Pressione', icon: 'fa-gauge-high' },
    { id: 'energia', label: 'Energia', icon: 'fa-bolt' },
    { id: 'potenza', label: 'Potenza', icon: 'fa-plug' },
    { id: 'temperatura', label: 'Temperatura', icon: 'fa-temperature-half' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-in pb-12">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 no-print">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="bg-cyan-500/20 w-10 h-10 rounded-xl flex items-center justify-center text-cyan-500 border border-cyan-500/20">
                    <ArrowRightLeft size={20} />
                </span>
                Convertitore Universale
            </h2>
            <div className="flex gap-2">
                <button onClick={() => setValFrom('1')} className="bg-white/10 hover:bg-white/20 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-white/5 flex items-center gap-2"><RotateCcw size={12}/> Reset</button>
            </div>
        </div>

        {/* Category Selector */}
        <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar">
            {categories.map(cat => (
                <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wide transition-all whitespace-nowrap border ${
                        category === cat.id 
                            ? 'bg-cyan-600 text-white border-cyan-500 shadow-lg shadow-cyan-900/20' 
                            : 'bg-black/20 border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }`}
                >
                    <i className={`fa-solid ${cat.icon}`}></i> {cat.label}
                </button>
            ))}
        </div>

        <div className="glass-panel rounded-[2rem] p-8 md:p-12 relative overflow-hidden border border-cyan-500/10">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-6 items-center relative z-10">
                
                {/* FROM COLUMN */}
                <div className="md:col-span-3 space-y-4">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider ml-1">Da</label>
                    <div className="bg-app-input border border-white/10 rounded-2xl p-2">
                         <input 
                            type="number" 
                            value={valFrom} 
                            onChange={(e) => setValFrom(e.target.value)}
                            className="w-full bg-transparent p-4 text-3xl font-mono text-white outline-none placeholder-slate-600 font-bold"
                            placeholder="0"
                         />
                         <div className="h-px bg-white/5 mx-2"></div>
                         <select 
                            value={unitFrom} 
                            onChange={(e) => setUnitFrom(e.target.value)}
                            className="w-full bg-transparent p-3 text-slate-300 outline-none cursor-pointer text-sm font-bold uppercase tracking-wide appearance-none"
                         >
                            {UNITS[category].map(u => (
                                <option key={u.id} value={u.id} className="bg-app-panel text-white">{u.label}</option>
                            ))}
                         </select>
                    </div>
                </div>

                {/* SWAP BUTTON */}
                <div className="md:col-span-1 flex justify-center">
                    <button 
                        onClick={handleSwap}
                        className="w-12 h-12 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-500 border border-cyan-500/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95 group"
                    >
                        <ArrowRightLeft size={20} className="group-hover:rotate-180 transition-transform duration-500"/>
                    </button>
                </div>

                {/* TO COLUMN */}
                <div className="md:col-span-3 space-y-4">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider ml-1">A</label>
                    <div className="bg-cyan-950/20 border border-cyan-500/20 rounded-2xl p-2 relative group hover:bg-cyan-900/20 transition-colors">
                         <div className="w-full bg-transparent p-4 text-3xl font-mono text-cyan-400 font-bold overflow-hidden text-ellipsis">
                            {result}
                         </div>
                         <div className="h-px bg-cyan-500/20 mx-2"></div>
                         <select 
                            value={unitTo} 
                            onChange={(e) => setUnitTo(e.target.value)}
                            className="w-full bg-transparent p-3 text-cyan-200/70 outline-none cursor-pointer text-sm font-bold uppercase tracking-wide appearance-none"
                         >
                            {UNITS[category].map(u => (
                                <option key={u.id} value={u.id} className="bg-app-panel text-white">{u.label}</option>
                            ))}
                         </select>
                         
                         {/* Copy Button */}
                         <button 
                            onClick={copyResult}
                            className="absolute top-4 right-4 text-cyan-500/50 hover:text-cyan-400 transition-colors"
                         >
                            <Copy size={18} />
                         </button>
                    </div>
                </div>
            </div>

            {/* Quick Info / Factor Display */}
            <div className="mt-8 text-center">
                {category !== 'temperatura' && result !== '--' && (
                     <div className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/5 text-[10px] text-slate-400 font-mono">
                        1 {UNITS[category].find(u => u.id === unitFrom)?.label} ≈ {(parseFloat(result)/parseFloat(valFrom)).toExponential(4)} {UNITS[category].find(u => u.id === unitTo)?.label}
                     </div>
                )}
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
                  Modulo universale per la conversione di unità fisiche e ingegneristiche. Supporta conversioni dirette di lunghezza, area, volume, massa, pressione, energia, potenza e temperatura.
              </div>
              <div>
                  <strong className="text-slate-300 block mb-1">Modalità d'Uso</strong>
                  Seleziona la grandezza fisica dal menu superiore. Imposta l'unità di partenza (Da) e quella di arrivo (A). Il valore viene convertito istantaneamente durante la digitazione.
              </div>
              <div>
                  <strong className="text-slate-300 block mb-1">Standard</strong>
                  Fattori di conversione basati sul Sistema Internazionale (SI) e le unità consuetudinarie USA/UK (Imperiali).
              </div>
          </div>
      </div>
    </div>
  );
}