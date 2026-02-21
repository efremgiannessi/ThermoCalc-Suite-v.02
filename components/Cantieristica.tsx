
import { useState, useEffect } from 'react';
import { BrickWall, Box, Grid3X3, Cylinder, Info } from 'lucide-react';

interface Props {
  showToast: (msg: string) => void;
}

type Mode = 'calcestruzzo' | 'laterizi' | 'piastrelle';

export default function Cantieristica({ showToast }: Props) {
  const [mode, setMode] = useState<Mode>('calcestruzzo');

  // --- CALCESTRUZZO STATE ---
  const [clsShape, setClsShape] = useState<'cube' | 'cylinder'>('cube');
  const [clsDimA, setClsDimA] = useState(''); // L or R
  const [clsDimB, setClsDimB] = useState(''); // W or -
  const [clsDimH, setClsDimH] = useState(''); // H
  const [clsQty, setClsQty] = useState('1');
  const [clsResult, setClsResult] = useState({ mc: 0, weight: 0, bags: 0 }); // bags assume 25kg pre-mix (approx 2100kg/mc wet)

  // --- LATERIZI STATE ---
  const [wallL, setWallL] = useState('');
  const [wallH, setWallH] = useState('');
  const [brickL, setBrickL] = useState('25'); // cm
  const [brickH, setBrickH] = useState('12'); // cm
  const [joint, setJoint] = useState('1'); // cm (fuga)
  const [brickResult, setBrickResult] = useState({ count: 0, sqm: 0 });

  // --- PIASTRELLE STATE ---
  const [roomL, setRoomL] = useState('');
  const [roomW, setRoomW] = useState('');
  const [tileL, setTileL] = useState('60');
  const [tileW, setTileW] = useState('60');
  const [tileJoint, setTileJoint] = useState('2'); // mm
  const [tileWaste, setTileWaste] = useState('10'); // % sfrido
  const [tileResult, setTileResult] = useState({ count: 0, sqm: 0, packs: 0 }); // approx 1.44 mq/pack for 60x60

  // --- EFFECT: CALCESTRUZZO ---
  useEffect(() => {
    const a = parseFloat(clsDimA) || 0;
    const b = parseFloat(clsDimB) || 0;
    const h = parseFloat(clsDimH) || 0;
    const qty = parseFloat(clsQty) || 1;

    let vol = 0;
    if (clsShape === 'cube') {
        vol = a * b * h; // all in meters
    } else {
        // Cylinder: pi * r^2 * h. A is Radius
        vol = Math.PI * Math.pow(a, 2) * h;
    }

    vol = vol * qty;
    const w = vol * 2400; // 2400 kg/mc armato
    // Stima sacchi premiscelato (resa tipica 13-14L per sacco 25kg, ovvero ~75 sacchi per mc)
    // Oppure cemento puro (300kg/mc => 12 sacchi da 25kg)
    // Usiamo stima per Calcestruzzo Cemento (300kg/mc)
    const bags = Math.ceil((vol * 350) / 25); // 350kg cemento per mc strutturale

    setClsResult({ mc: vol, weight: w, bags });
  }, [clsShape, clsDimA, clsDimB, clsDimH, clsQty]);

  // --- EFFECT: LATERIZI ---
  useEffect(() => {
      const wl = parseFloat(wallL) || 0;
      const wh = parseFloat(wallH) || 0;
      const bl = parseFloat(brickL) || 25;
      const bh = parseFloat(brickH) || 12;
      const j = parseFloat(joint) || 1;

      if(wl > 0 && wh > 0) {
          const area = wl * wh;
          // Convert bricks cm to m
          const bLm = (bl + j) / 100;
          const bHm = (bh + j) / 100;
          
          const bricksPerSqm = 1 / (bLm * bHm);
          const total = Math.ceil(area * bricksPerSqm);
          
          setBrickResult({ count: total, sqm: area });
      } else {
          setBrickResult({ count: 0, sqm: 0 });
      }
  }, [wallL, wallH, brickL, brickH, joint]);

  // --- EFFECT: PIASTRELLE ---
  useEffect(() => {
      const rl = parseFloat(roomL) || 0;
      const rw = parseFloat(roomW) || 0;
      const tl = parseFloat(tileL) || 0;
      const tw = parseFloat(tileW) || 0;
      const waste = parseFloat(tileWaste) || 0;

      if(rl > 0 && rw > 0 && tl > 0 && tw > 0) {
          const roomArea = rl * rw;
          
          // Tile area in m (input in cm, joint in mm)
          // Effective tile dimension includes half joint on each side technically, but typically calculated as:
          // Area / (TileArea). Joint affects visual layout but for purchasing we use Area + Sfrido.
          
          const tAreaM = (tl/100) * (tw/100);
          const rawCount = roomArea / tAreaM;
          const withWaste = rawCount * (1 + waste/100);
          
          const total = Math.ceil(withWaste);
          // Estimation packs (generic 1.44mq per pack common for 60x60)
          // Let's just calculate SQM needed to buy
          const sqmToBuy = total * tAreaM;
          
          setTileResult({ count: total, sqm: sqmToBuy, packs: 0 });
      } else {
          setTileResult({ count: 0, sqm: 0, packs: 0 });
      }
  }, [roomL, roomW, tileL, tileW, tileJoint, tileWaste]);

  const copy = (t: string) => {
    navigator.clipboard.writeText(t);
    showToast('Copiato!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-in pb-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 no-print">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="bg-orange-500/20 w-10 h-10 rounded-xl flex items-center justify-center text-orange-500 border border-orange-500/20">
                    <BrickWall size={20} />
                </span>
                Computo Cantiere
            </h2>
            
            {/* Tabs */}
            <div className="bg-black/20 p-1 rounded-xl flex border border-white/10 overflow-x-auto">
                <button 
                    onClick={() => setMode('calcestruzzo')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all whitespace-nowrap flex items-center gap-2 ${mode === 'calcestruzzo' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                    <Box size={14} /> Calcestruzzo
                </button>
                <button 
                    onClick={() => setMode('laterizi')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all whitespace-nowrap flex items-center gap-2 ${mode === 'laterizi' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                    <BrickWall size={14} /> Laterizi
                </button>
                <button 
                    onClick={() => setMode('piastrelle')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all whitespace-nowrap flex items-center gap-2 ${mode === 'piastrelle' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                    <Grid3X3 size={14} /> Pavimenti
                </button>
            </div>
        </div>

        {/* ================= CALCESTRUZZO ================= */}
        {mode === 'calcestruzzo' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                <div className="glass-panel rounded-2xl p-6 border-orange-500/10">
                    <h3 className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Geometria Getto</h3>
                    
                    <div className="flex gap-4 mb-6">
                        <button onClick={()=>setClsShape('cube')} className={`flex-1 py-3 rounded-xl border border-white/10 flex flex-col items-center gap-2 ${clsShape === 'cube' ? 'bg-orange-500/20 text-orange-500 border-orange-500/50' : 'bg-black/20 text-slate-500'}`}>
                            <Box size={24}/>
                            <span className="text-[8px] font-black uppercase">Prisma / Platea</span>
                        </button>
                        <button onClick={()=>setClsShape('cylinder')} className={`flex-1 py-3 rounded-xl border border-white/10 flex flex-col items-center gap-2 ${clsShape === 'cylinder' ? 'bg-orange-500/20 text-orange-500 border-orange-500/50' : 'bg-black/20 text-slate-500'}`}>
                            <Cylinder size={24}/>
                            <span className="text-[8px] font-black uppercase">Pilastro Tondo</span>
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="industrial-label">{clsShape === 'cube' ? 'Lunghezza (m)' : 'Raggio (m)'}</label>
                                <input type="number" value={clsDimA} onChange={e=>setClsDimA(e.target.value)} className="w-full glass-input rounded-xl p-3 text-xs" placeholder="0.00"/>
                             </div>
                             {clsShape === 'cube' && (
                                 <div>
                                    <label className="industrial-label">Larghezza (m)</label>
                                    <input type="number" value={clsDimB} onChange={e=>setClsDimB(e.target.value)} className="w-full glass-input rounded-xl p-3 text-xs" placeholder="0.00"/>
                                 </div>
                             )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="industrial-label">Altezza (m)</label>
                                <input type="number" value={clsDimH} onChange={e=>setClsDimH(e.target.value)} className="w-full glass-input rounded-xl p-3 text-xs" placeholder="0.00"/>
                            </div>
                            <div>
                                <label className="industrial-label">Quantità (Pz)</label>
                                <input type="number" value={clsQty} onChange={e=>setClsQty(e.target.value)} className="w-full glass-input rounded-xl p-3 text-xs" placeholder="1"/>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="glass-panel rounded-2xl p-6 bg-orange-950/10 border-orange-500/20 text-center cursor-pointer hover:bg-orange-900/20 transition-colors" onClick={()=>copy(clsResult.mc.toFixed(3))}>
                         <span className="industrial-label text-orange-500 !mb-2">Volume Totale</span>
                         <div className="text-4xl font-black text-white font-mono">{clsResult.mc.toFixed(2)} <span className="text-lg text-slate-500">m³</span></div>
                         <div className="text-[9px] text-slate-500 mt-2 font-mono">Peso Stimato: {(clsResult.weight/1000).toFixed(2)} ton</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div className="glass-panel rounded-2xl p-4 text-center">
                             <span className="industrial-label text-slate-500">Cemento (350kg/mc)</span>
                             <div className="text-xl font-bold text-white font-mono">{Math.ceil(clsResult.mc * 350)} <span className="text-[10px] text-slate-500">kg</span></div>
                         </div>
                         <div className="glass-panel rounded-2xl p-4 text-center">
                             <span className="industrial-label text-slate-500">Sacchi (25kg)</span>
                             <div className="text-xl font-bold text-white font-mono">{clsResult.bags} <span className="text-[10px] text-slate-500">pz</span></div>
                         </div>
                    </div>
                </div>
            </div>
        )}

        {/* ================= LATERIZI ================= */}
        {mode === 'laterizi' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                <div className="glass-panel rounded-2xl p-6 border-orange-500/10">
                    <h3 className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Parete & Blocco</h3>
                    <div className="space-y-4">
                        <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider ml-1">Dimensioni Parete (m)</label>
                        <div className="grid grid-cols-2 gap-4">
                            <input type="number" value={wallL} onChange={e=>setWallL(e.target.value)} className="w-full glass-input rounded-xl p-3 text-xs" placeholder="Lunghezza"/>
                            <input type="number" value={wallH} onChange={e=>setWallH(e.target.value)} className="w-full glass-input rounded-xl p-3 text-xs" placeholder="Altezza"/>
                        </div>

                        <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider ml-1 mt-4 block">Dimensioni Blocco (cm)</label>
                        <div className="grid grid-cols-3 gap-3">
                             <div>
                                 <input type="number" value={brickL} onChange={e=>setBrickL(e.target.value)} className="w-full glass-input rounded-xl p-2 text-center text-xs" placeholder="L"/>
                                 <span className="text-[8px] text-center block mt-1 text-slate-500">Lung.</span>
                             </div>
                             <div>
                                 <input type="number" value={brickH} onChange={e=>setBrickH(e.target.value)} className="w-full glass-input rounded-xl p-2 text-center text-xs" placeholder="H"/>
                                 <span className="text-[8px] text-center block mt-1 text-slate-500">Alt.</span>
                             </div>
                             <div>
                                 <input type="number" value={joint} onChange={e=>setJoint(e.target.value)} className="w-full glass-input rounded-xl p-2 text-center border-orange-500/30 text-orange-200 text-xs" placeholder="1"/>
                                 <span className="text-[8px] text-center block mt-1 text-orange-500">Fuga</span>
                             </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col justify-center space-y-4">
                     <div className="glass-panel rounded-2xl p-8 text-center bg-orange-900/10 border-orange-500/30" onClick={()=>copy(brickResult.count.toString())}>
                         <div className="industrial-label text-orange-500">Totale Elementi</div>
                         <div className="text-5xl font-black text-white font-mono">{brickResult.count}</div>
                         <div className="text-[10px] text-slate-400 mt-2">per {brickResult.sqm.toFixed(2)} m² di parete</div>
                     </div>
                     <div className="bg-white/5 p-4 rounded-xl text-center border border-white/5">
                         <span className="text-[9px] text-slate-500 uppercase font-bold">Incidenza</span>
                         <div className="text-base font-mono text-slate-300">{(brickResult.count / (brickResult.sqm || 1)).toFixed(1)} pezzi/m²</div>
                     </div>
                </div>
            </div>
        )}

        {/* ================= PIASTRELLE ================= */}
        {mode === 'piastrelle' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                <div className="glass-panel rounded-2xl p-6 border-orange-500/10">
                    <h3 className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Pavimentazione</h3>
                    
                    <div className="space-y-5">
                        <div>
                            <label className="industrial-label">Stanza (m)</label>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" value={roomL} onChange={e=>setRoomL(e.target.value)} className="w-full glass-input rounded-xl p-3 text-xs" placeholder="Lunghezza"/>
                                <input type="number" value={roomW} onChange={e=>setRoomW(e.target.value)} className="w-full glass-input rounded-xl p-3 text-xs" placeholder="Larghezza"/>
                            </div>
                        </div>

                        <div>
                            <label className="industrial-label">Piastrella (cm)</label>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" value={tileL} onChange={e=>setTileL(e.target.value)} className="w-full glass-input rounded-xl p-3 text-xs" placeholder="60"/>
                                <input type="number" value={tileW} onChange={e=>setTileW(e.target.value)} className="w-full glass-input rounded-xl p-3 text-xs" placeholder="60"/>
                            </div>
                        </div>

                        <div>
                             <label className="industrial-label">Parametri Posa</label>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                    <input type="number" value={tileWaste} onChange={e=>setTileWaste(e.target.value)} className="w-full glass-input rounded-xl p-3 text-white border-red-500/30 text-xs" placeholder="10"/>
                                    <span className="absolute right-3 top-3.5 text-[10px] text-red-500 font-bold">% Sfrido</span>
                                </div>
                                <div className="relative">
                                    <input type="number" value={tileJoint} onChange={e=>setTileJoint(e.target.value)} className="w-full glass-input rounded-xl p-3 text-white text-xs" placeholder="2"/>
                                    <span className="absolute right-3 top-3.5 text-[10px] text-slate-500 font-bold">mm Fuga</span>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col justify-center space-y-4">
                     <div className="glass-panel rounded-2xl p-8 text-center bg-orange-900/10 border-orange-500/30" onClick={()=>copy(tileResult.count.toString())}>
                         <div className="industrial-label text-orange-500">Totale Piastrelle</div>
                         <div className="text-5xl font-black text-white font-mono">{tileResult.count}</div>
                         <div className="text-[10px] text-slate-400 mt-2">inclusi sfridi ({tileWaste}%)</div>
                     </div>
                     <div className="bg-white/5 p-4 rounded-xl text-center border border-white/5">
                         <span className="text-[9px] text-slate-500 uppercase font-bold">Metratura Ordine Consigliata</span>
                         <div className="text-xl font-mono text-white font-bold">{tileResult.sqm.toFixed(2)} m²</div>
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
                  Stima rapida delle quantità di materiali da costruzione per cantieri edili. Calcolo volumetrie calcestruzzo, numero di laterizi per murature e fabbisogno piastrelle.
              </div>
              <div>
                  <strong className="text-slate-300 block mb-1">Modalità d'Uso</strong>
                  Inserisci le dimensioni geometriche (m) e le specifiche del singolo elemento (cm). Il sistema calcola automaticamente i totali includendo gli sfridi impostati.
              </div>
              <div>
                  <strong className="text-slate-300 block mb-1">Note di Calcolo</strong>
                  Calcestruzzo armato: 2400 kg/m³. Dosaggio cemento standard: 350 kg/m³. I laterizi includono lo spessore della fuga nel calcolo dell'area di influenza.
              </div>
          </div>
      </div>
    </div>
  );
}
