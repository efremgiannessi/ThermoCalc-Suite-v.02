import { useState } from 'react';
import { TabType } from './types';
import Termica from './components/Termica';
import Scientifica from './components/Scientifica';
import Commerciale from './components/Commerciale';
import Percentuali from './components/Percentuali';
import Interpolazione from './components/Interpolazione';
import Pendenze from './components/Pendenze';
import Pesi from './components/Pesi';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('termica');
  const [toast, setToast] = useState({ show: false, message: '' });

  const showToast = (msg: string) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: '' }), 2500);
  };

  const navClass = (tab: TabType) => 
    `flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border whitespace-nowrap cursor-pointer select-none backdrop-blur-md ${
      activeTab === tab 
        ? 'bg-accent-600/20 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] border-accent-500/50' 
        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border-white/5 hover:border-white/10'
    }`;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Toast Notification */}
      <div 
        className={`fixed z-[9999] left-1/2 bottom-[30px] -translate-x-1/2 glass-panel bg-slate-900/90 text-white px-6 py-4 rounded-xl flex items-center gap-3 transition-all duration-500 shadow-2xl ${toast.show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95 pointer-events-none'}`}
      >
        <div className="bg-emerald-500/20 w-8 h-8 rounded-full flex items-center justify-center text-emerald-500 border border-emerald-500/30">
           <i className="fa-solid fa-check"></i>
        </div>
        <span className="font-medium text-sm">{toast.message}</span>
      </div>

      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/10 bg-slate-900/60">
        <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-blue-900/40 text-blue-300 text-[10px] font-bold text-center py-1.5 uppercase tracking-widest border-b border-white/5 shadow-sm">
            Versione Web
        </div>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-40 group-hover:opacity-75 transition duration-200"></div>
                <div className="relative bg-slate-900 border border-white/10 w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-xl">
                    <i className="fa-solid fa-cube text-xl bg-gradient-to-br from-blue-400 to-indigo-400 text-transparent bg-clip-text"></i>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white leading-none">
                  Thermo<span className="text-accent-500">Suite</span>
                </h1>
                <span className="text-xs text-slate-400 font-medium tracking-wide">Professional Tools v11.0</span>
              </div>
            </div>
            
            <div className="hidden md:block text-right">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Stato Sistema</div>
                <div className="flex items-center gap-2 justify-end">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></span>
                    <span className="text-xs text-slate-300">Online & Ready</span>
                </div>
            </div>
          </div>
          
          <nav className="flex overflow-x-auto gap-3 pb-2 no-scrollbar scrollbar-hide mask-linear-fade">
            <button onClick={() => setActiveTab('termica')} className={navClass('termica')}><i className="fa-solid fa-temperature-half"></i> Termica</button>
            <button onClick={() => setActiveTab('commerciale')} className={navClass('commerciale')}><i className="fa-solid fa-shop"></i> Commerciale</button>
            <button onClick={() => setActiveTab('percentuali')} className={navClass('percentuali')}><i className="fa-solid fa-percent"></i> %</button>
            <button onClick={() => setActiveTab('scientifica')} className={navClass('scientifica')}><i className="fa-solid fa-calculator"></i> Scientifica</button>
            <button onClick={() => setActiveTab('interpol')} className={navClass('interpol')}><i className="fa-solid fa-chart-line"></i> Interpolazione</button>
            <button onClick={() => setActiveTab('pendenze')} className={navClass('pendenze')}><i className="fa-solid fa-ruler-triangle"></i> Pendenze</button>
            <button onClick={() => setActiveTab('pesi')} className={navClass('pesi')}><i className="fa-solid fa-weight-hanging"></i> Pesi</button>
          </nav>
        </div>
      </header>

      <main className="flex-grow container max-w-7xl mx-auto px-4 py-8">
        <div className="transition-all duration-500 ease-in-out animate-fade-in">
            {activeTab === 'termica' && <Termica showToast={showToast} />}
            {activeTab === 'commerciale' && <Commerciale showToast={showToast} />}
            {activeTab === 'percentuali' && <Percentuali showToast={showToast} />}
            {activeTab === 'scientifica' && <Scientifica showToast={showToast} />}
            {activeTab === 'interpol' && <Interpolazione showToast={showToast} />}
            {activeTab === 'pendenze' && <Pendenze showToast={showToast} />}
            {activeTab === 'pesi' && <Pesi showToast={showToast} />}
        </div>
      </main>
      
      <footer className="mt-12 py-8 text-center border-t border-white/5 bg-black/20 backdrop-blur-sm flex flex-col items-center gap-4">
        <p className="text-slate-500 text-xs font-medium">&copy; 2024 ThermoSuite Web. Designed for performance.</p>
        <a href="https://app.netlify.com/projects/thermo-pro-calc-suite-v02/deploys" target="_blank" rel="noopener noreferrer">
          <img src="https://api.netlify.com/api/v1/badges/e58a0b7e-e2bc-4230-a89a-1b88bb346d93/deploy-status" alt="Netlify Status" />
        </a>
      </footer>
    </div>
  );
}