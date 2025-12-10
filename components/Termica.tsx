import { useState, useEffect, useRef } from 'react';

const capoluoghiDB: Record<string, { z: string; n: string }> = { 
  "milano":{z:"E", n:"I-pad"}, "roma":{z:"D", n:"III"}, "torino":{z:"E", n:"I-pad"}, 
  "napoli":{z:"C", n:"II"}, "palermo":{z:"B", n:"II"}, "genova":{z:"D", n:"II"}, 
  "bologna":{z:"E", n:"I-pad"}, "firenze":{z:"D", n:"II"}, "bari":{z:"C", n:"II"}, "catania":{z:"B", n:"II"} 
};

const trasmittanze = [ 
  {zone:"A",win:3.0,hor:0.35,vert:0.43}, {zone:"B",win:3.0,hor:0.35,vert:0.43}, 
  {zone:"C",win:2.2,hor:0.33,vert:0.34}, {zone:"D",win:1.8,hor:0.26,vert:0.29}, 
  {zone:"E",win:1.4,hor:0.22,vert:0.26}, {zone:"F",win:1.1,hor:0.20,vert:0.24} 
];

interface Props {
  showToast: (msg: string) => void;
}

export default function Termica({ showToast }: Props) {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [mapInfo, setMapInfo] = useState({ name: '--', alt: 0 });
  const [zone, setZone] = useState('E');
  const [alt, setAlt] = useState(0);
  const [snowZone, setSnowZone] = useState('I-med');
  const [coeffCe, setCoeffCe] = useState(1);
  const [coeffCt, setCoeffCt] = useState(1);
  const [limits, setLimits] = useState({ vert: 0, hor: 0, win: 0 });
  const [snowLoad, setSnowLoad] = useState('0.00');

  // Insulation Calc State
  const [isoLambda, setIsoLambda] = useState<number | ''>('');
  const [isoTarget, setIsoTarget] = useState<number | ''>('');
  const [isoR, setIsoR] = useState(0.30);
  const [isoThickness, setIsoThickness] = useState<string>('--');

  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Initialize Map
  useEffect(() => {
    if (!document.getElementById('mappaComune') || mapRef.current) return;
    
    // @ts-ignore
    const L = window.L;
    if(!L) return;

    mapRef.current = L.map('mappaComune', { zoomControl: false }).setView([41.9028, 12.4964], 5);
    
    // CAMBIO MAPPA: Usa OpenStreetMap standard a colori
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
      attribution: '© OpenStreetMap contributors', maxZoom: 18 
    }).addTo(mapRef.current);
    
    L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);

    setTimeout(() => mapRef.current?.invalidateSize(), 200);
  }, []);

  // Update Calculations
  useEffect(() => {
    const d = trasmittanze.find(x => x.zone === zone);
    if(d) setLimits({ vert: d.vert, hor: d.hor, win: d.win });

    const as = alt;
    let qsk = 0;
    if (snowZone === 'I-alp') qsk = as <= 200 ? 1.50 : 1.39 * (1 + Math.pow(as/728, 2));
    else if (snowZone === 'I-med') qsk = as <= 200 ? 1.35 : 1.35 * (1 + Math.pow(as/602, 2));
    else if (snowZone === 'II') qsk = as <= 200 ? 1.00 : 0.85 * (1 + Math.pow(as/481, 2));
    else if (snowZone === 'III') qsk = as <= 200 ? 0.60 : 0.51 * (1 + Math.pow(as/481, 2));
    
    const mu1 = 0.8; 
    const qs = qsk * mu1 * coeffCe * coeffCt;
    setSnowLoad(qs.toFixed(2));

  }, [zone, alt, snowZone, coeffCe, coeffCt]);

  const handleSearch = async (query: string) => {
    setSearch(query);
    if(query.length < 3) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&countrycodes=it&limit=5`);
      const data = await res.json();
      setResults(data);
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const selectComune = async (item: any) => {
    setResults([]);
    const displayName = item.display_name.split(',')[0];
    setSearch(displayName);
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    
    // @ts-ignore
    const L = window.L;
    if(mapRef.current && L) {
      if(markerRef.current) mapRef.current.removeLayer(markerRef.current);
      markerRef.current = L.marker([lat, lon]).addTo(mapRef.current);
      mapRef.current.setView([lat, lon], 12);
    }

    let elevation = 0;
    try { 
      const elevRes = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lon}`); 
      const elevData = await elevRes.json(); 
      if(elevData.elevation) elevation = Math.round(elevData.elevation[0]); 
    } catch(e) {}
    
    setAlt(elevation);
    setMapInfo({ name: displayName, alt: elevation });

    const cityKey = displayName.toLowerCase().trim();
    if(capoluoghiDB[cityKey]) {
      setZone(capoluoghiDB[cityKey].z);
      setSnowZone(capoluoghiDB[cityKey].n === "I-pad" ? "II" : capoluoghiDB[cityKey].n);
    }
  };

  const copy = (txt: string | number) => {
    navigator.clipboard.writeText(txt.toString());
    showToast('Copiato!');
  };

  const calcIso = () => {
    if(isoLambda && isoTarget) {
      const val = Math.max(0, (1/isoTarget - isoR) * isoLambda * 100);
      setIsoThickness(val.toFixed(1));
    }
  };

  return (
    <div className="space-y-8 animate-slide-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Map & Search */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="glass-panel rounded-2xl p-6 relative z-20">
            <label className="text-[11px] text-accent-400 font-bold uppercase tracking-widest mb-3 block">Ricerca Località</label>
            <div className="relative group">
              <input 
                type="text" 
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Digita il comune..." 
                className="w-full glass-input rounded-xl pl-11 pr-4 py-4 text-sm" 
              />
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-4.5 text-slate-400 group-focus-within:text-accent-500 transition-colors"></i>
              {loading && <i className="fa-solid fa-spinner fa-spin absolute right-4 top-4.5 text-accent-500"></i>}
              {results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 glass-panel bg-slate-900/95 rounded-xl overflow-hidden z-50 animate-fade-in">
                  {results.map((r, i) => (
                    <div key={i} onClick={() => selectComune(r)} className="p-3 hover:bg-accent-600/30 cursor-pointer text-sm text-slate-200 border-b border-white/5 last:border-0 transition-colors flex items-center gap-2">
                      <i className="fa-solid fa-location-dot text-slate-500 text-xs"></i> {r.display_name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="glass-panel rounded-2xl p-1 flex-grow relative z-10 min-h-[400px]">
            {/* Rimosso grayscale e opacity ridotta per avere la mappa a colori vivida */}
            <div id="mappaComune" className="h-[400px] w-full rounded-xl transition-all duration-700"></div>
            {mapInfo.name !== '--' && (
              <div className="absolute bottom-4 left-4 right-4 glass-panel bg-slate-900/80 rounded-xl p-4 z-[400] flex justify-between items-center backdrop-blur-md">
                <div>
                  <div className="text-[10px] text-accent-400 font-bold uppercase tracking-wider mb-1">Posizione</div>
                  <div className="text-white font-bold text-lg leading-none">{mapInfo.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 mb-1 uppercase">Altitudine</div>
                  <div className="text-2xl font-mono text-white leading-none">{mapInfo.alt} <span className="text-sm text-slate-500 font-sans">m</span></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Parameters */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-8">
          <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <span className="bg-accent-500/20 w-8 h-8 rounded-lg flex items-center justify-center text-accent-500 text-sm border border-accent-500/20"><i className="fa-solid fa-file-contract"></i></span>
                Report Climatico
            </h2>
            <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">AUTOMATICO</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="text-xs text-slate-400 block mb-2 font-medium ml-1 uppercase tracking-wide">Zona Climatica</label>
                <div className="relative group">
                  <select value={zone} onChange={(e) => setZone(e.target.value)} className="w-full glass-input rounded-xl p-4 text-sm appearance-none cursor-pointer">
                    <option value="A" className="bg-slate-800">Zona A</option><option value="B" className="bg-slate-800">Zona B</option>
                    <option value="C" className="bg-slate-800">Zona C</option><option value="D" className="bg-slate-800">Zona D</option>
                    <option value="E" className="bg-slate-800">Zona E</option><option value="F" className="bg-slate-800">Zona F</option>
                  </select>
                  <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-hover:text-white transition-colors"></i>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-2 font-medium ml-1 uppercase tracking-wide">Altitudine (m)</label>
                <div className="relative">
                  <input type="number" value={alt} onChange={(e) => setAlt(parseFloat(e.target.value))} className="w-full glass-input rounded-xl p-4 text-sm font-mono font-bold" />
                </div>
              </div>
            </div>
            
            <div className="space-y-6 md:pl-8 md:border-l border-white/5">
              <div>
                <label className="text-xs text-slate-400 block mb-2 font-medium ml-1 uppercase tracking-wide">Zona Neve</label>
                <div className="relative group">
                  <select value={snowZone} onChange={(e) => setSnowZone(e.target.value)} className="w-full glass-input rounded-xl p-4 text-sm appearance-none cursor-pointer">
                    <option value="I-med" className="bg-slate-800">I - Mediterranea</option><option value="I-alp" className="bg-slate-800">I - Alpina</option>
                    <option value="II" className="bg-slate-800">Zona II</option><option value="III" className="bg-slate-800">Zona III</option>
                  </select>
                  <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-hover:text-white transition-colors"></i>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-500 mb-1 block uppercase font-bold">Coeff Ce</label>
                  <input type="number" value={coeffCe} onChange={(e) => setCoeffCe(parseFloat(e.target.value))} className="w-full glass-input rounded-lg p-3 text-sm text-center"/>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 mb-1 block uppercase font-bold">Coeff Ct</label>
                  <input type="number" value={coeffCt} onChange={(e) => setCoeffCt(parseFloat(e.target.value))} className="w-full glass-input rounded-lg p-3 text-sm text-center"/>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-black/20 rounded-2xl p-6 border border-white/5 shadow-inner">
             <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Limiti Trasmittanza (DM 2015)</span>
             </div>
             <div className="grid grid-cols-3 gap-4 text-center mb-8">
                {[
                    { l: 'Verticali', v: limits.vert },
                    { l: 'Orizzontali', v: limits.hor },
                    { l: 'Trasparenti', v: limits.win }
                ].map((item, idx) => (
                    <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/5 relative group hover:bg-white/10 transition-all cursor-pointer shadow-lg" onClick={() => copy(item.v)}>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">{item.l}</div>
                        <div className="text-2xl font-bold text-white font-mono">{item.v}</div>
                        <div className="absolute inset-0 border border-accent-500/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                ))}
             </div>

             <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-white/5 pb-3">Carichi Ambientali</div>
             <div className="grid grid-cols-2 gap-6">
                 <div className="glass-input bg-emerald-500/5 border-emerald-500/10 rounded-xl p-4 flex justify-between items-center group cursor-pointer hover:bg-emerald-500/10" onClick={() => copy(snowLoad)}>
                    <span className="text-xs text-emerald-400/70 font-bold uppercase">Carico Neve (kN/m²)</span>
                    <span className="text-2xl font-bold text-emerald-400 font-mono group-hover:scale-110 transition-transform">{snowLoad}</span>
                 </div>
                 <div className="glass-input bg-blue-500/5 border-blue-500/10 rounded-xl p-4 flex justify-between items-center group cursor-pointer hover:bg-blue-500/10" onClick={() => copy(zone)}>
                    <span className="text-xs text-blue-400/70 font-bold uppercase">Zona Climatica</span>
                    <span className="text-2xl font-bold text-blue-400 font-mono group-hover:scale-110 transition-transform">{zone}</span>
                 </div>
             </div>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-8">
        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
            <span className="bg-orange-500/20 w-8 h-8 rounded-lg flex items-center justify-center text-orange-500 text-sm border border-orange-500/20"><i className="fa-solid fa-layer-group"></i></span>
            Calcolatore Spessore Isolante
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          <div className="md:col-span-3">
             <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-2 ml-1">Materiale</label>
             <div className="relative group">
                <select onChange={(e) => setIsoLambda(parseFloat(e.target.value))} className="w-full glass-input rounded-xl p-3 text-sm appearance-none cursor-pointer">
                <option value="" className="bg-slate-800">Seleziona materiale...</option>
                <option value="0.035" className="bg-slate-800">EPS/XPS (0.035)</option>
                <option value="0.040" className="bg-slate-800">Lana di Roccia (0.040)</option>
                <option value="0.022" className="bg-slate-800">Poliuretano (0.022)</option>
                <option value="0.045" className="bg-slate-800">Sughero (0.045)</option>
                <option value="0.25" className="bg-slate-800">Muratura Poroton (0.25)</option>
                </select>
                <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"></i>
             </div>
          </div>
          <div className="md:col-span-2">
            <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-2 ml-1">Lambda (λ)</label>
            <input type="number" value={isoLambda} onChange={(e) => setIsoLambda(parseFloat(e.target.value))} placeholder="0.035" step="0.001" className="w-full glass-input rounded-xl p-3 text-sm font-mono text-center"/>
          </div>
          <div className="md:col-span-2">
            <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-2 ml-1">U Target</label>
            <input type="number" value={isoTarget} onChange={(e) => setIsoTarget(parseFloat(e.target.value))} placeholder="0.25" step="0.01" className="w-full glass-input rounded-xl p-3 text-sm font-mono text-center"/>
          </div>
          <div className="md:col-span-2">
            <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-2 ml-1">R Esistente</label>
            <input type="number" value={isoR} onChange={(e) => setIsoR(parseFloat(e.target.value))} step="0.01" className="w-full glass-input rounded-xl p-3 text-sm font-mono text-center"/>
          </div>
          <div className="md:col-span-3">
            <button onClick={calcIso} className="w-full bg-accent-600 hover:bg-accent-500 text-white font-bold px-6 py-3 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all hover:scale-[1.02] active:scale-95 border border-white/10">Calcola Spessore</button>
          </div>
        </div>
        {isoThickness !== '--' && (
          <div className="mt-6 border-t border-white/5 pt-6 flex items-center justify-between bg-white/5 rounded-xl p-4 animate-slide-in">
             <span className="text-slate-300 font-medium">Spessore Minimo Consigliato:</span>
             <div className="flex items-center gap-3 cursor-pointer group" onClick={() => copy(isoThickness)}>
                <span className="text-3xl font-bold text-accent-400 font-mono drop-shadow-md">{isoThickness}</span> 
                <span className="text-sm text-slate-400">cm</span>
                <i className="fa-regular fa-copy text-slate-600 group-hover:text-white transition-colors"></i>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}