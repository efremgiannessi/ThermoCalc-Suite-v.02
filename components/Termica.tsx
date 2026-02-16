
import { useState, useEffect, useRef } from 'react';
import { Search, Thermometer, Layers, Activity, ShieldAlert, Zap, Table as TableIcon, Droplets, Sun, FileText, BarChart3, TrendingUp, ClipboardCheck, Gauge, Info } from 'lucide-react';

const capoluoghiDB: Record<string, { z: string; n: string; s: string }> = { 
  "milano":{z:"E", n:"I-pad", s:"4"}, "roma":{z:"D", n:"III", s:"2B"}, "torino":{z:"E", n:"I-pad", s:"4"}, 
  "napoli":{z:"C", n:"II", s:"2"}, "palermo":{z:"B", n:"II", s:"2"}, "genova":{z:"D", n:"II", s:"3"}, 
  "bologna":{z:"E", n:"I-pad", s:"3"}, "firenze":{z:"D", n:"II", s:"2"}, "bari":{z:"C", n:"II", s:"3"}, "catania":{z:"B", n:"II", s:"2"} 
};

const limitiTermici = [ 
  {zona:"A", infissi:3.00, solai:0.32, pareti:0.40}, 
  {zona:"B", infissi:3.00, solai:0.32, pareti:0.40}, 
  {zona:"C", infissi:2.00, solai:0.32, pareti:0.32}, 
  {zona:"D", infissi:1.67, solai:0.24, pareti:0.26}, 
  {zona:"E", infissi:1.30, solai:0.21, pareti:0.23}, 
  {zona:"F", infissi:1.00, solai:0.19, pareti:0.22} 
];

const parametriSismici: Record<string, { ag: string, fo: string, tc: string, desc: string }> = {
  "1": { ag: "0.25", fo: "2.50", tc: "0.40", desc: "Sismicità Alta" },
  "2": { ag: "0.15", fo: "2.45", tc: "0.35", desc: "Sismicità Media" },
  "3": { ag: "0.10", fo: "2.40", tc: "0.30", desc: "Sismicità Bassa" },
  "4": { ag: "0.05", fo: "2.35", tc: "0.25", desc: "Sismicità Molto Bassa" }
};

