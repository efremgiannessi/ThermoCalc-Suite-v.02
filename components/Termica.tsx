import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Thermometer, Wind, Zap, Layers, Activity } from 'lucide-react';

const capoluoghiDB: Record<string, { z: string; n: string; s: string }> = { 
  "milano":{z:"E", n:"I-pad", s:"4"}, "roma":{z:"D", n:"III", s:"2B"}, "torino":{z:"E", n:"I-pad", s:"4"}, 
  "napoli":{z:"C", n:"II", s:"2"}, "palermo":{z:"B", n:"II", s:"2"}, "genova":{z:"D", n:"II", s:"3"}, 
  "bologna":{z:"E", n:"I-pad", s:"3"}, "firenze":{z:"D", n:"II", s:"2"}, "bari":{z:"C", n:"II", s:"3"}, "catania":{z:"B", n:"II", s:"2"} 
};

const trasmittanze = [ 
  {zone:"A",win:3.00,hor:0.32,vert:0.40}, {zone:"B",win:3.00,hor:0.32,vert:0.40}, 
  {zone:"C",win:2.00,hor:0.32,vert:0.32}, {zone:"D",win:1.67,hor:0.24,vert:0.26}, 
  {zone:"E",win:1.30,hor:0.21,vert:0.23}, {zone:"F",win:1.00,hor:0.19,vert:0.22} 
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

  useEffect(() => {
    if (!document.getElementById('mappaComune') || mapRef.current) return;
    const L = window.L;
    if(!L) return;
    mapRef.current = L.map('mappaComune', { zoomControl: false }).setView([41.9028, 12.4964], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapRef.current);
    setTimeout(() => mapRef.current?.invalidateSize(), 200);
  }, []);

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
      setSeismicZone(capoluoghiDB[cityKey].s);
    }
  };

  const calcIso = () => {
    if(isoLambda && isoTarget) {
      const val = Math.max(0, (1/isoTarget - isoR) * isoLambda * 100);
      setIsoThickness(val.toFixed(1));
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Module Title */}
      <div className="flex flex-col gap-1">
        <span className="industrial-label">01_Climatic_Parameters_Module</span>
        <h1 className="text-4xl font-black uppercase tracking-tighter text-white">Thermal Dynamics</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Map/Search */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card rounded-3xl p-6 border-orange-500/10">
            <span className="industrial-label">Geospatial Search</span>
            <div className="relative">
              <input 
                type="text" 
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="LOCALITÀ / COMUNE..." 
                className="w-full industrial-input rounded-2xl p-4 pl-12 text-xs" 
              />
              <Search className="absolute left-4 top-3.5 text-gray-500" size={16} />
              {loading && <div className="absolute right-4 top-4 animate-spin text-orange-500"><Activity size={16} /></div>}
              
              {results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-app-panel border border-app-border rounded-2xl overflow-hidden z-[100] shadow-2xl">
                  {results.map((r, i) => (
                    <button key={i} onClick={() => selectComune(r)} className="w-full text-left p-4 hover:bg-orange-600/10 text-[10px] font-bold uppercase tracking-widest border-b border-app-border last:border-0 transition-colors">
                      {r.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="glass-card rounded-3xl p-1 overflow-hidden min-h-[350px] relative">
            <div id="mappaComune" className="h-[350px] w-full rounded-[20px] grayscale brightness-50 opacity-50 hover:grayscale-0 hover:brightness-100 hover:opacity-100 transition-all duration-700"></div>
            {mapInfo.name !== '--' && (
              <div className="absolute bottom-4 left-4 right-4 bg-app-panel/90 backdrop-blur-md border border-app-border p-4 rounded-2xl flex justify-between items-center">
                <div>
                  <span className="industrial-label !mb-0">Selected Node</span>
                  <div className="text-white font-black uppercase tracking-tighter">{mapInfo.name}</div>
                </div>
                <div className="text-right">
                  <span className="industrial-label !mb-0">Elevation</span>
                  <div className="text-orange-500 font-mono font-bold">{mapInfo.alt} <span className="text-[10px] text-gray-500">M</span></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Parameters */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card: Climate */}
          <div className="glass-card rounded-3xl p-8 border-orange-500/10 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-8">
               <div className="bg-orange-600/10 p-2 rounded-xl border border-orange-500/20 text-orange-500">
                <Thermometer size={18} />
               </div>
               <h3 className="text-white font-black uppercase tracking-widest text-xs">Climatic Zone Data</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <span className="industrial-label">Zona Climatica</span>
                <select value={zone} onChange={(e) => setZone(e.target.value)} className="w-full industrial-input rounded-2xl p-4 text-xs">
                  <option value="A">ZONA A</option><option value="B">ZONA B</option>
                  <option value="C">ZONA C</option><option value="D">ZONA D</option>
                  <option value="E">ZONA E</option><option value="F">ZONA F</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="industrial-label">Altitudine</span>
                  <input type="number" value={alt} onChange={(e) => setAlt(parseFloat(e.target.value))} className="w-full industrial-input rounded-2xl p-4 text-xs" />
                </div>
                <div>
                  <span className="industrial-label">Sismica</span>
                  <select value={seismicZone} onChange={(e) => setSeismicZone(e.target.value)} className="w-full industrial-input rounded-2xl p-4 text-xs">
                    <option value="1">CL_1 (High)</option><option value="2">CL_2 (Med)</option>
                    <option value="3">CL_3 (Low)</option><option value="4">CL_4 (Neg)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Snow Load */}
          <div className="glass-card rounded-3xl p-8 border-orange-500/10 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-8">
               <div className="bg-orange-600/10 p-2 rounded-xl border border-orange-500/20 text-orange-500">
                <Wind size={18} />
               </div>
               <h3 className="text-white font-black uppercase tracking-widest text-xs">Snow & Wind Loads</h3>
            </div>

            <div className="space-y-6">
              <div>
                <span className="industrial-label">Zona Neve</span>
                <select value={snowZone} onChange={(e) => setSnowZone(e.target.value)} className="w-full industrial-input rounded-2xl p-4 text-xs">
                  <option value="I-med">CAT_I - Med</option><option value="I-alp">CAT_I - Alp</option>
                  <option value="II">CAT_II</option><option value="III">CAT_III</option>
                </select>
              </div>
              <div className="bg-app-input border border-app-border rounded-2xl p-5 flex justify-between items-center group hover:border-orange-600/50 transition-all cursor-pointer">
                <div>
                  <span className="industrial-label !mb-0">Calculated Snow Load</span>
                  <div className="text-2xl font-mono font-black text-white">{snowLoad}</div>
                </div>
                <div className="text-orange-500 font-bold text-[10px]">kN/m²</div>
              </div>
            </div>
          </div>

          {/* Transmittance Limits */}
          <div className="glass-card rounded-3xl p-8 md:col-span-2 border-orange-500/10">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                 <div className="bg-orange-600/10 p-2 rounded-xl border border-orange-500/20 text-orange-500">
                  <Layers size={18} />
                 </div>
                 <h3 className="text-white font-black uppercase tracking-widest text-xs">Thermal Limits (DM 2018/21)</h3>
               </div>
               <div className="text-[8px] font-black text-orange-500 bg-orange-600/10 px-3 py-1 rounded-full border border-orange-500/20 tracking-[0.2em]">CORE_V11</div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {[
                 { label: 'Verticali', val: limits.vert, icon: '||' },
                 { label: 'Orizzontali', val: limits.hor, icon: '=' },
                 { label: 'Infissi', val: limits.win, icon: '[]' }
               ].map((item, idx) => (
                 <div key={idx} className="bg-app-input border border-app-border rounded-2xl p-6 text-center hover:scale-[1.02] transition-all">
                    <span className="industrial-label">{item.label}</span>
                    <div className="text-3xl font-mono font-black text-white">{item.val}</div>
                    <span className="text-[10px] text-gray-500 mt-2 block">W/m²K</span>
                 </div>
               ))}
            </div>
          </div>

          {/* Insulation Calc */}
          <div className="glass-card rounded-3xl p-8 md:col-span-2 border-orange-500/10 bg-gradient-to-br from-gray-800/40 to-app-panel/40">
            <span className="industrial-label">Module: Insulation_Thickness_Calculator</span>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end mt-4">
               <div>
                  <span className="industrial-label">Lambda (λ)</span>
                  <input type="number" value={isoLambda} onChange={(e) => setIsoLambda(parseFloat(e.target.value))} placeholder="0.035" className="w-full industrial-input rounded-2xl p-4 text-xs text-center" />
               </div>
               <div>
                  <span className="industrial-label">U Target</span>
                  <input type="number" value={isoTarget} onChange={(e) => setIsoTarget(parseFloat(e.target.value))} placeholder="0.25" className="w-full industrial-input rounded-2xl p-4 text-xs text-center" />
               </div>
               <div>
                  <span className="industrial-label">R Resistente</span>
                  <input type="number" value={isoR} onChange={(e) => setIsoR(parseFloat(e.target.value))} className="w-full industrial-input rounded-2xl p-4 text-xs text-center" />
               </div>
               <button onClick={calcIso} className="bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-widest text-[9px] py-4 rounded-2xl shadow-xl shadow-orange-900/20 transition-all active:scale-95">
                  Execute Calculation
               </button>
            </div>
            
            {isoThickness !== '--' && (
              <div className="mt-8 pt-8 border-t border-app-border flex items-center justify-between">
                 <div>
                    <span className="industrial-label !mb-0">Spessore Isolante Richiesto</span>
                    <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Calculated_Thickness_Output</div>
                 </div>
                 <div className="flex items-end gap-3">
                    <div className="text-5xl font-mono font-black text-white">{isoThickness}</div>
                    <div className="text-xl font-black text-orange-500 mb-2">CM</div>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}