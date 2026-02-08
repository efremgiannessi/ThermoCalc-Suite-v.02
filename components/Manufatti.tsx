import { useState, useEffect } from 'react';

interface Props {
  showToast: (msg: string) => void;
}

type Category = 'Alare' | 'Travi' | 'Tegoli' | 'Capriate' | 'Arcarecci' | 'Canali';

const DATA = {
  Alare: [
    { code: 'AL_70', desc: 'Alare 70 sw', mc_ml: 0.251, kg_ml: 628.15, h: 0.70, r: 120 },
    { code: 'AL_80', desc: 'Alare 80 sw', mc_ml: 0.261, kg_ml: 652.29, h: 0.80, r: 120 },
    { code: 'AL_100', desc: 'Alare 100 sw', mc_ml: 0.285, kg_ml: 711.66, h: 1.00, r: 120 },
    { code: 'Lastrina', desc: 'Lastrina', mc_ml: '0.055 mc/mq', kg_ml: '1.38 kg/mq', h: '-', r: '-' },
  ],
  Travi: [
    { code: 'TR_I_C_60', desc: 'Tr "I" - 60', type: 'Tr "I"', h: 60, anima: 12, kg_ml: 395, mc_ml: 0.158, r: 120 },
    { code: 'TR_I_C_80', desc: 'Tr "I" - 80', type: 'Tr "I"', h: 80, anima: 12, kg_ml: 455, mc_ml: 0.182, r: 120 },
  ],
  Tegoli: [
    { code: 'TT_30_10', desc: 'TT - 30 - 10', h: 30, gamba: 10, kg_ml: 448, mc_ml: 0.179, r: 60 },
  ],
  Capriate: [
    { code: 'DP_CAP_157', desc: 'D.P. Tipo 1 - 157', type: 'Tipo 1', h: 157, anima: 10, kg_ml: 833, mc_ml: 0.333, r: 120 },
  ],
  Arcarecci: [
    { code: 'ARC_45', desc: 'Arc. - 45', h: 45, anima: 10, kg_ml: 170, mc_ml: 0.068, r: 90 },
  ],
  Canali: [
    { code: 'TR_U_38', desc: 'Can. - 38', h: 38, anima: '10-11', kg_ml: 250, mc_ml: 0.100, r: 90 },
  ]
};

export default function Manufatti({ showToast }: Props) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [category, setCategory] = useState<Category>('Alare');
  const [search, setSearch] = useState('');

  const checkPassword = () => {
    if (password === '5575741') {
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  const copy = (txt: string | number) => {
    navigator.clipboard.writeText(txt.toString());
    showToast('Copiato!');
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-xs mx-auto mt-16 p-6 glass-panel rounded-2xl text-center animate-slide-in">
        <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10 shadow-lg">
          <i className="fa-solid fa-lock text-xl text-slate-400"></i>
        </div>
        <h2 className="text-base font-bold text-white mb-1">Area Riservata</h2>
        <p className="text-slate-400 text-[10px] mb-4">Inserisci la password.</p>
        <input 
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && checkPassword()}
          className="w-full industrial-input rounded-xl p-3 text-center text-white outline-none mb-3 text-xs"
          placeholder="•••••••"
        />
        <button onClick={checkPassword} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-2.5 rounded-xl transition-all text-[10px] uppercase tracking-widest">Sblocca</button>
      </div>
    );
  }

  const filteredData = DATA[category].filter(item => 
    item.desc.toLowerCase().includes(search.toLowerCase()) || 
    item.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-slide-in">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="bg-orange-500/20 w-8 h-8 rounded-lg flex items-center justify-center text-orange-500 border border-orange-500/20">
            <i className="fa-solid fa-shapes text-sm"></i>
          </span>
          Manufatti
        </h2>
        
        <div className="relative w-full md:w-56 no-print">
           <input 
             type="text" 
             value={search} 
             onChange={(e) => setSearch(e.target.value)}
             className="w-full industrial-input rounded-xl py-2 pl-9 pr-3 text-[10px] text-white placeholder-slate-500 outline-none"
             placeholder="Cerca..."
           />
           <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-500 text-[10px]"></i>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-1.5 pb-1 no-print">
        {(Object.keys(DATA) as Category[]).map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wide transition-all border ${
              category === cat 
                ? 'bg-orange-600 text-white border-orange-500' 
                : 'bg-white/5 border-white/5 text-slate-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-[8px] text-slate-400 uppercase tracking-widest">
                <th className="p-3 font-bold text-orange-400">Codice</th>
                <th className="p-3 font-bold">Descrizione</th>
                <th className="p-3 font-bold text-center">h (cm)</th>
                <th className="p-3 font-bold text-center">Peso</th>
                <th className="p-3 font-bold text-center bg-orange-500/5 text-orange-500">mc/ml</th>
                <th className="p-3 font-bold text-center">R (min)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {filteredData.map((item, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="p-3 font-bold text-white">{item.code}</td>
                  <td className="p-3 text-slate-300 font-sans">{item.desc}</td>
                  <td className="p-3 text-center">{String(item.h)}</td>
                  <td className="p-3 text-center text-white font-bold">{String(item.kg_ml)}</td>
                  <td onClick={() => copy(item.mc_ml)} className="p-3 text-orange-400 text-center font-bold bg-orange-500/5 cursor-pointer">{String(item.mc_ml)}</td>
                  <td className="p-3 text-center text-slate-500">{String(item.r)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}