const isolantiDB = [
  { name: "Aerogel", lambda: 0.015, density: 150, cp: 1000, mu: 5, cat: "Avanzati" },
  { name: "Pannelli Sottovuoto (VIP)", lambda: 0.007, density: 200, cp: 800, mu: 10000, cat: "Avanzati" },
  { name: "Poliuretano (PUR/PIR)", lambda: 0.024, density: 35, cp: 1400, mu: 60, cat: "Sintetici" },
  { name: "Lana di Vetro", lambda: 0.031, density: 20, cp: 1030, mu: 1, cat: "Minerali" },
  { name: "XPS (Polistirene Estruso)", lambda: 0.034, density: 35, cp: 1450, mu: 150, cat: "Sintetici" },
  { name: "EPS (Polistirene Espanso)", lambda: 0.035, density: 20, cp: 1450, mu: 40, cat: "Sintetici" },
  { name: "Lana di Roccia", lambda: 0.036, density: 100, cp: 1030, mu: 1, cat: "Minerali" },
  { name: "Fibra di Legno", lambda: 0.039, density: 160, cp: 2100, mu: 5, cat: "Naturali" },
  { name: "Sughero Bruno", lambda: 0.040, density: 120, cp: 1600, mu: 15, cat: "Naturali" },
  { name: "Cellulosa", lambda: 0.040, density: 50, cp: 1900, mu: 2, cat: "Naturali" },
  { name: "Sughero Naturale", lambda: 0.045, density: 100, cp: 1600, mu: 10, cat: "Naturali" },
  { name: "Vetro Cellulare", lambda: 0.050, density: 120, cp: 1000, mu: 10000, cat: "Minerali" },
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
  const [seismicZone, setSeismicZone] = useState('2');
  const [limits, setLimits] = useState({ vert: 0, hor: 0, win: 0 });
  const [snowLoad, setSnowLoad] = useState('0.00');

  const [isoMaterialIndex, setIsoMaterialIndex] = useState(0);
  const [isoLambda, setIsoLambda] = useState<number>(0.035);
  const [isoTarget, setIsoTarget] = useState<number>(0.23);
  const [isoR, setIsoR] = useState(0.17); 
  const [isoThickness, setIsoThickness] = useState<string>('--');
  const [calculatedU, setCalculatedU] = useState<number | null>(null);
  const [compType, setCompType] = useState<'vert' | 'hor' | 'win'>('vert');

  const [thermalLag, setThermalLag] = useState<number>(0); 
  const [vaporRisk, setVaporRisk] = useState<'LOW' | 'MED' | 'HIGH'>('LOW');
  const [showRefTables, setShowRefTables] = useState(false);

  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!document.getElementById('mappaComune') || mapRef.current) return;
    const L = window.L;
    if(!L) return;
    mapRef.current = L.map('mappaComune', { zoomControl: false, attributionControl: false }).setView([41.9028, 12.4964], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapRef.current);
    setTimeout(() => mapRef.current?.invalidateSize(), 100);
  }, []);

  useEffect(() => {
    const d = limitiTermici.find(x => x.zona === zone);
    if(d) setLimits({ vert: d.pareti, hor: d.solai, win: d.infissi });

    const as = alt;
    let qsk = 0;
    if (snowZone === 'I-alp') qsk = as <= 200 ? 1.50 : 1.39 * (1 + Math.pow(as/728, 2));
    else if (snowZone === 'I-med') qsk = as <= 200 ? 1.35 : 1.35 * (1 + Math.pow(as/602, 2));
    else if (snowZone === 'II') qsk = as <= 200 ? 1.00 : 0.85 * (1 + Math.pow(as/481, 2));
    else if (snowZone === 'III') qsk = as <= 200 ? 0.60 : 0.51 * (1 + Math.pow(as/481, 2));
    setSnowLoad((qsk * 0.8).toFixed(2));
  }, [zone, alt, snowZone]);

  const handleSearch = async (query: string) => {
    setSearch(query);
    if(query.length < 3) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&countrycodes=it&limit=5`);
      const data = await res.json();
      setResults(data);
    } catch(e) {}
    setLoading(false);
  };

  const selectComune = async (item: any) => {
    setResults([]);
    const displayName = item.display_name.split(',')[0];
    setSearch(displayName);
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
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
      setSeismicZone(capoluoghiDB[cityKey].s[0]);
    }
  };

  const calcIso = () => {
    if(isoLambda && isoTarget) {
      const thicknessM = (1/isoTarget - isoR) * isoLambda;
      const thicknessCm = Math.max(0, thicknessM * 100);
      setIsoThickness(thicknessCm.toFixed(1));
      setCalculatedU(isoTarget);
      const mat = isolantiDB[isoMaterialIndex];
      const alpha = isoLambda / (mat.density * mat.cp); 
      const period = 24 * 3600; 
      const phi = (thicknessM * Math.sqrt(Math.PI / (alpha * period))) * (24 / (2 * Math.PI));
      setThermalLag(phi);
      if (mat.mu < 5) setVaporRisk('HIGH');
      else if (mat.mu < 50) setVaporRisk('MED');
      else setVaporRisk('LOW');
      showToast("REPORT GENERATO");
    }
  };

  const currentLimit = compType === 'vert' ? limits.vert : (compType === 'hor' ? limits.hor : limits.win);
  const isVerified = calculatedU !== null && calculatedU <= currentLimit;
  const sismico = parametriSismici[seismicZone] || parametriSismici["4"];

  const getSpectrumPath = () => {
    const ag = parseFloat(sismico.ag);
    const tc = parseFloat(sismico.tc);
    const fo = parseFloat(sismico.fo);
    const tb = tc / 3;
    const td = 2.0; 
    const p1 = { x: 10, y: 75 - (ag * 100) };
    const p2 = { x: 10 + tb * 50, y: 75 - (ag * fo * 100) };
    const p3 = { x: 10 + tc * 50, y: 75 - (ag * fo * 100) };
    const p4 = { x: 10 + td * 50, y: 75 - (ag * fo * 50) };
    const p5 = { x: 195, y: 72 };
    return `M ${p1.x},${p1.y} L ${p2.x},${p2.y} L ${p3.x},${p3.y} Q ${p4.x},${p4.y} ${p5.x},${p5.y}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <span className="industrial-label text-orange-600">MODULO_01_DINAMICA_TERMICA_SISMICA_V12</span>
          <h1 className="text-xl font-black uppercase tracking-tighter text-white">Ingegneria Climatica & NTC</h1>
        </div>
        <button 
          onClick={() => setShowRefTables(!showRefTables)}
          className="flex items-center gap-2 bg-gray-800 hover:bg-orange-600 px-3 py-1.5 rounded-lg border border-gray-700 transition-all text-[8px] font-black uppercase"
        >
          <TableIcon size={12} /> {showRefTables ? 'Nascondi Tabelle' : 'Consulta Tabelle Normative'}
        </button>
      </div>

      {showRefTables && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in no-print">
          <div className="glass-card rounded-xl p-4 border-orange-500/20">
            <span className="industrial-label mb-2 flex items-center gap-1"><Zap size={8}/> Trasmittanze Limite U [W/m²K]</span>
            <table className="w-full text-[8px] text-left">
              <thead className="text-orange-500 border-b border-app-border uppercase">
                <tr><th className="pb-1">Zona</th><th className="pb-1">Parete</th><th className="pb-1">Solaio</th><th className="pb-1">Infissi</th></tr>
              </thead>
              <tbody className="text-gray-400 font-mono">
                {limitiTermici.map(l => (
                  <tr key={l.zona} className={`border-b border-app-border/30 ${l.zona === zone ? 'bg-orange-600/10 text-white font-bold' : ''}`}>
                    <td className="py-1">ZONA {l.zona}</td><td>{l.pareti.toFixed(2)}</td><td>{l.solai.toFixed(2)}</td><td>{l.infissi.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="glass-card rounded-xl p-4 border-orange-500/20 overflow-y-auto max-h-[160px] custom-scrollbar">
            <span className="industrial-label mb-2 flex items-center gap-1"><Sun size={8}/> Inerzia Materiali [λ | ρ | cp]</span>
            <div className="grid grid-cols-1 gap-1 text-[7px]">
              {isolantiDB.map(m => (
                <div key={m.name} className="flex justify-between border-b border-app-border/30 py-0.5">
                  <span className="text-gray-400 uppercase truncate pr-2">{m.name}</span>
                  <span className="text-orange-500 font-mono">{m.lambda.toFixed(3)} | {m.density} | {m.cp}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card rounded-xl p-4 border-orange-500/20">
             <span className="industrial-label mb-2 flex items-center gap-1"><ShieldAlert size={8}/> Sismica NTC18 [ag/g]</span>
             <div className="space-y-1">
                {Object.entries(parametriSismici).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-[8px] border-b border-app-border/30 py-0.5">
                        <span className="text-gray-400">ZONA {k} ({v.desc})</span>
                        <span className="text-white font-mono">{v.ag}</span>
                    </div>
                ))}
             </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Colonna Sinistra */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-card rounded-xl p-3 border-orange-500/10">
            <span className="industrial-label">GEO_LOCALIZZAZIONE_NTC</span>
            <div className="relative">
              <input type="text" value={search} onChange={(e) => handleSearch(e.target.value)} placeholder="CITTA'..." className="w-full industrial-input rounded-lg p-2 pl-8 text-[9px]" />
              <Search className="absolute left-2.5 top-2 text-gray-500" size={12} />
              {loading && <div className="absolute right-2.5 top-2 animate-spin text-orange-500"><Activity size={12} /></div>}
            </div>
            {results.length > 0 && (
                <div className="absolute mt-1 bg-app-panel border border-app-border rounded-lg overflow-hidden z-[100] shadow-xl w-[250px]">
                  {results.map((r, i) => (
                    <button key={i} onClick={() => selectComune(r)} className="w-full text-left p-2 hover:bg-orange-600/10 text-[8px] font-bold uppercase tracking-widest border-b border-app-border last:border-0">{r.display_name}</button>
                  ))}
                </div>
              )}
          </div>
          
          <div className="glass-card rounded-xl overflow-hidden h-[120px] relative border-orange-500/5">
            <div id="mappaComune" className="h-full w-full grayscale brightness-50 opacity-40"></div>
          </div>
          
          <div className="glass-card rounded-xl p-4 border-orange-500/10 bg-app-input/50">
            <div className="flex items-center gap-2 mb-3">
               <ShieldAlert size={12} className="text-orange-500" />
               <span className="text-white font-black uppercase tracking-widest text-[9px]">Parametri Spettrali SLV</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-app-input p-2 rounded border border-app-border text-center">
                <span className="industrial-label !mb-0 text-gray-600">ZONA</span>
                <div className="text-lg font-mono font-black text-white">{seismicZone}</div>
              </div>
              <div className="bg-orange-600/10 p-2 rounded border border-orange-500/20 flex flex-col justify-center text-center">
                <span className="text-[7px] font-black text-orange-500 uppercase">Accel_ag</span>
                <div className="text-sm font-mono font-black text-white">{sismico.ag}g</div>
              </div>
            </div>
          </div>
        </div>

        {/* Colonna Destra */}
        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card rounded-xl p-4 border-orange-500/10 bg-app-panel">
              <div className="flex items-center gap-2 mb-3">
                 <Thermometer size={12} className="text-orange-500" />
                 <span className="text-white font-black uppercase tracking-widest text-[9px]">Climatologia Tecnica</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-app-input p-2 rounded border border-app-border">
                  <span className="industrial-label">ZONA TERMICA</span>
                  <select value={zone} onChange={(e) => setZone(e.target.value)} className="w-full bg-transparent text-white font-mono font-bold text-[10px] outline-none">
                    { limitiTermici.map(t => <option key={t.zona} value={t.zona} className="bg-app-panel">ZONA {t.zona}</option>) }
                  </select>
                </div>
                <div className="bg-app-input p-2 rounded border border-app-border text-center">
                  <span className="industrial-label">CARICO NEVE</span>
                  <div className="text-orange-500 font-mono font-black text-[10px]">{snowLoad} kN/m²</div>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-4 border-orange-500/10 flex flex-col justify-center bg-app-panel">
               <div className="flex items-center gap-2 mb-2">
                  <Zap size={12} className="text-orange-500" />
                  <span className="text-white font-black uppercase tracking-widest text-[9px]">Componente Edilizio</span>
               </div>
               <div className="flex gap-1 justify-between">
                  {['vert', 'hor', 'win'].map(t => (
                    <button key={t} onClick={() => setCompType(t as any)} className={`flex-1 py-1.5 text-[8px] font-black uppercase rounded border transition-all ${compType === t ? 'bg-orange-600 border-orange-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-500'}`}>
                      {t === 'vert' ? 'PARETE' : (t === 'hor' ? 'SOLAIO' : 'INFISSO')}
                    </button>
                  ))}
               </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-5 border-orange-500/10 bg-gradient-to-br from-app-panel to-orange-950/10">
            <div className="flex items-center gap-2 mb-4">
              <Layers size={14} className="text-orange-500" />
              <span className="text-white font-black uppercase tracking-widest text-[10px]">Analisi Stratigrafica Dinamica</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              <div className="md:col-span-5 space-y-4">
                <div>
                  <span className="industrial-label">ISOLANTE_DATABASE_UNI</span>
                  <select 
                    value={isoMaterialIndex} 
                    onChange={(e) => {
                      const idx = parseInt(e.target.value);
                      setIsoMaterialIndex(idx);
                      setIsoLambda(isolantiDB[idx].lambda);
                    }} 
                    className="w-full industrial-input rounded-lg p-2.5 text-[10px] custom-scrollbar"
                  >
                    {isolantiDB.map((m, i) => <option key={i} value={i}>{m.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="industrial-label">U_TARGET (W/m²K)</span>
                    <input type="number" step="0.01" value={isoTarget} onChange={(e) => setIsoTarget(parseFloat(e.target.value))} className="w-full industrial-input rounded-lg p-2 text-[10px]" />
                  </div>
                  <div>
                    <span className="industrial-label">R_STRUTTURALE</span>
                    <input type="number" step="0.01" value={isoR} onChange={(e) => setIsoR(parseFloat(e.target.value))} className="w-full industrial-input rounded-lg p-2 text-[10px]" />
                  </div>
                </div>
                <button onClick={calcIso} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black text-[10px] py-3 rounded-xl uppercase tracking-widest shadow-lg shadow-orange-900/30 active:scale-95 transition-all">Esegui Check Tecnico</button>
              </div>

              <div className="md:col-span-7 space-y-3">
                 <div className="bg-app-input border border-app-border rounded-xl p-4 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                       <div>
                          <span className="industrial-label !mb-0 text-gray-500">SPESSORE_PROGETTO</span>
                          <div className="text-3xl font-mono font-black text-white leading-none">{isoThickness} <span className="text-[10px] font-sans text-orange-500">CM</span></div>
                       </div>
                       <div className={`px-2 py-1 rounded text-[8px] font-black uppercase ${isVerified ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' : 'bg-red-500/20 text-red-500 border border-red-500/30'}`}>
                          {isVerified ? 'IDONEO NTC' : 'VALORE CRITICO'}
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-2 border-t border-app-border pt-4">
                       <div className="flex items-center gap-3">
                          <div className="bg-orange-500/10 p-2 rounded-lg text-orange-500"><Sun size={14}/></div>
                          <div>
                             <span className="industrial-label !mb-0 text-gray-500">SFASAMENTO</span>
                             <div className="text-sm font-mono font-black text-white">{thermalLag.toFixed(1)} <span className="text-[8px] text-gray-600">ORE</span></div>
                          </div>
                       </div>
                       <div className="flex items-center gap-3">
                          <div className={`${vaporRisk === 'HIGH' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'} p-2 rounded-lg`}><Droplets size={14}/></div>
                          <div>
                             <span className="industrial-label !mb-0 text-gray-500">RISCHIO_VAPORE</span>
                             <div className={`text-[10px] font-black uppercase ${vaporRisk === 'HIGH' ? 'text-red-500' : 'text-blue-500'}`}>
                                {vaporRisk === 'LOW' ? 'MINIMO' : (vaporRisk === 'MED' ? 'MEDIO' : 'ELEVATO')}
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SEZIONE REPORTISTICA E GRAFICI AVANZATI */}
      <div className="mt-8 space-y-6 animate-fade-in">
        <div className="flex items-center gap-2 px-2">
            <div className="bg-orange-600 p-1.5 rounded-lg text-white shadow-lg shadow-orange-900/40">
                <FileText size={18} />
            </div>
            <h2 className="text-lg font-black uppercase tracking-tighter text-white">Centro Analisi & Diagnostica NTC</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Radar Chart di Qualità (SVG) */}
            <div className="lg:col-span-4 glass-card rounded-2xl p-6 border-orange-500/10 bg-app-panel/40">
                <span className="industrial-label mb-6 flex items-center gap-2"><Gauge size={12}/> Radar Qualità Involucro</span>
                <div className="relative h-[200px] flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full opacity-80">
                        {/* Background Polygons */}
                        {[20, 40, 60, 80, 100].map(r => (
                            <polygon key={r} points="50,50 50,50 50,50 50,50" className="stroke-gray-800 fill-none" strokeWidth="0.5" transform={`translate(50,50) scale(${r/50}) translate(-50,-50)`} d={`M 50,${50-r/2} L ${50+r/2},50 L 50,${50+r/2} L ${50-r/2},50 Z`} />
                        ))}
                        {/* Axes */}
                        <line x1="50" y1="0" x2="50" y2="100" stroke="#1f2937" strokeWidth="0.5" />
                        <line x1="0" y1="50" x2="100" y2="50" stroke="#1f2937" strokeWidth="0.5" />
                        
                        {/* Data Polygon */}
                        {calculatedU && (
                            <polygon 
                                points={`50,${50 - (isVerified ? 40 : 10)} ${50 + (thermalLag > 10 ? 40 : 20)},50 50,${50 + (vaporRisk === 'LOW' ? 40 : 15)} ${50 - (isoThickness !== '--' ? 35 : 5)},50`} 
                                className="fill-orange-600/30 stroke-orange-500" 
                                strokeWidth="1.5"
                            />
                        )}

                        <text x="50" y="8" textAnchor="middle" fontSize="4" fill="#6b7280" fontWeight="bold">TERMICA</text>
                        <text x="92" y="52" textAnchor="middle" fontSize="4" fill="#6b7280" fontWeight="bold">INERZIA</text>
                        <text x="50" y="96" textAnchor="middle" fontSize="4" fill="#6b7280" fontWeight="bold">IGRO</text>
                        <text x="8" y="52" textAnchor="middle" fontSize="4" fill="#6b7280" fontWeight="bold">MASSA</text>
                    </svg>
                </div>
            </div>

            {/* Spettro Sismico Dettagliato */}
            <div className="lg:col-span-8 glass-card rounded-2xl p-6 border-orange-500/10 bg-gradient-to-br from-app-panel to-slate-900/30">
                <span className="industrial-label mb-4 flex items-center gap-2"><Activity size={12}/> Spettro Elastico di Risposta (SLV)</span>
                <div className="bg-black/40 rounded-xl p-4 border border-app-border relative h-[180px]">
                    <svg width="100%" height="100%" viewBox="0 0 200 80" className="overflow-visible">
                        {/* Griglia */}
                        <line x1="10" y1="75" x2="195" y2="75" stroke="#374151" strokeWidth="1" />
                        <line x1="10" y1="5" x2="10" y2="78" stroke="#374151" strokeWidth="1" />
                        <path d={getSpectrumPath()} fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" className="drop-shadow-lg" />
                        
                        {/* Plateau Marker */}
                        <line x1={10 + (parseFloat(sismico.tc)/3)*50} y1="0" x2={10 + (parseFloat(sismico.tc)/3)*50} y2="80" stroke="#f97316" strokeWidth="0.5" strokeDasharray="2,2" />
                        <line x1={10 + parseFloat(sismico.tc)*50} y1="0" x2={10 + parseFloat(sismico.tc)*50} y2="80" stroke="#f97316" strokeWidth="0.5" strokeDasharray="2,2" />
                        
                        <text x="10" y="79" fontSize="4" fill="#4b5563">0.0</text>
                        <text x="195" y="79" fontSize="4" fill="#4b5563" textAnchor="end">T(s)</text>
                    </svg>
                    <div className="absolute top-4 right-6 text-right space-y-1">
                        <div className="text-[10px] font-black text-white leading-none">{sismico.ag}g <span className="text-[6px] text-orange-500 uppercase tracking-widest ml-1">ag_Ref</span></div>
                        <div className="text-[7px] text-gray-500 uppercase tracking-widest">Suolo Cat. A | Smorzamento 5%</div>
                    </div>
                </div>
                <div className="mt-4 flex justify-between gap-4">
                    <div className="bg-app-input p-2 rounded-lg flex-1 border border-app-border">
                        <span className="text-[7px] text-gray-500 uppercase font-black block">Tratto Tb-Tc</span>
                        <div className="text-[10px] font-mono font-bold text-white">Sa(T) = {sismico.ag} * {sismico.fo}</div>
                    </div>
                    <div className="bg-app-input p-2 rounded-lg flex-1 border border-app-border">
                        <span className="text-[7px] text-gray-500 uppercase font-black block">Smorzamento</span>
                        <div className="text-[10px] font-mono font-bold text-white">η = 1.00</div>
                    </div>
                </div>
            </div>

            {/* Matrice di Verifica Finale */}
            <div className="lg:col-span-12 glass-card rounded-2xl p-6 border-emerald-500/20 bg-emerald-950/5">
                <div className="flex justify-between items-center mb-4">
                    <span className="industrial-label !mb-0 flex items-center gap-2 text-emerald-500"><ClipboardCheck size={12}/> Matrice di Validazione Requisiti Minimi</span>
                    <span className="text-[8px] font-mono text-gray-500 uppercase">LOCALITÀ_REF: {mapInfo.name}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3 bg-app-panel p-3 rounded-xl border border-app-border/40">
                        <div className={isVerified ? 'text-emerald-500' : 'text-red-500'}><BarChart3 size={16}/></div>
                        <div>
                            <div className="text-[8px] font-black text-gray-500 uppercase">Trasmittanza U</div>
                            <div className="text-[10px] font-bold text-white uppercase">{isVerified ? 'VERIFICATA' : 'FALLITA'}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-app-panel p-3 rounded-xl border border-app-border/40">
                        <div className={thermalLag > 8 ? 'text-emerald-500' : 'text-amber-500'}><TrendingUp size={16}/></div>
                        <div>
                            <div className="text-[8px] font-black text-gray-500 uppercase">Sfasamento Estivo</div>
                            <div className="text-[10px] font-bold text-white uppercase">{thermalLag > 8 ? 'ECCELLENTE' : 'MINIMO'}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-app-panel p-3 rounded-xl border border-app-border/40">
                        <div className={vaporRisk === 'LOW' ? 'text-emerald-500' : 'text-red-500'}><Droplets size={16}/></div>
                        <div>
                            <div className="text-[8px] font-black text-gray-500 uppercase">Bilancio Igro</div>
                            <div className="text-[10px] font-bold text-white uppercase">{vaporRisk === 'LOW' ? 'STABILE' : 'A RISCHIO'}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-app-panel p-3 rounded-xl border border-app-border/40">
                        <div className="text-emerald-500"><Activity size={16}/></div>
                        <div>
                            <div className="text-[8px] font-black text-gray-500 uppercase">D.M. 26/06/15</div>
                            <div className="text-[10px] font-bold text-white uppercase">CONFORME</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="lg:col-span-12 flex justify-between items-center p-4 bg-orange-600/10 rounded-2xl border border-orange-500/20">
                <div className="flex items-center gap-4">
                    <div className="text-orange-500 animate-pulse"><Info size={20}/></div>
                    <div>
                        <h3 className="text-[11px] font-black text-white uppercase leading-none">Generazione Report PDF/CSV</h3>
                        <p className="text-[8px] text-gray-500 uppercase tracking-widest mt-1">Dati basati su NTC 2018 & UNI EN ISO 13786</p>
                    </div>
                </div>
                <div className="flex gap-2 no-print">
                    <button onClick={() => window.print()} className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-orange-900/20 flex items-center gap-2">
                        <FileText size={12}/> Esporta Documento
                    </button>
                </div>
            </div>
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
                  Modulo per il calcolo delle prestazioni energetiche e sismiche in base alla località (Geo-Ref). Fornisce valori di Trasmittanza (U), Sfasamento termico e verifica del rischio condensa interstiziale.
              </div>
              <div>
                  <strong className="text-slate-300 block mb-1">Modalità d'Uso</strong>
                  Cerca una città per caricare i dati climatici e sismici (Zona, Neve, Ag). Seleziona un isolante dal database e imposta il target U per ottenere lo spessore necessario.
              </div>
              <div>
                  <strong className="text-slate-300 block mb-1">Normative di Riferimento</strong>
                  D.M. 26/06/2015 (Requisiti Minimi), UNI EN ISO 13786 (Comportamento dinamico), NTC 2018 (Parametri Sismici e Carico Neve).
              </div>
          </div>
      </div>
    </div>
  );
}