import { useState } from 'react';

interface Props {
  showToast: (msg: string) => void;
}

type Category = 'Alare' | 'Travi' | 'Tegoli' | 'Capriate' | 'Arcarecci' | 'Canali';

// --- DATA ---
const DATA = {
  Alare: [
    { code: 'AL_70', desc: 'Alare 70 sw', mc_ml: 0.251, kg_ml: 628.15, h: 0.70, r: 120 },
    { code: 'AL_80', desc: 'Alare 80 sw', mc_ml: 0.261, kg_ml: 652.29, h: 0.80, r: 120 },
    { code: 'AL_100', desc: 'Alare 100 sw', mc_ml: 0.285, kg_ml: 711.66, h: 1.00, r: 120 },
    { code: '-', desc: '-', mc_ml: '-', kg_ml: '-', h: '-', r: '-' },
    { code: 'AL_70', desc: 'Alare 70 ca', mc_ml: 0.251, kg_ml: 628.15, h: '-', r: '-' },
    { code: 'AL_80', desc: 'Alare 80 ca', mc_ml: 0.261, kg_ml: 652.29, h: '-', r: '-' },
    { code: 'AL_100', desc: 'Alare 100 ca', mc_ml: 0.285, kg_ml: 711.66, h: '-', r: '-' },
    { code: 'Lastrina', desc: 'Lastrina', mc_ml: '0.055 mc/mq', kg_ml: '1.38 kg/mq', h: '-', r: '-' },
    { code: 'CLS', desc: 'Lastrine CLS', mc_ml: '-', kg_ml: '84.00', h: '-', r: '-' },
  ],
  Travi: [
    { code: 'TR_I_C_60', desc: 'Tr "I" - 60', type: 'Tr "I"', h: 60, anima: 12, kg_ml: 395, mc_ml: 0.158, r: 120 },
    { code: 'TR_I_C_80', desc: 'Tr "I" - 80', type: 'Tr "I"', h: 80, anima: 12, kg_ml: 455, mc_ml: 0.182, r: 120 },
    { code: 'TR_I_C_100', desc: 'Tr "I" - 100', type: 'Tr "I"', h: 100, anima: 10, kg_ml: 775, mc_ml: 0.310, r: 120 },
    { code: 'TR_I_C_120', desc: 'Tr "I" - 120', type: 'Tr "I"', h: 120, anima: 10, kg_ml: 855, mc_ml: 0.342, r: 120 },
    { code: 'TR_I_C_150', desc: 'Tr "I" - 150', type: 'Tr "I"', h: 150, anima: 10, kg_ml: 975, mc_ml: 0.390, r: 120 },
    { code: 'TR_I_L_60', desc: 'Tr "I" - 60', type: 'Tr "I"', h: 60, anima: 12, kg_ml: 445, mc_ml: 0.178, r: 120 },
    { code: 'TR_I_L_80', desc: 'Tr "I" - 80', type: 'Tr "I"', h: 80, anima: 12, kg_ml: 505, mc_ml: 0.202, r: 120 },
    { code: 'TR_I_L_100', desc: 'Tr "I" - 100', type: 'Tr "I"', h: 100, anima: 10, kg_ml: 825, mc_ml: 0.330, r: 120 },
    { code: 'TR_I_L_120', desc: 'Tr "I" - 120', type: 'Tr "I"', h: 120, anima: 10, kg_ml: 905, mc_ml: 0.362, r: 120 },
    { code: 'TR_I_L_150', desc: 'Tr "I" - 150', type: 'Tr "I"', h: 150, anima: 10, kg_ml: 1025, mc_ml: 0.410, r: 120 },
  ],
  Tegoli: [
    { code: 'TT_30_10', desc: 'TT - 30 - 10', h: 30, gamba: 10, kg_ml: 448, mc_ml: 0.179, r: 60 },
    { code: 'TT_30_14', desc: 'TT - 30 - 14', h: 30, gamba: 14, kg_ml: 498, mc_ml: 0.199, r: 90 },
    { code: 'TT_30_18', desc: 'TT - 30 - 18', h: 30, gamba: 18, kg_ml: 548, mc_ml: 0.219, r: 120 },
    { code: 'TT_40_10', desc: 'TT - 40 - 10', h: 40, gamba: 10, kg_ml: 507.72, mc_ml: 0.203, r: 60 },
    { code: 'TT_40_14', desc: 'TT - 40 - 14', h: 40, gamba: 14, kg_ml: 577.72, mc_ml: 0.231, r: 90 },
    { code: 'TT_40_18', desc: 'TT - 40 - 18', h: 40, gamba: 18, kg_ml: 647.72, mc_ml: 0.259, r: 120 },
    { code: 'TT_50_10', desc: 'TT - 50 - 10', h: 50, gamba: 10, kg_ml: 570.75, mc_ml: 0.228, r: 60 },
    { code: 'TT_50_14', desc: 'TT - 50 - 14', h: 50, gamba: 14, kg_ml: 660.72, mc_ml: 0.264, r: 90 },
    { code: 'TT_50_18', desc: 'TT - 50 - 18', h: 50, gamba: 18, kg_ml: 750.72, mc_ml: 0.300, r: 120 },
    { code: 'TT_60_10', desc: 'TT - 60 - 10', h: 60, gamba: 10, kg_ml: 637.08, mc_ml: 0.255, r: 60 },
    { code: 'TT_60_14', desc: 'TT - 60 - 14', h: 60, gamba: 14, kg_ml: 747.08, mc_ml: 0.299, r: 90 },
    { code: 'TT_60_18', desc: 'TT - 60 - 18', h: 60, gamba: 18, kg_ml: 857.05, mc_ml: 0.343, r: 120 },
    { code: 'TT_70_10', desc: 'TT - 70 - 10', h: 70, gamba: 10, kg_ml: 717.37, mc_ml: 0.287, r: 60 },
    { code: 'TT_70_14', desc: 'TT - 70 - 14', h: 70, gamba: 14, kg_ml: 836.74, mc_ml: 0.335, r: 90 },
    { code: 'TT_70_18', desc: 'TT - 70 - 18', h: 70, gamba: 18, kg_ml: 966.32, mc_ml: 0.387, r: 120 },
    { code: 'TT_80_10', desc: 'TT - 80 - 10', h: 80, gamba: 10, kg_ml: 779.26, mc_ml: 0.312, r: 60 },
    { code: 'TT_80_14', desc: 'TT - 80 - 14', h: 80, gamba: 14, kg_ml: 929.62, mc_ml: 0.372, r: 90 },
    { code: 'TT_80_18', desc: 'TT - 80 - 18', h: 80, gamba: 18, kg_ml: 1080.00, mc_ml: 0.432, r: 120 },
  ],
  Capriate: [
    { code: 'DP_CAP_157', desc: 'D.P. cap Tipo 1 - 157', type: 'Tipo 1', h: 157, anima: 10, kg_ml: 833, mc_ml: 0.333, r: 120 },
    { code: 'DP_CAP_163', desc: 'D.P. cap Tipo 1 - 163', type: 'Tipo 1', h: 163, anima: 10, kg_ml: 847, mc_ml: 0.339, r: 120 },
    { code: 'DP_CAP_169', desc: 'D.P. cap Tipo 1 - 169', type: 'Tipo 1', h: 169, anima: 10, kg_ml: 862, mc_ml: 0.345, r: 120 },
    { code: 'DP_CAP_175', desc: 'D.P. cap Tipo 1 - 175', type: 'Tipo 1', h: 175, anima: 10, kg_ml: 877, mc_ml: 0.351, r: 120 },
    { code: 'DP_CAP_181', desc: 'D.P. cap Tipo 1 - 181', type: 'Tipo 1', h: 181, anima: 10, kg_ml: 892, mc_ml: 0.357, r: 120 },
    { code: 'DP_CAP_187', desc: 'D.P. cap Tipo 1 - 187', type: 'Tipo 1', h: 187, anima: 10, kg_ml: 907, mc_ml: 0.363, r: 120 },
    { code: 'DP_CAP_193', desc: 'D.P. cap Tipo 1 - 193', type: 'Tipo 1', h: 193, anima: 10, kg_ml: 922, mc_ml: 0.369, r: 120 },
    { code: 'DP_CAP_199', desc: 'D.P. cap Tipo 1 - 199', type: 'Tipo 1', h: 199, anima: 10, kg_ml: 937, mc_ml: 0.375, r: 120 },
    { code: 'DP_CAP_205', desc: 'D.P. cap Tipo 1 - 205', type: 'Tipo 1', h: 205, anima: 10, kg_ml: 952, mc_ml: 0.381, r: 120 },
    { code: 'DP_CAP_150', desc: 'D.P. cap Tipo 2 - 150', type: 'Tipo 2', h: 150, anima: 10, kg_ml: 730, mc_ml: 0.292, r: 120 },
    { code: 'DP_CAP_160', desc: 'D.P. cap Tipo 2 - 160', type: 'Tipo 2', h: 160, anima: 10, kg_ml: 745, mc_ml: 0.298, r: 120 },
    { code: 'DP_CAP_170', desc: 'D.P. cap Tipo 2 - 170', type: 'Tipo 2', h: 170, anima: 10, kg_ml: 760, mc_ml: 0.304, r: 120 },
    { code: 'DP_CAP_180', desc: 'D.P. cap Tipo 2 - 180', type: 'Tipo 2', h: 180, anima: 10, kg_ml: 775, mc_ml: 0.310, r: 120 },
    { code: 'DP_CAP_190', desc: 'D.P. cap Tipo 2 - 190', type: 'Tipo 2', h: 190, anima: 10, kg_ml: 790, mc_ml: 0.316, r: 120 },
    { code: 'DP_CAP_200', desc: 'D.P. cap Tipo 2 - 200', type: 'Tipo 2', h: 200, anima: 10, kg_ml: 805, mc_ml: 0.322, r: 120 },
    { code: 'DP_CAP_210', desc: 'D.P. cap Tipo 2 - 210', type: 'Tipo 2', h: 210, anima: 10, kg_ml: 820, mc_ml: 0.328, r: 120 },
    { code: 'DP_CAP_220', desc: 'D.P. cap Tipo 2 - 220', type: 'Tipo 2', h: 220, anima: 10, kg_ml: 835, mc_ml: 0.334, r: 120 },
    { code: 'DP_CAP_230', desc: 'D.P. cap Tipo 2 - 230', type: 'Tipo 2', h: 230, anima: 10, kg_ml: 850, mc_ml: 0.340, r: 120 },
  ],
  Arcarecci: [
    { code: 'ARC_45', desc: 'Arc. - 45', h: 45, anima: 10, kg_ml: 170, mc_ml: 0.068, r: 90 },
    { code: 'ARC_60', desc: 'Arc. - 60', h: 60, anima: 10, kg_ml: 218.17, mc_ml: 0.087, r: 90 },
    { code: 'ARC_80', desc: 'Arc. - 80', h: 80, anima: 10, kg_ml: 345, mc_ml: 0.138, r: 90 },
    { code: 'ARC_85', desc: 'Arc. - 85', h: 85, anima: 18, kg_ml: 500, mc_ml: 0.200, r: 120 },
  ],
  Canali: [
    { code: 'TR_U', desc: 'Can. - 38', h: 38, anima: '10-11', kg_ml: 250, mc_ml: 0.100, r: 90 },
    { code: 'TR_U', desc: 'Can. - 100', h: 100, anima: '14-18', kg_ml: 1250, mc_ml: 0.500, r: 120 },
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
      <div className="max-w-md mx-auto mt-20 p-8 glass-panel rounded-3xl text-center animate-slide-in">
        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-lg">
          <i className="fa-solid fa-lock text-3xl text-slate-400"></i>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Area Riservata</h2>
        <p className="text-slate-400 text-xs mb-6">Inserisci la password per accedere al database manufatti.</p>
        
        <div className="relative mb-4">
          <input 
            type="password" 
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
            onKeyDown={(e) => e.key === 'Enter' && checkPassword()}
            className="w-full glass-input rounded-xl p-4 text-center text-white outline-none focus:border-accent-500/50"
            placeholder="•••••••"
          />
        </div>
        
        {error && <p className="text-red-400 text-xs font-bold mb-4 animate-pulse">Password non valida</p>}
        
        <button 
          onClick={checkPassword}
          className="w-full bg-accent-600 hover:bg-accent-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-95"
        >
          Sblocca
        </button>
      </div>
    );
  }

  const filteredData = DATA[category].filter(item => 
    item.desc.toLowerCase().includes(search.toLowerCase()) || 
    item.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-slide-in">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="bg-fuchsia-500/20 w-10 h-10 rounded-xl flex items-center justify-center text-fuchsia-500 border border-fuchsia-500/20">
            <i className="fa-solid fa-shapes"></i>
          </span>
          Database Manufatti
        </h2>
        
        <div className="relative w-full md:w-64">
           <input 
             type="text" 
             value={search} 
             onChange={(e) => setSearch(e.target.value)}
             className="w-full glass-input rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-fuchsia-500/50"
             placeholder="Cerca codice o descrizione..."
           />
           <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-500"></i>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
        {(Object.keys(DATA) as Category[]).map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-5 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all whitespace-nowrap border ${
              category === cat 
                ? 'bg-fuchsia-600 text-white border-fuchsia-500 shadow-[0_0_15px_rgba(192,38,211,0.4)]' 
                : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-xs text-slate-400 uppercase tracking-wider">
                <th className="p-4 font-bold text-fuchsia-400">Codice</th>
                <th className="p-4 font-bold">Descrizione</th>
                {category !== 'Alare' && category !== 'Canali' && <th className="p-4 font-bold text-center">Tipo</th>}
                <th className="p-4 font-bold text-center">Altezza (cm)</th>
                {(category !== 'Alare') && (
                  <th className="p-4 font-bold text-center">
                    {category === 'Tegoli' ? 'Gamba' : 'Anima'} (cm)
                  </th>
                )}
                <th className="p-4 font-bold text-center">Peso (kg/ml)</th>
                <th className="p-4 font-bold text-center bg-yellow-500/10 text-yellow-500 border-x border-white/5">mc/ml</th>
                <th className="p-4 font-bold text-center">R (min)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredData.map((item, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors group">
                  <td className="p-4 font-mono text-sm text-white font-bold">{item.code}</td>
                  <td className="p-4 text-sm text-slate-300">{item.desc}</td>
                  {/* Tipo Column */}
                  {category !== 'Alare' && category !== 'Canali' && (
                     <td className="p-4 text-sm text-slate-400 text-center">{'type' in item ? item.type : '-'}</td>
                  )}
                  <td className="p-4 text-sm text-slate-300 text-center font-mono">{item.h}</td>
                  {/* Anima/Gamba Column */}
                  {(category !== 'Alare') && (
                    <td className="p-4 text-sm text-slate-300 text-center font-mono">
                      {category === 'Tegoli' && 'gamba' in item ? item.gamba : ('anima' in item ? item.anima : '-')}
                    </td>
                  )}
                  <td className="p-4 text-sm text-white text-center font-mono font-bold bg-white/5">{item.kg_ml}</td>
                  <td 
                    onClick={() => copy(item.mc_ml)}
                    className="p-4 text-sm text-yellow-400 text-center font-mono font-bold bg-yellow-500/5 cursor-pointer hover:bg-yellow-500/20 border-x border-white/5 transition-colors relative"
                  >
                    {item.mc_ml}
                  </td>
                  <td className="p-4 text-sm text-slate-300 text-center font-mono">{item.r}</td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 italic">
                    Nessun manufatto trovato.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}