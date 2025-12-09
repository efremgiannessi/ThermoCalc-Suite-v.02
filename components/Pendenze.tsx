import React, { useState } from 'react';

interface Props {
  showToast: (msg: string) => void;
}

export default function Pendenze({ showToast }: Props) {
  const [h, setH] = useState('');
  const [l, setL] = useState('');
  const [resHL, setResHL] = useState('-- %');
  const [degInput, setDegInput] = useState('');
  const [resPerc, setResPerc] = useState('-- %');
  const [percInput, setPercInput] = useState('');
  const [resDeg, setResDeg] = useState('-- °');

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
    <div className="max-w-3xl mx-auto bg-dark-800 rounded-2xl border border-dark-700 shadow-xl p-6 animate-[slideIn_0.3s]">
        <h2 className="text-xl font-bold text-white mb-6"><i className="fa-solid fa-ruler-triangle text-accent-500"></i> Pendenze</h2>
        <div className="bg-dark-900/50 p-4 rounded-xl border border-dark-700 mb-6 flex gap-4 items-end">
            <div className="flex-grow"><label className="text-[10px] text-slate-500 block">Dislivello (H)</label><div className="relative"><input type="number" value={h} onChange={e=>calcHL(e.target.value, l)} className="w-full bg-dark-input border border-dark-600 rounded p-2 text-white text-sm"/><button onClick={()=>copy(h)} className="absolute right-2 top-2 text-slate-500 hover:text-white text-xs"><i className="fa-regular fa-copy"></i></button></div></div>
            <div className="flex-grow"><label className="text-[10px] text-slate-500 block">Distanza (L)</label><div className="relative"><input type="number" value={l} onChange={e=>calcHL(h, e.target.value)} className="w-full bg-dark-input border border-dark-600 rounded p-2 text-white text-sm"/><button onClick={()=>copy(l)} className="absolute right-2 top-2 text-slate-500 hover:text-white text-xs"><i className="fa-regular fa-copy"></i></button></div></div>
            <div className="flex-none bg-dark-800 px-4 py-2 rounded border border-dark-600 text-white font-mono flex items-center gap-2 h-[38px]"><span onClick={()=>copy(resHL)} className="cursor-pointer">{resHL}</span></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-dark-900 p-6 rounded-xl border border-dark-700 text-center"><label className="text-sm text-slate-300">Gradi</label><div className="relative my-3"><input type="number" value={degInput} onChange={e=>calcDegToPerc(e.target.value)} className="w-full bg-dark-800 p-3 text-white text-center text-xl"/><button onClick={()=>copy(degInput)} className="absolute right-2 top-3 text-slate-500 hover:text-white"><i className="fa-regular fa-copy"></i></button></div><div className="text-2xl font-bold text-accent-500 flex justify-center items-center gap-2"><span onClick={()=>copy(resPerc)} className="cursor-pointer">{resPerc}</span></div></div>
            <div className="bg-dark-900 p-6 rounded-xl border border-dark-700 text-center"><label className="text-sm text-slate-300">Percentuale</label><div className="relative my-3"><input type="number" value={percInput} onChange={e=>calcPercToDeg(e.target.value)} className="w-full bg-dark-800 p-3 text-white text-center text-xl"/><button onClick={()=>copy(percInput)} className="absolute right-2 top-3 text-slate-500 hover:text-white"><i className="fa-regular fa-copy"></i></button></div><div className="text-2xl font-bold text-white flex justify-center items-center gap-2"><span onClick={()=>copy(resDeg)} className="cursor-pointer">{resDeg}</span></div></div>
        </div>
    </div>
  );
}