import { useState, useEffect } from 'react';
import { TabType } from './types';
import { 
  Thermometer, 
  Calculator, 
  Percent, 
  LineChart, 
  Ruler, 
  Scale, 
  Wrench, 
  Truck, 
  Shapes, 
  LayoutDashboard,
  ShieldCheck,
  Printer,
  ChevronRight,
  Menu,
  Activity
} from 'lucide-react';

import Termica from './components/Termica';
import Scientifica from './components/Scientifica';
import Commerciale from './components/Commerciale';
import Percentuali from './components/Percentuali';
import Interpolazione from './components/Interpolazione';
import Pendenze from './components/Pendenze';
import Pesi from './components/Pesi';
import Montaggio from './components/Montaggio';
import Trasporto from './components/Trasporto';
import Manufatti from './components/Manufatti';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('termica');
  const [toast, setToast] = useState({ show: false, message: '' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const titles: Record<TabType, string> = {
        termica: "Ingegneria Termica",
        commerciale: "Analisi Commerciale",
        percentuali: "Calcoli Percentuali",
        scientifica: "Matematica di Precisione",
        interpol: "Interpolazione Lineare",
        pendenze: "Pendenze e Gradi",
        pesi: "Massa Materiali",
        montaggio: "Preventivo Montaggio",
        trasporto: "Logistica Trasporti",
        manufatti: "Database Manufatti"
    };
    document.title = `OMNICALC | ${titles[activeTab].toUpperCase()}`;
  }, [activeTab]);

  const showToast = (msg: string) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: '' }), 2500);
  };

  const navItems: { id: TabType; label: string; icon: any }[] = [
    { id: 'termica', label: 'Dinamica Termica', icon: Thermometer },
    { id: 'scientifica', label: 'Calcolo Scientifico', icon: Calculator },
    { id: 'commerciale', label: 'Dashboard Commerciale', icon: LayoutDashboard },
    { id: 'percentuali', label: 'Variazioni %', icon: Percent },
    { id: 'interpol', label: 'Interpolazione', icon: LineChart },
    { id: 'pendenze', label: 'Pendenze e Gradi', icon: Ruler },
    { id: 'pesi', label: 'Pesi Materiali', icon: Scale },
    { id: 'montaggio', label: 'Preventivo Montaggio', icon: Wrench },
    { id: 'trasporto', label: 'Logistica Trasporti', icon: Truck },
    { id: 'manufatti', label: 'Database Manufatti', icon: Shapes },
  ];

  return (
    <div className="flex min-h-screen bg-app-bg text-gray-200 font-sans text-[11px]">
      
      {/* Sidebar - w-48 */}
      <aside className={`${isSidebarOpen ? 'w-48' : 'w-14'} bg-app-panel border-r border-app-border transition-all duration-300 flex flex-col no-print z-50`}>
        <div className="p-3 flex items-center gap-2 border-b border-app-border">
          <div className="bg-orange-600 p-1 rounded shadow-lg shadow-orange-900/20">
            <ShieldCheck size={14} className="text-white" />
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col">
              <span className="text-white font-black uppercase tracking-tighter text-sm">OmniCalc</span>
              <span className="text-[6px] font-black uppercase tracking-[0.2em] text-orange-500">v11.0.1 INDUSTRIALE</span>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-1.5 space-y-0.5 custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all group ${
                activeTab === item.id 
                  ? 'bg-orange-600 text-white shadow-md' 
                  : 'text-gray-500 hover:bg-gray-800/50 hover:text-gray-300'
              }`}
            >
              <item.icon size={14} className={activeTab === item.id ? 'text-white' : 'text-gray-500 group-hover:text-orange-500'} />
              {isSidebarOpen && <span className="text-[8px] font-black uppercase tracking-widest truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-2 border-t border-app-border">
          <a href="https://www.efremgiannessi.org" target="_blank" className="flex items-center gap-2 p-1 rounded hover:bg-gray-800/50 group transition-all">
             <div className="w-5 h-5 rounded bg-gray-800 flex items-center justify-center group-hover:bg-orange-600 transition-colors">
                <ChevronRight size={10} className="text-gray-500 group-hover:text-white" />
             </div>
             {isSidebarOpen && (
               <div className="flex flex-col">
                 <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">Efrem G.</span>
               </div>
             )}
          </a>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Header - h-10 */}
        <header className="h-10 border-b border-app-border bg-app-panel/60 backdrop-blur-md flex items-center justify-between px-5 no-print shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-500 hover:text-orange-500">
              <Menu size={16} />
            </button>
            <div className="flex items-center gap-3 border-l border-app-border pl-4">
              <h2 className="text-white font-black uppercase tracking-tighter text-[10px]">
                NODO_SISTEMA: <span className="text-orange-500">{activeTab.toUpperCase()}</span>
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-mono font-bold text-emerald-500 flex items-center gap-1">
                <Activity size={8} /> SINC_OK
              </span>
            </div>
            <button onClick={() => window.print()} className="bg-gray-800 hover:bg-orange-600 text-white p-1.5 rounded transition-all border border-gray-700">
              <Printer size={12} />
            </button>
          </div>
        </header>

        {/* Viewport - p-4 */}
        <section className="flex-1 overflow-y-auto p-4 bg-app-bg custom-scrollbar relative">
          <div className="max-w-5xl mx-auto animate-fade-in pb-6">
            {activeTab === 'termica' && <Termica showToast={showToast} />}
            {activeTab === 'commerciale' && <Commerciale showToast={showToast} />}
            {activeTab === 'percentuali' && <Percentuali showToast={showToast} />}
            {activeTab === 'scientifica' && <Scientifica showToast={showToast} />}
            {activeTab === 'interpol' && <Interpolazione showToast={showToast} />}
            {activeTab === 'pendenze' && <Pendenze showToast={showToast} />}
            {activeTab === 'pesi' && <Pesi showToast={showToast} />}
            {activeTab === 'montaggio' && <Montaggio showToast={showToast} />}
            {activeTab === 'trasporto' && <Trasporto showToast={showToast} />}
            {activeTab === 'manufatti' && <Manufatti showToast={showToast} />}
          </div>
        </section>

        {/* Toast */}
        <div 
          className={`fixed z-[9999] right-5 bottom-5 glass-card p-2.5 rounded-lg flex items-center gap-2.5 transition-all duration-500 shadow-xl border-orange-500/20 ${toast.show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
        >
          <div className="bg-emerald-500 p-1 rounded text-white">
            <ShieldCheck size={12} />
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest text-white">{toast.message}</span>
        </div>
      </main>
    </div>
  );
}