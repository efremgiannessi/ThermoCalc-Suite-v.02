import React, { useState } from 'react';
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
    `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border border-transparent whitespace-nowrap cursor-pointer select-none ${
      activeTab === tab 
        ? 'bg-accent-600 text-white shadow-lg shadow-blue-500/25 border-blue-500/50' 
        : 'bg-dark-800/50 text-slate-400 hover:bg-dark-700 hover:text-white'
    }`;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Toast Notification */}
      <div 
        className={`fixed z-[9999] left-1/2 bottom-[30px] -translate-x-1/2 bg-[#333] text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 transition-all duration-500 ${toast.show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}
      >
        <i className="fa-solid fa-copy text-accent-500"></i> {toast.message}
      </div>

      <header className="bg-dark-900/80 border-b border-dark-700 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-accent-600 to-indigo-600 w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-lg">
                <i className="fa-solid fa-cube"></i>
              </div>
              <h1 className="text-lg font-bold tracking-tight text-white">
                Thermo<span className="text-accent-500">Suite</span> <span className="text-xs text-slate-500 font-normal ml-1">v11.0</span>
              </h1>
            </div>
          </div>
          <nav className="flex overflow-x-auto gap-3 pb-2 no-scrollbar scrollbar-hide">
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

      <main className="flex-grow container max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'termica' && <Termica showToast={showToast} />}
        {activeTab === 'commerciale' && <Commerciale showToast={showToast} />}
        {activeTab === 'percentuali' && <Percentuali showToast={showToast} />}
        {activeTab === 'scientifica' && <Scientifica showToast={showToast} />}
        {activeTab === 'interpol' && <Interpolazione showToast={showToast} />}
        {activeTab === 'pendenze' && <Pendenze showToast={showToast} />}
        {activeTab === 'pesi' && <Pesi showToast={showToast} />}
      </main>
    </div>
  );
}