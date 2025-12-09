import React, { useState, useEffect, useRef } from 'react';

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

    mapRef.current = L.map('mappaComune').setView([41.9028, 12.4964], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
      attribution: '© OSM', maxZoom: 18 
    }).addTo(mapRef.current);

    // Invalidate size to ensure it renders correctly after tab switch
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
    
    // Simplified mu1 logic (assuming standard roof < 30deg for generic calc)
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
    <div className="space-y-6 animate-[slideIn_0.3s]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map & Search */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-dark-800 rounded-2xl border border-dark-700 shadow-xl p-5 relative z-20">
            <label className="text-xs text-slate-400 block mb-2 font-bold uppercase">Cerca Comune</label>
            <div className="relative">
              <input 
                type="text" 
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Digita il comune..." 
                className="w-full bg-dark-input border border-dark-600 rounded-lg pl-10 pr-4 py-3 text-white focus:border-accent-500 outline-none transition-all" 
              />
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-3.5 text-slate-500"></i>
              {loading && <i className="fa-solid fa-spinner fa-spin absolute right-3 top-3.5 text-accent-500"></i>}
              {results.length > 0 && (
                <div className="absolute top-100 left-0 right-0 bg-dark-800 border border-dark-700 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto mt-1">
                  {results.map((r, i) => (
                    <div key={i} onClick={() => selectComune(r)} className="p-2 hover:bg-accent-600 cursor-pointer text-sm text-slate-200 border-b border-dark-700 last:border-0">
                      {r.display_name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="bg-dark-800 rounded-2xl border border-dark-700 shadow-xl p-1 flex-grow relative z-10 min-h-[350px]">
            <div id="mappaComune" className="h-[350px] w-full rounded-xl border border-dark-700"></div>
            {mapInfo.name !== '--' && (
              <div className="absolute bottom-4 left-4 right-4 bg-dark-900/90 backdrop-blur border border-dark-600 rounded-lg p-3 shadow-lg z-[400]">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs text-accent-500 font-bold uppercase mb-1">Posizione</div>
                    <div className="text-white font-bold text-sm flex items-center gap-2">{mapInfo.name} <i onClick={() => copy(mapInfo.name)} className="fa-regular fa-copy text-xs text-slate-500 hover:text-white cursor-pointer"></i></div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Altitudine</div>
                    <div className="text-accent-500 font-bold text-lg flex justify-end items-center gap-2">{mapInfo.alt} m <i onClick={() => copy(mapInfo.alt)} className="fa-regular fa-copy text-xs text-slate-500 hover:text-white cursor-pointer"></i></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Parameters */}
        <div className="lg:col-span-7 bg-dark-800 rounded-2xl border border-dark-700 shadow-xl p-6">
          <div className="flex justify-between items-center mb-6 border-b border-dark-700 pb-3">
            <h2 className="font-semibold text-white flex items-center gap-2"><i className="fa-solid fa-file-contract text-accent-500"></i> Report Caratteristiche</h2>
            <span className="text-[10px] bg-accent-600/20 text-accent-400 px-2 py-1 rounded border border-accent-600/30">Dati Automatici</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Zona Climatica</label>
                <div className="relative">
                  <select value={zone} onChange={(e) => setZone(e.target.value)} className="w-full bg-dark-input border border-dark-700 rounded-lg p-3 text-sm text-white focus:border-accent-500 outline-none">
                    <option value="A">Zona A</option><option value="B">Zona B</option><option value="C">Zona C</option>
                    <option value="D">Zona D</option><option value="E">Zona E</option><option value="F">Zona F</option>
                  </select>
                  <button onClick={() => copy(zone)} className="absolute right-3 top-3 text-slate-500 hover:text-white"><i className="fa-regular fa-copy"></i></button>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Altitudine (m)</label>
                <div className="relative">
                  <input type="number" value={alt} onChange={(e) => setAlt(parseFloat(e.target.value))} className="w-full bg-dark-input border border-dark-700 rounded-lg p-3 text-sm text-white font-bold" />
                  <button onClick={() => copy(alt)} className="absolute right-3 top-3 text-slate-500 hover:text-white"><i className="fa-regular fa-copy"></i></button>
                </div>
              </div>
            </div>
            <div className="space-y-4 md:pl-6 md:border-l border-dark-700">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Zona Neve</label>
                <div className="relative">
                  <select value={snowZone} onChange={(e) => setSnowZone(e.target.value)} className="w-full bg-dark-input border border-dark-700 rounded-lg p-3 text-sm text-white">
                    <option value="I-med">I - Mediterranea</option><option value="I-alp">I - Alpina</option>
                    <option value="II">Zona II</option><option value="III">Zona III</option>
                  </select>
                  <button onClick={() => copy(snowZone)} className="absolute right-3 top-3 text-slate-500 hover:text-white"><i className="fa-regular fa-copy"></i></button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400">Coeff Ce</label>
                  <input type="number" value={coeffCe} onChange={(e) => setCoeffCe(parseFloat(e.target.value))} className="w-full bg-dark-input border border-dark-700 rounded p-2 text-sm text-white"/>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Coeff Ct</label>
                  <input type="number" value={coeffCt} onChange={(e) => setCoeffCt(parseFloat(e.target.value))} className="w-full bg-dark-input border border-dark-700 rounded p-2 text-sm text-white"/>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 bg-dark-900/50 rounded-xl p-5 border border-dark-700">
             <div className="flex items-center justify-between border-b border-dark-600 pb-2 mb-4"><span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Limiti DM 2015</span></div>
             <div className="grid grid-cols-3 gap-3 text-center mb-6">
                <div className="bg-dark-800 rounded-lg p-3 border border-dark-600 shadow-sm relative group">
                    <div className="text-[10px] text-slate-500 uppercase mt-1">Verticali</div>
                    <div className="text-xl font-bold text-white">{limits.vert}</div>
                    <button onClick={() => copy(limits.vert)} className="absolute top-2 right-2 text-slate-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"><i className="fa-regular fa-copy"></i></button>
                </div>
                <div className="bg-dark-800 rounded-lg p-3 border border-dark-600 shadow-sm relative group">
                    <div className="text-[10px] text-slate-500 uppercase mt-1">Orizzontali</div>
                    <div className="text-xl font-bold text-white">{limits.hor}</div>
                    <button onClick={() => copy(limits.hor)} className="absolute top-2 right-2 text-slate-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"><i className="fa-regular fa-copy"></i></button>
                </div>
                <div className="bg-dark-800 rounded-lg p-3 border border-dark-600 shadow-sm relative group">
                    <div className="text-[10px] text-slate-500 uppercase mt-1">Trasparenti</div>
                    <div className="text-xl font-bold text-white">{limits.win}</div>
                    <button onClick={() => copy(limits.win)} className="absolute top-2 right-2 text-slate-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"><i className="fa-regular fa-copy"></i></button>
                </div>
             </div>
             <div className="text-xs font-bold text-slate-400 uppercase mb-3 border-b border-dark-600 pb-2">Dati Ambientali</div>
             <div className="grid grid-cols-2 gap-4 text-center">
                 <div className="relative group"><div className="text-[10px] text-slate-500 uppercase">Carico Neve (kN/m²)</div><div className="text-xl font-bold text-emerald-400">{snowLoad}</div><button onClick={() => copy(snowLoad)} className="absolute top-0 right-10 text-slate-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"><i className="fa-regular fa-copy"></i></button></div>
                 <div className="relative group"><div className="text-[10px] text-slate-500 uppercase">Zona Climatica</div><div className="text-xl font-bold text-white">{zone}</div><button onClick={() => copy(zone)} className="absolute top-0 right-10 text-slate-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"><i className="fa-regular fa-copy"></i></button></div>
             </div>
          </div>
        </div>
      </div>

      <div className="bg-dark-800 rounded-xl border border-dark-700 p-5">
        <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><i className="fa-solid fa-layer-group text-accent-500"></i> Calcolo Isolante</h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-3">
             <label className="text-[10px] text-slate-400 block mb-1">Materiale</label>
             <select onChange={(e) => setIsoLambda(parseFloat(e.target.value))} className="w-full bg-dark-input border border-dark-700 rounded p-2 text-xs text-slate-300">
               <option value="">Seleziona...</option><option value="0.035">EPS/XPS (0.035)</option><option value="0.040">Lana di Roccia (0.040)</option>
               <option value="0.022">Poliuretano (0.022)</option><option value="0.045">Sughero (0.045)</option><option value="0.25">Muratura Poroton (0.25)</option><option value="1.50">Calcestruzzo (1.5)</option>
             </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-[10px] text-slate-400 block mb-1">Lambda (λ)</label>
            <input type="number" value={isoLambda} onChange={(e) => setIsoLambda(parseFloat(e.target.value))} placeholder="0.035" step="0.001" className="w-full bg-dark-input border border-dark-700 rounded p-2 text-sm text-white"/>
          </div>
          <div className="md:col-span-2">
            <label className="text-[10px] text-slate-400 block mb-1">U Target</label>
            <input type="number" value={isoTarget} onChange={(e) => setIsoTarget(parseFloat(e.target.value))} placeholder="0.25" step="0.01" className="w-full bg-dark-input border border-dark-700 rounded p-2 text-sm text-white"/>
          </div>
          <div className="md:col-span-2">
            <label className="text-[10px] text-slate-400 block mb-1">R Esistente</label>
            <input type="number" value={isoR} onChange={(e) => setIsoR(parseFloat(e.target.value))} step="0.01" className="w-full bg-dark-input border border-dark-700 rounded p-2 text-sm text-white"/>
          </div>
          <div className="md:col-span-3">
            <button onClick={calcIso} className="w-full bg-dark-700 text-accent-500 font-bold px-4 py-2 rounded border border-dark-600 hover:bg-dark-600">Calcola</button>
          </div>
        </div>
        {isoThickness !== '--' && (
          <div className="text-sm text-slate-300 mt-3 border-t border-dark-700 pt-3">
             Spessore Minimo: <span className="text-xl font-bold text-white ml-2">{isoThickness}</span> cm <i onClick={() => copy(isoThickness)} className="fa-regular fa-copy text-xs text-slate-500 hover:text-white cursor-pointer ml-2"></i>
          </div>
        )}
      </div>
    </div>
  );
}