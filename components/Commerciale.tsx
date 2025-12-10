import React, { useState, useEffect } from 'react';

interface Props {
  showToast: (msg: string) => void;
}

export default function Commerciale({ showToast }: Props) {
  // Margin
  const [costo, setCosto] = useState<string>('');
  const [prezzo, setPrezzo] = useState<string>('');
  const [markup, setMarkup] = useState<string>('');
  const [margine, setMargine] = useState<string>('');

  // Parcella
  const [onorario, setOnorario] = useState<string>('1000');
  const [cassa, setCassa] = useState<string>('4');
  const [ivaPerc, setIvaPerc] = useState<string>('22');
  const [ritenuta, setRitenuta] = useState(true);
  const [pTotale, setPTotale] = useState('0.00');
  const [pNetto, setPNetto] = useState('0.00');

  // IVA
  const [ivaMode, setIvaMode] = useState<'add'|'sub'>('add');
  const [ivaAmount, setIvaAmount] = useState('');
  const [ivaRate, setIvaRate] = useState('22');
  const [ivaRes, setIvaRes] = useState('0.00 €');

  const copy = (t: string) => { navigator.clipboard.writeText(t); showToast('Copiato!'); };

  const handleCommChange = (type: 'costo'|'prezzo'|'markup'|'margine', val: string) => {
    if(type === 'costo') setCosto(val);
    if(type === 'prezzo') setPrezzo(val);
    if(type === 'markup') setMarkup(val);
    if(type === 'margine') setMargine(val);

    const c = parseFloat(type === 'costo' ? val : costo);
    const p = parseFloat(type === 'prezzo' ? val : prezzo);
    const mu = parseFloat(type === 'markup' ? val : markup);
    const ma = parseFloat(type === 'margine' ? val : margine);

    if (type === 'costo' || type === 'prezzo') {
       if (c && p) {
         setMarkup(((p-c)/c*100).toFixed(2));
         setMargine(((p-c)/p*100).toFixed(2));
       }
    } else if (type === 'markup' && c && !isNaN(mu)) {
       const np = c * (1 + mu/100);
       setPrezzo(np.toFixed(2));
       setMargine(((np-c)/np*100).toFixed(2));
    } else if (type === 'margine' && c && !isNaN(ma) && ma < 100) {
       const np = c / (1 - ma/100);
       setPrezzo(np.toFixed(2));
       setMarkup(((np-c)/c*100).toFixed(2));
    }
  };

  useEffect(() => {
    const o = parseFloat(onorario) || 0;
    const cp = parseFloat(cassa) || 0;
    const ip = parseFloat(ivaPerc) || 0;
    const c = o * (cp/100);
    const i = (o + c) * (ip/100);
    const tot = o + c + i;
    const net = tot - (ritenuta ? o * 0.2 : 0);
    setPTotale(tot.toFixed(2));
    setPNetto(net.toFixed(2));
  }, [onorario, cassa, ivaPerc, ritenuta]);

  useEffect(() => {
    const val = parseFloat(ivaAmount);
    const rate = parseFloat(ivaRate);
    if (!val || !rate) { setIvaRes('0.00 €'); return; }

    if (ivaMode === 'add') {
      const tot = val + (val * (rate/100));
      setIvaRes(tot.toFixed(2) + " €");
    } else {
      const net = val / (1 + rate/100);
      setIvaRes(net.toFixed(2) + " € (Netto)");
    }
  }, [ivaAmount, ivaRate, ivaMode]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-in">
       {/* Margine */}
       <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:bg-white/5 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><i className="fa-solid fa-chart-pie text-6xl text-white"></i></div>
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-3"><span className="bg-emerald-500/20 text-emerald-500 w-8 h-8 rounded-lg flex items-center justify-center text-sm border border-emerald-500/20"><i className="fa-solid fa-chart-pie"></i></span> Margine & Markup</h2>
          <div className="space-y-4">
            <div><label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Costo (€)</label><div className="relative"><input type="number" value={costo} onChange={e=>handleCommChange('costo',e.target.value)} className="w-full glass-input rounded-xl p-3 text-white outline-none" placeholder="0.00"/><button onClick={()=>copy(costo)} className="absolute right-3 top-3 text-slate-500 hover:text-white"><i className="fa-regular fa-copy"></i></button></div></div>
            <div><label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Prezzo Vendita (€)</label><div className="relative"><input type="number" value={prezzo} onChange={e=>handleCommChange('prezzo',e.target.value)} className="w-full glass-input rounded-xl p-3 text-white outline-none" placeholder="0.00"/><button onClick={()=>copy(prezzo)} className="absolute right-3 top-3 text-slate-500 hover:text-white"><i className="fa-regular fa-copy"></i></button></div></div>
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5">
                <div><label className="text-[10px] text-slate-500 uppercase font-bold block mb-2">Markup %</label><div className="relative"><input type="number" value={markup} onChange={e=>handleCommChange('markup',e.target.value)} className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-emerald-400 font-bold text-center outline-none glass-input"/><button onClick={()=>copy(markup)} className="absolute right-2 top-3 text-emerald-500/50 hover:text-emerald-400"><i className="fa-regular fa-copy"></i></button></div></div>
                <div><label className="text-[10px] text-slate-500 uppercase font-bold block mb-2">Margine %</label><div className="relative"><input type="number" value={margine} onChange={e=>handleCommChange('margine',e.target.value)} className="w-full bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-blue-400 font-bold text-center outline-none glass-input"/><button onClick={()=>copy(margine)} className="absolute right-2 top-3 text-blue-500/50 hover:text-blue-400"><i className="fa-regular fa-copy"></i></button></div></div>
            </div>
          </div>
       </div>
       
       {/* Parcella */}
       <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:bg-white/5 transition-colors">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><i className="fa-solid fa-user-tie text-6xl text-white"></i></div>
           <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-3"><span className="bg-indigo-500/20 text-indigo-500 w-8 h-8 rounded-lg flex items-center justify-center text-sm border border-indigo-500/20"><i className="fa-solid fa-user-tie"></i></span> Parcella</h2>
           <div className="space-y-4">
              <div><label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Onorario (€)</label><div className="relative"><input type="number" value={onorario} onChange={e=>setOnorario(e.target.value)} className="w-full glass-input rounded-xl p-3 text-white outline-none" placeholder="1000.00"/><button onClick={()=>copy(onorario)} className="absolute right-3 top-3 text-slate-500 hover:text-white"><i className="fa-regular fa-copy"></i></button></div></div>
              <div className="grid grid-cols-2 gap-4">
                 <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Cassa %</label><select value={cassa} onChange={e=>setCassa(e.target.value)} className="w-full glass-input rounded-xl p-3 text-xs text-white outline-none appearance-none"><option value="4" className="bg-slate-800">4%</option><option value="5" className="bg-slate-800">5%</option><option value="0" className="bg-slate-800">0%</option></select></div>
                 <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">IVA %</label><input type="number" value={ivaPerc} onChange={e=>setIvaPerc(e.target.value)} className="w-full glass-input rounded-xl p-3 text-xs text-white outline-none"/></div>
              </div>
              <div className="flex items-center gap-3 py-2"><input type="checkbox" checked={ritenuta} onChange={e=>setRitenuta(e.target.checked)} id="parc_check" className="w-4 h-4 rounded bg-white/10 border-white/20 checked:bg-accent-500 appearance-none cursor-pointer"/><label htmlFor="parc_check" className="text-xs text-slate-300 font-medium cursor-pointer">Applica Ritenuta (20%)</label></div>
              <div className="glass-input rounded-xl p-4 space-y-2 mt-2 bg-black/20">
                 <div className="flex justify-between text-sm font-bold pt-1"><span className="text-slate-400 uppercase text-[10px] tracking-wider mt-1">Totale Lordo</span><span className="text-white text-lg flex items-center gap-2">{pTotale} <i onClick={()=>copy(pTotale)} className="fa-regular fa-copy text-slate-600 hover:text-white cursor-pointer text-xs"></i></span></div>
                 <div className="flex justify-between text-xs font-bold pt-2 border-t border-white/5"><span className="text-accent-400 uppercase text-[10px] tracking-wider mt-1">Netto a Pagare</span><span className="text-accent-400 text-lg flex items-center gap-2">{pNetto} <i onClick={()=>copy(pNetto)} className="fa-regular fa-copy text-slate-600 hover:text-white cursor-pointer text-xs"></i></span></div>
              </div>
           </div>
       </div>

       {/* IVA */}
       <div className="glass-panel rounded-2xl p-6 group hover:bg-white/5 transition-colors">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-3"><span className="bg-purple-500/20 text-purple-500 w-8 h-8 rounded-lg flex items-center justify-center text-sm border border-purple-500/20"><i className="fa-solid fa-file-invoice-dollar"></i></span> Calcolo IVA</h2>
          <div className="flex bg-black/20 p-1 rounded-xl mb-6 border border-white/5">
            <button onClick={()=>setIvaMode('add')} className={`flex-1 py-2 text-xs rounded-lg font-bold uppercase tracking-wider transition-all ${ivaMode==='add'?'bg-accent-600 shadow-lg text-white':'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>Aggiungi</button>
            <button onClick={()=>setIvaMode('sub')} className={`flex-1 py-2 text-xs rounded-lg font-bold uppercase tracking-wider transition-all ${ivaMode==='sub'?'bg-accent-600 shadow-lg text-white':'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>Scorpora</button>
          </div>
          <div className="space-y-6">
             <div><label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">{ivaMode === 'add' ? 'Importo Netto' : 'Importo Lordo'}</label><div className="relative"><input type="number" value={ivaAmount} onChange={e=>setIvaAmount(e.target.value)} className="w-full glass-input rounded-xl p-4 text-white font-mono text-xl outline-none placeholder:text-slate-600" placeholder="0.00"/><button onClick={()=>copy(ivaAmount)} className="absolute right-3 top-4 text-slate-500 hover:text-white"><i className="fa-regular fa-copy"></i></button></div></div>
             <div><div className="relative w-24"><input type="number" value={ivaRate} onChange={e=>setIvaRate(e.target.value)} className="w-full glass-input rounded-xl p-3 text-white text-center text-sm outline-none font-bold"/><span className="absolute right-8 top-3 text-slate-500 text-sm">%</span></div></div>
             <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-white/10 rounded-xl p-5 mt-4 text-center backdrop-blur-sm">
                 <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Risultato Finale</div>
                 <div className="text-2xl font-bold text-white font-mono flex items-center justify-center gap-3">{ivaRes} <i onClick={()=>copy(ivaRes)} className="fa-regular fa-copy text-slate-500 hover:text-white cursor-pointer text-sm"></i></div>
             </div>
          </div>
       </div>
    </div>
  );
}