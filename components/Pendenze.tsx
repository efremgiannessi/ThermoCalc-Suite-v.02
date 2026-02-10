
import { useState, useEffect } from 'react';
import { ArrowUp, ArrowRight, Calculator } from 'lucide-react';

interface Props {
  showToast: (msg: string) => void;
}

export default function Pendenze({ showToast }: Props) {
  // Existing State
  const [h, setH] = useState('');
  const [l, setL] = useState('');
  const [resHL, setResHL] = useState('-- %');
  const [degInput, setDegInput] = useState('');
  const [resPerc, setResPerc] = useState('-- %');
  const [percInput, setPercInput] = useState('');
  const [resDeg, setResDeg] = useState('-- °');

  // New State for Inverse Calculation
  const [invMode, setInvMode] = useState<'findH' | 'findL'>('findH'); // findH = Calcola Dislivello, findL = Calcola Distanza
  const [invKnown, setInvKnown] = useState(''); // Valore conosciuto (L se cerco H, H se cerco L)
  const [invSlope, setInvSlope] = useState(''); // Valore pendenza
  const [invUnit, setInvUnit] = useState<'perc' | 'deg'>('perc'); // Unità pendenza
  const [invResult, setInvResult] = useState('--');

  useEffect(() => {
    const saved = localStorage.getItem('pendenzeData');
    if (saved) {
        try {
            const d = JSON.parse(saved);
            if(d.h) setH(d.h);
            if(d.l) setL(d.l);
            if(d.degInput) setDegInput(d.degInput);
            if(d.percInput) setPercInput(d.percInput);
            
            // Trigger calcs
            if(d.h && d.l) calcHL(d.h, d.l);
            if(d.degInput) calcDegToPerc(d.degInput);
            if(d.percInput) calcPercToDeg(d.percInput);
        } catch(e) {}
    }
  }, []);

  // New Effect for Inverse Calculation
  useEffect(() => {
    const val = parseFloat(invKnown);
    const s = parseFloat(invSlope);

    if (!isNaN(val) && !isNaN(s) && s !== 0) {
        // Calcola il rapporto (tangente)
        let ratio = 0;
        if (invUnit === 'perc') {
            ratio = s / 100;
        } else {
            ratio = Math.tan(s * (Math.PI / 180));
        }

        if (invMode === 'findH') {
            // Cerco H (Dislivello) avendo L (Distanza). H = L * slope
            // invKnown è L
            const res = val * ratio;
            setInvResult(res.toFixed(3));
        } else {
            // Cerco L (Distanza) avendo H (Dislivello). L = H / slope
            // invKnown è H
            const res = val / ratio;
            setInvResult(res.toFixed(3));
        }
    } else {
        setInvResult('--');
    }
  }, [invMode, invKnown, invSlope, invUnit]);

  const handleSave = () => {
      const data = { h, l, degInput, percInput };
      localStorage.setItem('pendenzeData', JSON.stringify(data));
      showToast('Dati salvati!');
  };

  const handleShare = async () => {
      const text = `Report Pendenze\nH: ${h}, L: ${l} -> ${resHL}`;
      if (navigator.share) {
          try { await navigator.share({ title: 'Pendenze', text }); } catch {}
      } else {
          navigator.clipboard.writeText(text);
          showToast('Copiato negli appunti');
      }
  };

  const copy = (t: string) => { navigator.clipboard.writeText(t); showToast('Copiato!'); };

  const calcHL = (valH: string, valL: string) => {
    setH(valH); setL(valL);
    const nh = parseFloat(valH);
    const nl = parseFloat(valL);
    if(nh && nl) setResHL((nh/nl * 100).toFixed(2) + " %");
    else setResHL("-- %");
  };

  const calcDegToPerc = (val: string) => {
      setDegInput(val);
      const v = parseFloat(val);
      if(!isNaN(v)) setResPerc((Math.tan(v * Math.PI/180)*100).toFixed(1) + " %");
      else setResPerc("-- %");
  };

  const calcPercToDeg = (val: string) => {
      setPercInput(val);
      const v = parseFloat(val);
      if(!isNaN(v)) setResDeg((Math.atan(v/100) * 180/Math.PI).toFixed(2) + " °");
      else setResDeg("-- °");
  };

  return (
    <div className="animate-slide-in">
        <div className="flex justify-end gap-2 mb-6 max-w-4xl mx-auto no-print">
          <button onClick={handleSave} className="bg-white/10 hover:bg-white/20 text-slate-300 px-4 py-2 rounded-lg text-sm font-bold transition-colors border border-white/5 flex items-center gap-2"><i className="fa-solid fa-floppy-disk"></i> Salva</button>
          <button onClick={handleShare} className="bg-white/10 hover:bg-white/20 text-slate-300 px-4 py-2 rounded-lg text-sm font-bold transition-colors border border-white/5 flex items-center gap-2"><i className="fa-solid fa-share-nodes"></i> Condividi</button>
          <button onClick={() => window.print()} className="bg-white/10 hover:bg-white/20 text-slate-300 px-4 py-2 rounded-lg text-sm font-bold transition-colors border border-white/5 flex items-center gap-2"><i className="fa-solid fa-print"></i> Stampa</button>
      </div>
    <div className="max-w-4xl mx-auto glass-panel rounded-[2rem] p-12 relative overflow-hidden print-break-inside">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none no-print"></div>

        <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3 relative z-10">
            <span className="bg-cyan-500/20 w-12 h-12 rounded-xl flex items-center justify-center text-cyan-500 border border-cyan-500/20"><i className="fa-solid fa-ruler-triangle text-xl"></i></span> 
            Calcolo Pendenze
        </h2>
        
        {/* SEZIONE 1: CALCOLO DIRETTO (H + L -> %) */}
        <div className="bg-black/20 p-8 rounded-2xl border border-white/5 mb-8 flex flex-col md:flex-row gap-8 items-end relative z-10 backdrop-blur-sm">
            <div className="flex-grow w-full">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2 block ml-1">Dislivello (H)</label>
                <div className="relative group">
                    <input type="number" value={h} onChange={e=>calcHL(e.target.value, l)} className="w-full glass-input rounded-xl p-4 text-white text-lg outline-none" placeholder="0.00"/>
                    <i className="fa-solid fa-arrows-up-down absolute right-4 top-5 text-slate-600"></i>
                </div>
            </div>
            <div className="flex-grow w-full">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2 block ml-1">Distanza (L)</label>
                <div className="relative group">
                    <input type="number" value={l} onChange={e=>calcHL(h, e.target.value)} className="w-full glass-input rounded-xl p-4 text-white text-lg outline-none" placeholder="0.00"/>
                    <i className="fa-solid fa-arrows-left-right absolute right-4 top-5 text-slate-600"></i>
                </div>
            </div>
            <div className="flex-none w-full md:w-auto">
                <div className="bg-accent-600/20 border border-accent-500/30 shadow-[0_0_20px_rgba(37,99,235,0.2)] px-8 py-4 rounded-xl text-white font-mono text-xl font-bold flex items-center justify-center gap-3 h-[60px] cursor-pointer hover:bg-accent-500/40 transition-colors backdrop-blur-md" onClick={()=>copy(resHL)}>
                    {resHL} <i className="fa-regular fa-copy text-sm opacity-70 no-print"></i>
                </div>
            </div>
        </div>

        {/* SEZIONE 2: CALCOLO INVERSO (Nuova Sezione) */}
        <div className="glass-panel p-8 rounded-2xl border border-orange-500/20 mb-8 relative z-10 bg-orange-900/10">
            <div className="flex items-center gap-2 mb-6">
                <Calculator size={20} className="text-orange-500" />
                <span className="text-sm text-orange-400 font-bold uppercase tracking-widest">Calcolo Dimensionale Inverso</span>
            </div>
            
            {/* Toggle Mode */}
            <div className="flex gap-3 mb-6">
                <button 
                    onClick={() => setInvMode('findH')}
                    className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${invMode === 'findH' ? 'bg-orange-600 text-white' : 'bg-black/30 text-slate-500 hover:text-white'}`}
                >
                    Trova Dislivello (H)
                </button>
                <button 
                    onClick={() => setInvMode('findL')}
                    className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${invMode === 'findL' ? 'bg-orange-600 text-white' : 'bg-black/30 text-slate-500 hover:text-white'}`}
                >
                    Trova Distanza (L)
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                {/* Input Conosciuto */}
                <div>
                    <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-2 block ml-1 flex items-center gap-1">
                        {invMode === 'findH' ? <><ArrowRight size={12}/> Distanza Nota (L)</> : <><ArrowUp size={12}/> Dislivello Noto (H)</>}
                    </label>
                    <input type="number" value={invKnown} onChange={e=>setInvKnown(e.target.value)} className="w-full glass-input rounded-xl p-4 text-white text-lg outline-none" placeholder="0.00"/>
                </div>

                {/* Input Pendenza */}
                <div>
                     <div className="flex justify-between items-center mb-2">
                        <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider ml-1">Pendenza</label>
                        <div className="flex bg-black/40 rounded-lg p-1">
                            <button onClick={()=>setInvUnit('perc')} className={`px-3 py-1 text-[10px] rounded font-bold ${invUnit === 'perc' ? 'bg-orange-500 text-white' : 'text-slate-500'}`}>%</button>
                            <button onClick={()=>setInvUnit('deg')} className={`px-3 py-1 text-[10px] rounded font-bold ${invUnit === 'deg' ? 'bg-orange-500 text-white' : 'text-slate-500'}`}>°</button>
                        </div>
                     </div>
                     <div className="relative">
                        <input type="number" value={invSlope} onChange={e=>setInvSlope(e.target.value)} className="w-full glass-input rounded-xl p-4 text-white text-lg outline-none" placeholder="0"/>
                        <span className="absolute right-4 top-5 text-slate-500 text-sm font-bold">{invUnit === 'perc' ? '%' : '°'}</span>
                     </div>
                </div>

                {/* Result */}
                <div>
                    <div className="bg-app-input border border-orange-500/30 p-4 rounded-xl text-center cursor-pointer hover:bg-orange-500/10 transition-colors" onClick={()=>copy(invResult)}>
                        <div className="text-[10px] text-orange-500 uppercase font-black mb-1">{invMode === 'findH' ? 'Dislivello (H)' : 'Distanza (L)'}</div>
                        <div className="text-3xl font-mono font-black text-white">{invResult} <span className="text-sm text-slate-500 font-sans">m</span></div>
                    </div>
                </div>
            </div>
        </div>

        {/* SEZIONE 3: CONVERTITORI RAPIDI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="glass-panel p-8 rounded-2xl text-center hover:bg-white/5 transition-colors group">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-4 block">Da Gradi a Percentuale</label>
                <div className="relative my-4 w-40 mx-auto">
                    <input type="number" value={degInput} onChange={e=>calcDegToPerc(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl p-5 text-white text-center text-3xl font-bold outline-none focus:border-cyan-500/50" placeholder="0°"/>
                </div>
                <i className="fa-solid fa-arrow-down text-slate-600 my-2"></i>
                <div className="text-4xl font-bold text-cyan-400 mt-2 flex justify-center items-center gap-3 cursor-pointer" onClick={()=>copy(resPerc)}>
                    {resPerc}
                </div>
            </div>
            
            <div className="glass-panel p-8 rounded-2xl text-center hover:bg-white/5 transition-colors group">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-4 block">Da Percentuale a Gradi</label>
                <div className="relative my-4 w-40 mx-auto">
                    <input type="number" value={percInput} onChange={e=>calcPercToDeg(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl p-5 text-white text-center text-3xl font-bold outline-none focus:border-cyan-500/50" placeholder="0%"/>
                </div>
                <i className="fa-solid fa-arrow-down text-slate-600 my-2"></i>
                <div className="text-4xl font-bold text-white mt-2 flex justify-center items-center gap-3 cursor-pointer" onClick={()=>copy(resDeg)}>
                    {resDeg}
                </div>
            </div>
        </div>
    </div>
    </div>
  );
}
