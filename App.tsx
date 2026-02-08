import { useState, useEffect } from 'react';
import { TabType } from './types';
import { 
  Thermometer, 
  Calculator, 
  Percent, 
  TrendingUp, 
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
        termica: "Thermal Engineering",
        commerciale: "Commercial Analysis",
        percentuali: "Percent Calculations",
        scientifica: "Precision Math",
        interpol: "Linear Interpolation",
        pendenze: "Slopes & Degrees",
        pesi: "Material Mass",
        montaggio: "Mounting Budget",
        trasporto: "Logistics",
        manufatti: "Component DB"
    };
    document.title = `OMNICALC | ${titles[activeTab].toUpperCase()}`;
  }, [activeTab]);

  const showToast = (msg: string) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: '' }), 2500);
  };

  const navItems: { id: TabType; label: string; icon: any }[] = [
    { id: 'termica', label: 'Thermal Dynamics', icon: Thermometer },
    { id: 'scientifica', label: 'Scientific Math', icon: Calculator },
    { id: 'commerciale', label: 'Commercial Dashboard', icon: LayoutDashboard },
    { id: 'percentuali', label: 'Variazioni %', icon: Percent },
    { id: 'interpol', label: 'Interpolazione', icon: LineChart },
    { id: 'pendenze', label: 'Pendenze e Gradi', icon: Ruler },
    { id: 'pesi', label: 'Pesi Materiali', icon: Scale },
    { id: 'montaggio', label: 'Preventivo Montaggio', icon: Wrench },
    { id: 'trasporto', label: 'Logistica / Trasporto', icon: Truck },
    { id: 'manufatti', label: 'Database Manufatti', icon: Shapes },
  ];

  return (
    <div className="flex min-h-screen bg-app-bg text-gray-200 font-sans text-xs">
      
      {/* Sidebar - Ridotta larghezza */}
      <aside className={`${isSidebarOpen ? 'w-56' : 'w-16'} bg-app-panel border-r border-app-border transition-all duration-300 flex flex-col no-print z-50`}>
        <div className="p-4 flex items-center gap-2 border-b border-app-border">
          <div className="bg-orange-600 p-1.5 rounded-lg shadow-lg shadow-orange-900/20">
            <ShieldCheck size={16} className="text-white" />
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col">
              <span className="text-white font-black uppercase tracking-tighter text-base">OmniCalc</span>
              <span className="text-[7px] font-black uppercase tracking-[0.3em] text-orange-500">v11.0 Industrial</span>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5 custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all group ${
                activeTab === item.id 
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/30' 
                  : 'text-gray-500 hover:bg-gray-800/50 hover:text-gray-300'
              }`}
            >
              <item.icon size={16} className={activeTab === item.id ? 'text-white' : 'text-gray-500 group-hover:text-orange-500'} />
              {isSidebarOpen && <span className="text-[9px] font-black uppercase tracking-widest truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-app-border">
          <a href="https://www.efremgiannessi.org" target="_blank" className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-gray-800/50 group transition-all">
             <div className="w-6 h-6 rounded-md bg-gray-800 flex items-center justify-center group-hover:bg-orange-600 transition-colors">
                <ChevronRight size={12} className="text-gray-500 group-hover:text-white" />
             </div>
             {isSidebarOpen && (
               <div className="flex flex-col">
                 <span className="industrial-label !mb-0 text-gray-600 !text-[7px]">Developer</span>
                 <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">Efrem Giannessi</span>
               </div>
             )}
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Header - Ridotta altezza */}
        <header className="h-12 border-b border-app-border bg-app-panel/60 backdrop-blur-md flex items-center justify-between px-6 no-print shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-500 hover:text-orange-500">
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-3 border-l border-app-border pl-4">
              <h2 className="text-white font-black uppercase tracking-tighter text-[11px]">
                System_Node: <span className="text-orange-500 ml-0.5">{activeTab.toUpperCase()}</span>
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-end">
                <span className="industrial-label !mb-0 !text-[7px]">Status</span>
                <span className="text-[9px] font-mono font-bold text-emerald-500 flex items-center gap-1">
                  <Activity size={8} /> SYNC_OK
                </span>
              </div>
            </div>
            <button onClick={() => window.print()} className="bg-gray-800 hover:bg-orange-600 text-white p-2 rounded-lg transition-all border border-gray-700">
              <Printer size={14} />
            </button>
          </div>
        </header>

        {/* Viewport - Ridotto padding */}
        <section className="flex-1 overflow-y-auto p-5 bg-app-bg custom-scrollbar relative">
          <div className="max-w-6xl mx-auto animate-fade-in pb-8">
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

        {/* Toast Notification - Più piccola */}
        <div 
          className={`fixed z-[9999] right-6 bottom-6 glass-card p-3 rounded-xl flex items-center gap-3 transition-all duration-500 shadow-2xl border-orange-500/20 ${toast.show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
        >
          <div className="bg-emerald-500 p-1 rounded-md text-white">
            <ShieldCheck size={14} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-white">{toast.message}</span>
        </div>
      </main>
    </div>
  );
}