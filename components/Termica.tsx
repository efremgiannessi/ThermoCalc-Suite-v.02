import { useState, useEffect, useRef } from 'react';
import { Search, Thermometer, Wind, Layers, Activity, CheckCircle, XCircle, ShieldAlert, Zap, Table as TableIcon, Info, Droplets, Sun, FileText, BarChart3, TrendingUp } from 'lucide-react';

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
      showToast("ANALISI COMPLETATA");
    }
  };

  const currentLimit = compType === 'vert' ? limits.vert : (compType === 'hor' ? limits.hor : limits.win);
  const isVerified = calculatedU !== null && calculatedU <= currentLimit;
  const sismico = parametriSismici[seismicZone] || parametriSismici["4"];

  // Funzione per generare lo spettro sismico (path SVG)
  const getSpectrumPath = () => {
    const ag = parseFloat(sismico.ag);
    const tc = parseFloat(sismico.tc);
    const fo = parseFloat(sismico.fo);
    const tb = tc / 3;
    const td = 2.0; // Valore semplificato NTC
    
    // Punti spettro (scala 200x80)
    const p1 = { x: 0, y: 70 - (ag * 30) };
    const p2 = { x: tb * 40, y: 70 - (ag * fo * 30) };
    const p3 = { x: tc * 40, y: 70 - (ag * fo * 30) };
    const p4 = { x: td * 40, y: 70 - (ag * fo * 15) };
    const p5 = { x: 200, y: 65 };

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
        {/* Sinistra: Localizzazione e Sismica */}
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
               <span className="text-white font-black uppercase tracking-widest text-[9px]">Parametri Spettrali</span>
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
            <div className="flex justify-between text-[8px] font-mono text-gray-600 px-1">
               <span>Fo: <b className="text-gray-400">{sismico.fo}</b></span>
               <span>Tc*: <b className="text-gray-400">{sismico.tc}s</b></span>
            </div>
          </div>
        </div>

        {/* Destra: Analisi Termofisica */}
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
                <button onClick={calcIso} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black text-[10px] py-3 rounded-xl uppercase tracking-widest shadow-lg shadow-orange-900/30 active:scale-95 transition-all">Esegui Analisi Progetto</button>
              </div>

              {/* Monitor Dinamico */}
              <div className="md:col-span-7 space-y-3">
                 <div className="bg-app-input border border-app-border rounded-xl p-4 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                       <div>
                          <span className="industrial-label !mb-0 text-gray-500">SPESSORE_CALCOLATO</span>
                          <div className="text-3xl font-mono font-black text-white leading-none">{isoThickness} <span className="text-[10px] font-sans text-orange-500">CM</span></div>
                       </div>
                       <div className={`px-2 py-1 rounded text-[8px] font-black uppercase ${isVerified ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' : 'bg-red-500/20 text-red-500 border border-red-500/30'}`}>
                          {isVerified ? 'CONFORME NTC' : 'FUORI LIMITE'}
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

      {/* NUOVA SEZIONE: ANALISI E REPORTISTICA AVANZATA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-6">
        <div className="lg:col-span-12">
            <div className="flex items-center gap-2 mb-4">
               <FileText size={16} className="text-orange-500" />
               <h2 className="text-sm font-black uppercase tracking-widest text-white">Analisi Tecnica & Reportistica Finale</h2>
            </div>
        </div>

        {/* Quadro Riepilogativo */}
        <div className="lg:col-span-7 glass-card rounded-2xl p-6 border-orange-500/10 overflow-hidden">
            <span className="industrial-label mb-4 flex items-center gap-2"><TableIcon size={12}/> Riepilogo Prestazionale di Progetto</span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-app-input p-3 rounded-xl border border-app-border">
                    <span className="text-[7px] font-black text-gray-500 uppercase block mb-1">LOCALITÀ</span>
                    <div className="text-[10px] font-bold text-white truncate">{mapInfo.name}</div>
                    <div className="text-[8px] text-orange-500 font-mono">{alt} m s.l.m.</div>
                </div>
                <div className="bg-app-input p-3 rounded-xl border border-app-border">
                    <span className="text-[7px] font-black text-gray-500 uppercase block mb-1">ZONA TERMICA</span>
                    <div className="text-[10px] font-black text-white">CLASSE {zone}</div>
                    <div className="text-[8px] text-gray-400 font-mono">U_lim: {currentLimit.toFixed(2)}</div>
                </div>
                <div className="bg-app-input p-3 rounded-xl border border-app-border">
                    <span className="text-[7px] font-black text-gray-500 uppercase block mb-1">U_CALCOLATA</span>
                    <div className={`text-[10px] font-black ${isVerified ? 'text-emerald-500' : 'text-red-500'}`}>
                        {calculatedU ? calculatedU.toFixed(3) : '--'}
                    </div>
                    <div className="text-[8px] text-gray-400 font-mono">W/m²K</div>
                </div>
                <div className="bg-app-input p-3 rounded-xl border border-app-border">
                    <span className="text-[7px] font-black text-gray-500 uppercase block mb-1">INERZIA ESTIVA</span>
                    <div className={`text-[10px] font-black ${thermalLag > 10 ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {thermalLag.toFixed(1)} h
                    </div>
                    <div className="text-[8px] text-gray-400 font-mono">Sfasamento</div>
                </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
                <span className="text-[8px] font-black text-gray-500 uppercase flex items-center gap-2"><BarChart3 size={10}/> Benchmark di Efficienza</span>
                <div className="relative h-6 bg-app-input rounded-lg border border-app-border overflow-hidden">
                    <div className="absolute inset-y-0 left-0 bg-orange-600/20 border-r border-orange-500/50" style={{width: '70%'}}></div>
                    {calculatedU && (
                        <div 
                            className={`absolute inset-y-0 h-full transition-all duration-1000 ${isVerified ? 'bg-emerald-500' : 'bg-red-500'}`} 
                            style={{width: `${Math.min(100, (currentLimit / (calculatedU || 1)) * 100)}%`}}
                        ></div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-white uppercase tracking-widest shadow-sm">
                        Livello di Conformità Normativa
                    </div>
                </div>
            </div>
        </div>

        {/* Spettro Sismico NTC18 */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-6 border-orange-500/10 bg-orange-950/5">
            <span className="industrial-label mb-4 flex items-center gap-2"><Activity size={12}/> Spettro di Risposta NTC 2018</span>
            <div className="bg-black/40 rounded-xl p-2 border border-app-border relative h-[100px] flex items-center justify-center">
                <svg width="100%" height="100%" viewBox="0 0 200 80" className="drop-shadow-lg">
                    {/* Assi */}
                    <line x1="5" y1="75" x2="195" y2="75" stroke="#374151" strokeWidth="1" />
                    <line x1="10" y1="5" x2="10" y2="78" stroke="#374151" strokeWidth="1" />
                    {/* Griglia */}
                    <line x1="10" y1="75" x2="10" y2="5" stroke="#1f2937" strokeWidth="0.5" strokeDasharray="2,2" />
                    <line x1="10" y1="40" x2="195" y2="40" stroke="#1f2937" strokeWidth="0.5" strokeDasharray="2,2" />
                    {/* Curva Spettro */}
                    <path 
                        d={getSpectrumPath()} 
                        fill="none" 
                        stroke="#f97316" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        className="animate-pulse"
                    />
                </svg>
                <div className="absolute top-2 right-4 text-right">
                    <div className="text-[7px] text-gray-500 font-black uppercase">Ag_Ref</div>
                    <div className="text-[10px] font-mono font-black text-orange-500">{sismico.ag}g</div>
                </div>
                <div className="absolute bottom-1 right-2 text-[6px] text-gray-600 font-mono">T(s) - Periodo</div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="bg-app-input p-2 rounded-lg">
                   <span className="text-[6px] text-gray-500 uppercase block">Stato</span>
                   <span className="text-[8px] text-white font-black">SLV</span>
                </div>
                <div className="bg-app-input p-2 rounded-lg">
                   <span className="text-[6px] text-gray-500 uppercase block">Suolo</span>
                   <span className="text-[8px] text-white font-black">CAT. A</span>
                </div>
                <div className="bg-app-input p-2 rounded-lg">
                   <span className="text-[6px] text-gray-500 uppercase block">Smorz.</span>
                   <span className="text-[8px] text-white font-black">5%</span>
                </div>
            </div>
        </div>

        {/* Quadro Efficienza Finale */}
        <div className="lg:col-span-12 glass-card rounded-2xl p-4 border-orange-500/10 flex items-center justify-between bg-gradient-to-r from-app-panel to-emerald-950/10">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isVerified ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                    {isVerified ? <TrendingUp size={20}/> : <ShieldAlert size={20}/>}
                </div>
                <div>
                    <h4 className="text-[10px] font-black text-white uppercase tracking-tighter">Valutazione Globale Involucro</h4>
                    <p className="text-[8px] text-gray-400 uppercase tracking-widest">Esito Analisi Tecnica: <span className={isVerified ? 'text-emerald-500 font-black' : 'text-red-500 font-black'}>{isVerified ? 'SISTEMA EFFICIENTE' : 'CRITICITÀ RILEVATE'}</span></p>
                </div>
            </div>
            <div className="flex gap-2">
                <button onClick={() => window.print()} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest shadow-lg shadow-orange-900/20 transition-all flex items-center gap-2">
                    <FileText size={12}/> Esporta Report
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}