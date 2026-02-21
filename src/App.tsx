
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { TabType } from './types';
import { 
  Thermometer, 
  Calculator, 
  LineChart, 
  Ruler, 
  Scale, 
  Wrench, 
  Truck, 
  Shapes, 
  LayoutDashboard,
  ShieldCheck,
  ChevronRight,
  Menu,
  Activity,
  ArrowRightLeft,
  BrickWall,
  Droplets,
  CloudRain,
  Layers,
  FileDown,
  Trello,
  Maximize,
  Hammer,
  ExternalLink
} from 'lucide-react';

import Termica from '../components/Termica';
import Scientifica from '../components/Scientifica';
import Commerciale from '../components/Commerciale';
import Interpolazione from '../components/Interpolazione';
import Pendenze from '../components/Pendenze';
import Pesi from '../components/Pesi';
import Montaggio from '../components/Montaggio';
import Trasporto from '../components/Trasporto';
import Manufatti from '../components/Manufatti';
import Convertitore from '../components/Convertitore';
import Cantieristica from '../components/Cantieristica';
import Idraulica from '../components/Idraulica';
import Pluviali from '../components/Pluviali';
import Stratigrafie from '../components/Stratigrafie';
import Strutturale from '../components/Strutturale';
import IsoCalc from '../components/IsoCalc';
import StructuralLoad from './components/StructuralLoad';
import Footer from '../components/Footer';
import Preloader from './components/Preloader';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('termica');
  const [toast, setToast] = useState({ show: false, message: '' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const titles: Record<TabType, string> = {
        termica: "Ingegneria Termica",
        commerciale: "Analisi Commerciale",
        scientifica: "Matematica di Precisione",
        interpol: "Interpolazione Lineare",
        pendenze: "Pendenze e Gradi",
        pesi: "Massa Materiali",
        montaggio: "Preventivo Montaggio",
        trasporto: "Logistica Trasporti",
        manufatti: "Database Manufatti",
        convertitore: "Convertitore Universale",
        cantieristica: "Computo Cantiere",
        idraulica: "Idraulica e Fluidi",
        pluviali: "Drenaggio Meteo",
        stratigrafie: "Design Stratigrafie",
        strutturale: "Calcolo Strutturale",
        isocalc: "Calcolo Isolamento",
        structural_load: "Analisi Carichi Strutturali"
    };
    document.title = `OMNICALC | ${titles[activeTab].toUpperCase()}`;
  }, [activeTab]);

  const showToast = (msg: string) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: '' }), 2500);
  };

  const navItems: { id: TabType; label: string; icon: any; badge?: boolean }[] = [
    { id: 'termica', label: 'Dinamica Termica', icon: Thermometer },
    { id: 'structural_load', label: 'Structural Load', icon: Hammer, badge: true },
    { id: 'isocalc', label: 'IsoCalc Check', icon: Maximize },
    { id: 'strutturale', label: 'Strutturale Rapido', icon: Trello }, 
    { id: 'stratigrafie', label: 'Stratigrafie & Tetti', icon: Layers },
    { id: 'idraulica', label: 'Idraulica & Fluidi', icon: Droplets },
    { id: 'pluviali', label: 'Sistemi di Drenaggio', icon: CloudRain },
    { id: 'scientifica', label: 'Calcolo Scientifico', icon: Calculator },
    { id: 'commerciale', label: 'Dashboard Commerciale', icon: LayoutDashboard },
    { id: 'cantieristica', label: 'Computo Cantiere', icon: BrickWall },
    { id: 'convertitore', label: 'Convertitore Unità', icon: ArrowRightLeft },
    { id: 'interpol', label: 'Interpolazione', icon: LineChart },
    { id: 'pendenze', label: 'Pendenze e Gradi', icon: Ruler },
    { id: 'pesi', label: 'Pesi Materiali', icon: Scale },
    { id: 'montaggio', label: 'Preventivo Montaggio', icon: Wrench },
    { id: 'trasporto', label: 'Logistica Trasporti', icon: Truck },
    { id: 'manufatti', label: 'Database Manufatti', icon: Shapes },
  ];

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <Preloader key="preloader" onComplete={() => setIsLoading(false)} />
        )}
      </AnimatePresence>

      <div className="flex min-h-screen bg-app-bg text-gray-200 font-sans text-sm">
      
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-56' : 'w-16'} bg-app-panel border-r border-app-border transition-all duration-300 flex flex-col no-print z-50`}>
        <div className="p-4 flex items-center gap-3 border-b border-app-border">
          <div className="bg-orange-600 p-1.5 rounded shadow-lg shadow-orange-900/20">
            <ShieldCheck size={16} className="text-white" />
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col">
              <span className="text-white font-black uppercase tracking-tighter text-sm">OmniCalc</span>
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-orange-500">v11.0.2 INDUSTRIALE</span>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1 custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative ${
                activeTab === item.id 
                  ? 'bg-orange-600 text-white shadow-md' 
                  : 'text-gray-500 hover:bg-gray-800/50 hover:text-gray-300'
              }`}
            >
              <item.icon size={16} className={activeTab === item.id ? 'text-white' : 'text-gray-500 group-hover:text-orange-500'} />
              {isSidebarOpen && (
                <div className="flex-1 flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest truncate">{item.label}</span>
                    {item.badge && (
                        <span className="bg-emerald-500 text-white text-[8px] px-1.5 py-0.5 rounded font-bold animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                            NEW
                        </span>
                    )}
                </div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-app-border">
          <a href="https://www.efremgiannessi.org" target="_blank" className="flex items-center gap-2 p-2 rounded hover:bg-gray-800/50 group transition-all">
             <div className="w-6 h-6 rounded bg-gray-800 flex items-center justify-center group-hover:bg-orange-600 transition-colors">
                <ChevronRight size={12} className="text-gray-500 group-hover:text-white" />
             </div>
             {isSidebarOpen && (
               <div className="flex flex-col">
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">Efrem G.</span>
               </div>
             )}
          </a>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Header - Height increased to h-14 */}
        <header className="h-14 border-b border-app-border bg-app-panel/60 backdrop-blur-md flex items-center justify-between px-6 no-print shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-500 hover:text-orange-500">
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-3 border-l border-app-border pl-4">
              <h2 className="text-white font-black uppercase tracking-tighter text-xs">
                NODO_SISTEMA: <span className="text-orange-500">{activeTab.toUpperCase()}</span>
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 mr-4">
              <span className="text-[10px] font-mono font-bold text-emerald-500 flex items-center gap-1">
                <Activity size={10} /> SINC_OK
              </span>
            </div>
            
            {/* Link Esterni */}
            <a 
              href="https://prefab-load-pro.netlify.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-all border border-gray-600 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95"
            >
              <ExternalLink size={14} /> Prefab Load Pro
            </a>
            <a 
              href="https://analisi-carichi-e-sollecitazioni-v2.netlify.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-all border border-gray-600 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95"
            >
              <ExternalLink size={14} /> Analisi Carichi V2
            </a>

            {/* Tasto Scarica PDF Completo */}
            <button 
              onClick={() => window.print()} 
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-all border border-orange-500 flex items-center gap-2 text-xs font-black uppercase tracking-widest shadow-lg shadow-orange-900/20 active:scale-95"
            >
              <FileDown size={16} /> Scarica PDF Completo
            </button>
          </div>
        </header>

        {/* Viewport - p-6 */}
        <section className="flex-1 overflow-y-auto p-6 bg-app-bg custom-scrollbar relative" id="print-area">
          <div className="max-w-5xl mx-auto animate-fade-in pb-8">
            {activeTab === 'termica' && <Termica showToast={showToast} />}
            {activeTab === 'isocalc' && <IsoCalc showToast={showToast} />}
            {activeTab === 'structural_load' && <StructuralLoad showToast={showToast} />}
            {activeTab === 'commerciale' && <Commerciale showToast={showToast} />}
            {activeTab === 'scientifica' && <Scientifica showToast={showToast} />}
            {activeTab === 'interpol' && <Interpolazione showToast={showToast} />}
            {activeTab === 'pendenze' && <Pendenze showToast={showToast} />}
            {activeTab === 'pesi' && <Pesi showToast={showToast} />}
            {activeTab === 'montaggio' && <Montaggio showToast={showToast} />}
            {activeTab === 'trasporto' && <Trasporto showToast={showToast} />}
            {activeTab === 'manufatti' && <Manufatti showToast={showToast} />}
            {activeTab === 'convertitore' && <Convertitore showToast={showToast} />}
            {activeTab === 'cantieristica' && <Cantieristica showToast={showToast} />}
            {activeTab === 'idraulica' && <Idraulica showToast={showToast} />}
            {activeTab === 'pluviali' && <Pluviali showToast={showToast} />}
            {activeTab === 'stratigrafie' && <Stratigrafie showToast={showToast} />}
            {activeTab === 'strutturale' && <Strutturale showToast={showToast} />}
            
            {activeTab !== 'isocalc' && activeTab !== 'structural_load' && <Footer />}
          </div>
        </section>

        {/* Toast */}
        <div 
          className={`fixed z-[9999] right-6 bottom-6 glass-card p-4 rounded-xl flex items-center gap-3 transition-all duration-500 shadow-xl border-orange-500/20 ${toast.show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
        >
          <div className="bg-emerald-500 p-1.5 rounded text-white">
            <ShieldCheck size={16} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-white">{toast.message}</span>
        </div>
      </main>
    </div>
    </>
  );
}
