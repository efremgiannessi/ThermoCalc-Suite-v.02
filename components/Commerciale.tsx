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

  // Margin Logic
  useEffect(() => {
    // Only reacting to specific manual triggers handled in onChange for better UX
  }, []);

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

  // Parcella Logic
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

  // IVA Logic
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-[slideIn_0.3s]">
       {/* Margine */}
       <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6 shadow-xl relative overflow-hidden">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><i className="fa-solid fa-chart-pie text-emerald-500"></i> Margine & Markup</h2>
          <div className="space-y-4">
            <div><label className="text-xs text-slate-400">Costo (€)</label><div className="relative"><input type="number" value={costo} onChange={e=>handleCommChange('costo',e.target.value)} className="w-full bg-dark-input border border-dark-600 rounded p-2 text-white" placeholder="0.00"/><button onClick={()=>copy(costo)} className="absolute right-2 top-2 text-slate-500 hover:text-white"><i className="fa-regular fa-copy"></i></button></div></div>
            <div><label className="text-xs text-slate-400">Prezzo Vendita (€)</label><div className="relative"><input type="number" value={prezzo} onChange={e=>handleCommChange('prezzo',e.target.value)} className="w-full bg-dark-input border border-dark-600 rounded p-2 text-white" placeholder="0.00"/><button onClick={()=>copy(prezzo)} className="absolute right-2 top-2 text-slate-500 hover:text-white"><i className="fa-regular fa-copy"></i></button></div></div>
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-dark-700">
                <div><label className="text-[10px] text-slate-500 uppercase block mb-1">Markup %</label><div className="relative"><input type="number" value={markup} onChange={e=>handleCommChange('markup',e.target.value)} className="w-full bg-dark-900 border border-dark-600 rounded p-2 text-emerald-400 font-bold text-center"/><button onClick={()=>copy(markup)} className="absolute right-2 top-2 text-slate-500 hover:text-white"><i className="fa-regular fa-copy"></i></button></div></div>
                <div><label className="text-[10px] text-slate-500 uppercase block mb-1">Margine %</label><div className="relative"><input type="number" value={margine} onChange={e=>handleCommChange('margine',e.target.value)} className="w-full bg-dark-900 border border-dark-600 rounded p-2 text-blue-400 font-bold text-center"/><button onClick={()=>copy(margine)} className="absolute right-2 top-2 text-slate-500 hover:text-white"><i className="fa-regular fa-copy"></i></button></div></div>
            </div>
          </div>
       </div>
       
       {/* Parcella */}
       <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6 shadow-xl relative overflow-hidden">
           <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><i className="fa-solid fa-user-tie text-accent-500"></i> Parcella (Italia)</h2>
           <div className="space-y-3">
              <div><label className="text-xs text-slate-400">Onorario (€)</label><div className="relative"><input type="number" value={onorario} onChange={e=>setOnorario(e.target.value)} className="w-full bg-dark-input border border-dark-600 rounded p-2 text-white" placeholder="1000.00"/><button onClick={()=>copy(onorario)} className="absolute right-2 top-2 text-slate-500 hover:text-white"><i className="fa-regular fa-copy"></i></button></div></div>
              <div className="grid grid-cols-2 gap-3">
                 <div><label className="text-[10px] text-slate-500">Cassa %</label><select value={cassa} onChange={e=>setCassa(e.target.value)} className="w-full bg-dark-input border border-dark-600 rounded p-2 text-xs text-white"><option value="4">4%</option><option value="5">5%</option><option value="0">0%</option></select></div>
                 <div><label className="text-[10px] text-slate-500">IVA %</label><input type="number" value={ivaPerc} onChange={e=>setIvaPerc(e.target.value)} className="w-full bg-dark-input border border-dark-600 rounded p-2 text-xs text-white"/></div>
              </div>
              <div className="flex items-center gap-2"><input type="checkbox" checked={ritenuta} onChange={e=>setRitenuta(e.target.checked)} id="parc_check" className="rounded bg-dark-input border-dark-600"/><label htmlFor="parc_check" className="text-xs text-slate-400">Ritenuta (20%)</label></div>
              <div className="bg-dark-900 rounded-xl p-3 space-y-1 mt-2">
                 <div className="flex justify-between text-sm font-bold pt-2"><span className="text-white">Totale</span><span className="text-white flex items-center gap-2">{pTotale} <i onClick={()=>copy(pTotale)} className="fa-regular fa-copy text-slate-500 hover:text-white cursor-pointer text-xs"></i></span></div>
                 <div className="flex justify-between text-xs text-blue-400 pt-1"><span>Netto</span><span className="flex items-center gap-2">{pNetto} <i onClick={()=>copy(pNetto)} className="fa-regular fa-copy text-slate-500 hover:text-white cursor-pointer"></i></span></div>
              </div>
           </div>
       </div>

       {/* IVA */}
       <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4"><i className="fa-solid fa-file-invoice-dollar text-slate-400"></i> Calcolo IVA</h2>
          <div className="flex bg-dark-900 p-1 rounded-lg mb-4">
            <button onClick={()=>setIvaMode('add')} className={`flex-1 py-1 text-xs rounded font-medium ${ivaMode==='add'?'bg-dark-700 text-white':'text-slate-400'}`}>Aggiungi</button>
            <button onClick={()=>setIvaMode('sub')} className={`flex-1 py-1 text-xs rounded font-medium ${ivaMode==='sub'?'bg-dark-700 text-white':'text-slate-400'}`}>Scorpora</button>
          </div>
          <div className="space-y-4">
             <div><label className="text-xs text-slate-400">{ivaMode === 'add' ? 'Importo Netto' : 'Importo Lordo'}</label><div className="relative"><input type="number" value={ivaAmount} onChange={e=>setIvaAmount(e.target.value)} className="w-full bg-dark-input border border-dark-600 rounded p-2 text-white font-mono text-lg" placeholder="0.00"/><button onClick={()=>copy(ivaAmount)} className="absolute right-2 top-2 text-slate-500 hover:text-white"><i className="fa-regular fa-copy"></i></button></div></div>
             <div><div className="relative w-20"><input type="number" value={ivaRate} onChange={e=>setIvaRate(e.target.value)} className="w-full bg-dark-input border border-dark-600 rounded p-2 text-white text-center text-sm"/><button onClick={()=>copy(ivaRate)} className="absolute right-2 top-2 text-slate-500 hover:text-white"><i className="fa-regular fa-copy"></i></button></div></div>
             <div className="bg-dark-900 rounded-xl p-4 mt-2"><div className="flex justify-between"><span className="text-sm font-bold text-white">Totale</span><span className="text-xl font-bold text-accent-500 font-mono flex items-center gap-2">{ivaRes} <i onClick={()=>copy(ivaRes)} className="fa-regular fa-copy text-slate-500 hover:text-white cursor-pointer text-xs"></i></span></div></div>
          </div>
       </div>
    </div>
  );
}