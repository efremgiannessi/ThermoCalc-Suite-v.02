import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Thermometer, Wind, Layers, Activity } from 'lucide-react';

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
    <div className="space-y-5">
      
      {/* Module Title - Ridotto text-4xl a text-2xl */}
      <div className="flex flex-col gap-0.5">
        <span className="industrial-label">01_Climatic_Parameters_Module</span>
        <h1 className="text-2xl font-black uppercase tracking-tighter text-white">Thermal Dynamics</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Col: Map/Search */}
        <div className="lg:col-span-4 space-y-5">
          <div className="glass-card rounded-2xl p-4 border-orange-500/10">
            <span className="industrial-label">Geospatial Search</span>
            <div className="relative">
              <input 
                type="text" 
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="COMUNE..." 
                className="w-full industrial-input rounded-xl p-3 pl-10 text-[10px]" 
              />
              <Search className="absolute left-3 top-2.5 text-gray-500" size={14} />
              {loading && <div className="absolute right-3 top-3 animate-spin text-orange-500"><Activity size={12} /></div>}
              
              {results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-app-panel border border-app-border rounded-xl overflow-hidden z-[100] shadow-2xl">
                  {results.map((r, i) => (
                    <button key={i} onClick={() => selectComune(r)} className="w-full text-left p-3 hover:bg-orange-600/10 text-[9px] font-bold uppercase tracking-widest border-b border-app-border last:border-0 transition-colors">
                      {r.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-0.5 overflow-hidden min-h-[250px] relative">
            <div id="mappaComune" className="h-[250px] w-full rounded-[15px] grayscale brightness-50 opacity-40 hover:opacity-100 transition-all duration-700"></div>
            {mapInfo.name !== '--' && (
              <div className="absolute bottom-3 left-3 right-3 bg-app-panel/90 backdrop-blur-md border border-app-border p-3 rounded-xl flex justify-between items-center">
                <div>
                  <span className="industrial-label !mb-0 !text-[7px]">Node</span>
                  <div className="text-white font-black uppercase tracking-tighter text-[10px]">{mapInfo.name}</div>
                </div>
                <div className="text-right">
                  <span className="industrial-label !mb-0 !text-[7px]">Alt</span>
                  <div className="text-orange-500 font-mono font-bold text-[10px]">{mapInfo.alt} M</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Parameters */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Card: Climate */}
          <div className="glass-card rounded-2xl p-5 border-orange-500/10 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-4">
               <div className="bg-orange-600/10 p-1.5 rounded-lg border border-orange-500/20 text-orange-500">
                <Thermometer size={14} />
               </div>
               <h3 className="text-white font-black uppercase tracking-widest text-[10px]">Climatic Data</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <span className="industrial-label">Zona Climatica</span>
                <select value={zone} onChange={(e) => setZone(e.target.value)} className="w-full industrial-input rounded-xl p-3 text-[10px]">
                  <option value="A">ZONA A</option><option value="B">ZONA B</option>
                  <option value="C">ZONA C</option><option value="D">ZONA D</option>
                  <option value="E">ZONA E</option><option value="F">ZONA F</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="industrial-label">Altitudine</span>
                  <input type="number" value={alt} onChange={(e) => setAlt(parseFloat(e.target.value))} className="w-full industrial-input rounded-xl p-3 text-[10px]" />
                </div>
                <div>
                  <span className="industrial-label">Sismica</span>
                  <select value={seismicZone} onChange={(e) => setSeismicZone(e.target.value)} className="w-full industrial-input rounded-xl p-3 text-[10px]">
                    <option value="1">CL_1</option><option value="2">CL_2</option>
                    <option value="3">CL_3</option><option value="4">CL_4</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Snow Load */}
          <div className="glass-card rounded-2xl p-5 border-orange-500/10 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-4">
               <div className="bg-orange-600/10 p-1.5 rounded-lg border border-orange-500/20 text-orange-500">
                <Wind size={14} />
               </div>
               <h3 className="text-white font-black uppercase tracking-widest text-[10px]">Snow Loads</h3>
            </div>

            <div className="space-y-4">
              <div>
                <span className="industrial-label">Zona Neve</span>
                <select value={snowZone} onChange={(e) => setSnowZone(e.target.value)} className="w-full industrial-input rounded-xl p-3 text-[10px]">
                  <option value="I-med">CAT_I - Med</option><option value="I-alp">CAT_I - Alp</option>
                  <option value="II">CAT_II</option><option value="III">CAT_III</option>
                </select>
              </div>
              <div className="bg-app-input border border-app-border rounded-xl p-3 flex justify-between items-center group">
                <div>
                  <span className="industrial-label !mb-0">Snow Load</span>
                  <div className="text-xl font-mono font-black text-white">{snowLoad}</div>
                </div>
                <div className="text-orange-500 font-bold text-[9px]">kN/m²</div>
              </div>
            </div>
          </div>

          {/* Transmittance Limits */}
          <div className="glass-card rounded-2xl p-5 md:col-span-2 border-orange-500/10">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                 <div className="bg-orange-600/10 p-1.5 rounded-lg border border-orange-500/20 text-orange-500">
                  <Layers size={14} />
                 </div>
                 <h3 className="text-white font-black uppercase tracking-widest text-[10px]">Thermal Limits</h3>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
               {[
                 { label: 'Verticali', val: limits.vert },
                 { label: 'Orizzontali', val: limits.hor },
                 { label: 'Infissi', val: limits.win }
               ].map((item, idx) => (
                 <div key={idx} className="bg-app-input border border-app-border rounded-xl p-4 text-center">
                    <span className="industrial-label">{item.label}</span>
                    <div className="text-xl font-mono font-black text-white">{item.val}</div>
                    <span className="text-[9px] text-gray-500 mt-1 block">W/m²K</span>
                 </div>
               ))}
            </div>
          </div>

          {/* Insulation Calc */}
          <div className="glass-card rounded-2xl p-5 md:col-span-2 border-orange-500/10 bg-gradient-to-br from-gray-800/20 to-app-panel/40">
            <span className="industrial-label">Module: Insulation_Thickness</span>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mt-2">
               <div>
                  <span className="industrial-label">λ</span>
                  <input type="number" value={isoLambda} onChange={(e) => setIsoLambda(parseFloat(e.target.value))} placeholder="0.035" className="w-full industrial-input rounded-xl p-3 text-[10px] text-center" />
               </div>
               <div>
                  <span className="industrial-label">U Target</span>
                  <input type="number" value={isoTarget} onChange={(e) => setIsoTarget(parseFloat(e.target.value))} placeholder="0.25" className="w-full industrial-input rounded-xl p-3 text-[10px] text-center" />
               </div>
               <div>
                  <span className="industrial-label">R Res.</span>
                  <input type="number" value={isoR} onChange={(e) => setIsoR(parseFloat(e.target.value))} className="w-full industrial-input rounded-xl p-3 text-[10px] text-center" />
               </div>
               <button onClick={calcIso} className="bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-widest text-[8px] py-3.5 rounded-xl transition-all">
                  Run Calc
               </button>
            </div>
            
            {isoThickness !== '--' && (
              <div className="mt-4 pt-4 border-t border-app-border flex items-center justify-between">
                 <span className="text-gray-500 text-[9px] font-bold uppercase tracking-widest">Calculated_Thickness</span>
                 <div className="flex items-end gap-1.5">
                    <div className="text-3xl font-mono font-black text-white">{isoThickness}</div>
                    <div className="text-sm font-black text-orange-500 mb-1">CM</div>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}