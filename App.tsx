import { useState, useEffect } from 'react';
import { TabType } from './types';
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

  // SEO: Update document title based on active tab
  useEffect(() => {
    const titles: Record<TabType, string> = {
        termica: "Calcolo Termico & Zone Climatiche",
        commerciale: "Calcoli Commerciali & Parcella",
        percentuali: "Calcolo Percentuali & Variazioni",
        scientifica: "Calcolatrice Scientifica",
        interpol: "Interpolazione Lineare",
        pendenze: "Calcolo Pendenze & Gradi",
        pesi: "Calcolo Pesi Materiali",
        montaggio: "Preventivo Montaggio Edile",
        trasporto: "Preventivo Trasporti & Logistica",
        manufatti: "Database Manufatti & Travi"
    };
    document.title = `OmniCalc | ${titles[activeTab]}`;
  }, [activeTab]);

  const showToast = (msg: string) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: '' }), 2500);
  };

  const navClass = (tab: TabType) => 
    `flex items-center gap-2 px-4 py-2 rounded-full text-xs md:text-sm font-bold transition-all duration-300 border whitespace-nowrap cursor-pointer select-none backdrop-blur-md ${
      activeTab === tab 
        ? 'bg-accent-600/20 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] border-accent-500/50' 
        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border-white/5 hover:border-white/10'
    }`;

  const currentYear = new Date().getFullYear();

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* --- PRINT ONLY HEADER --- */}
      <div className="print-only hidden w-full border-b-2 border-black pb-4 mb-6">
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
                <i className="fa-solid fa-cube text-3xl"></i>
                <div>
                    <h1 className="text-3xl font-bold leading-none">OmniCalc Suite</h1>
                    <p className="text-sm text-gray-600 mt-1">Professional Technical Reports</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-xs uppercase tracking-widest font-bold text-gray-500 mb-1">Software progettato e sviluppato da</p>
                <p className="text-lg font-bold">Efrem Giannessi</p>
                <p className="text-xl font-bold text-blue-700 underline mt-1">https://www.efremgiannessi.org/</p>
            </div>
        </div>
      </div>
      {/* ------------------------- */}

      {/* Toast Notification */}
      <div 
        className={`toast-container fixed z-[9999] left-1/2 bottom-[30px] -translate-x-1/2 glass-panel bg-slate-900/90 text-white px-6 py-4 rounded-xl flex items-center gap-3 transition-all duration-500 shadow-2xl ${toast.show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95 pointer-events-none'}`}
      >
        <div className="bg-emerald-500/20 w-8 h-8 rounded-full flex items-center justify-center text-emerald-500 border border-emerald-500/30">
           <i className="fa-solid fa-check"></i>
        </div>
        <span className="font-medium text-sm">{toast.message}</span>
      </div>

      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/10 bg-slate-900/60 no-print">
        {/* Banner Efrem Giannessi */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-slate-300 text-xs md:text-sm font-medium text-center py-2.5 border-b border-white/10 relative overflow-hidden shadow-md">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-30"></div>
            <p className="flex justify-center items-center gap-1.5 flex-wrap px-4">
              <i className="fa-solid fa-code text-indigo-400 text-[10px]"></i>
              Software progettato e sviluppato da 
              <a 
                href="https://www.efremgiannessi.org" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white font-bold hover:text-indigo-400 transition-all duration-300 underline decoration-indigo-500/50 underline-offset-2 hover:decoration-indigo-400 decoration-1"
              >
                Efrem Giannessi
              </a>
            </p>
        </div>

        <div className="w-[95%] max-w-[1800px] mx-auto px-4 py-4">
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
                  Omni<span className="text-accent-500">Calc</span>
                </h1>
                <span className="text-xs text-slate-400 font-medium tracking-wide">Professional Suite v11.0</span>
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
          
          <nav className="flex flex-wrap justify-center gap-2 pb-2">
            <button onClick={() => setActiveTab('termica')} className={navClass('termica')}><i className="fa-solid fa-temperature-half"></i> Termica</button>
            <button onClick={() => setActiveTab('commerciale')} className={navClass('commerciale')}><i className="fa-solid fa-shop"></i> Commerciale</button>
            <button onClick={() => setActiveTab('percentuali')} className={navClass('percentuali')}><i className="fa-solid fa-percent"></i> %</button>
            <button onClick={() => setActiveTab('scientifica')} className={navClass('scientifica')}><i className="fa-solid fa-calculator"></i> Scientifica</button>
            <button onClick={() => setActiveTab('interpol')} className={navClass('interpol')}><i className="fa-solid fa-chart-line"></i> Interpolazione</button>
            <button onClick={() => setActiveTab('pendenze')} className={navClass('pendenze')}><i className="fa-solid fa-ruler-triangle"></i> Pendenze</button>
            <button onClick={() => setActiveTab('pesi')} className={navClass('pesi')}><i className="fa-solid fa-weight-hanging"></i> Pesi</button>
            <button onClick={() => setActiveTab('montaggio')} className={navClass('montaggio')}><i className="fa-solid fa-screwdriver-wrench"></i> Montaggio</button>
            <button onClick={() => setActiveTab('trasporto')} className={navClass('trasporto')}><i className="fa-solid fa-truck-fast"></i> Trasporto</button>
            <button onClick={() => setActiveTab('manufatti')} className={navClass('manufatti')}><i className="fa-solid fa-shapes"></i> Manufatti</button>
          </nav>
        </div>
      </header>

      <main className="flex-grow w-[95%] max-w-[1800px] mx-auto px-4 py-8">
        <div className="transition-all duration-500 ease-in-out animate-fade-in">
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
      </main>
      
      {/* --- WEB FOOTER --- */}
      <footer className="mt-12 py-8 text-center border-t border-white/5 bg-black/20 backdrop-blur-sm flex flex-col items-center gap-4 no-print">
        <p className="text-slate-500 text-xs font-medium">&copy; {currentYear} OmniCalc Web. Designed for performance.</p>
        <a href="https://app.netlify.com/projects/thermo-pro-calc-suite-v02/deploys" target="_blank" rel="noopener noreferrer">
          <img src="https://api.netlify.com/api/v1/badges/e58a0b7e-e2bc-4230-a89a-1b88bb346d93/deploy-status" alt="Netlify Status" />
        </a>
      </footer>

      {/* --- PRINT ONLY FOOTER --- */}
      <div className="print-only hidden w-full border-t border-black pt-4 mt-8">
          <div className="text-center space-y-2">
              <p className="font-bold text-sm uppercase">Copyright © {currentYear} Efrem Giannessi. Tutti i diritti riservati.</p>
              <p className="text-xs text-gray-600 px-10">
                  Il presente report è stato generato automaticamente tramite il software <strong>OmniCalc Suite</strong>. 
                  È severamente vietata la riproduzione, distribuzione, modifica o ingegneria inversa del software senza autorizzazione esplicita. 
                  L'utilizzo dei dati e dei calcoli contenuti in questo documento è a totale discrezione e responsabilità dell'utente professionale. 
                  L'autore non si assume responsabilità per eventuali errori o imprecisioni nei calcoli automatici.
              </p>
              <p className="font-bold text-xs pt-2">https://www.efremgiannessi.org/</p>
          </div>
      </div>
    </div>
  );
}