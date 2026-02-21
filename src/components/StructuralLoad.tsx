
import React, { useState, useCallback, useEffect } from 'react';
import { CalculationModule } from './structural_load/CalculationModule';
import type { CalculationState } from './structural_load/types';
import { abaco } from './structural_load/database';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    PieChart, 
    Pie, 
    Cell,
    Legend
} from 'recharts';
import { LayoutDashboard, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';

interface Props {
  showToast: (msg: string) => void;
}

const createInitialState = (customTitle?: string): CalculationState => ({ id: `calc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, moduleTitle: customTitle || "Modulo di Calcolo", solaioCodice: 'NONE', interasseSolaio: 0, traveCodice: 'NONE', luceTrave: 0, areaInfluenzaTrave: 0, caricoImpermeabilizzazione: 10, caricoIsolante: 5, caricoNeve: 120, caricoFotovoltaico: 15, caricoAppesi: 10, caricoAltriPermanenti: 0, });

const StructuralLoad: React.FC<Props> = ({ showToast }) => {
    const [modules, setModules] = useState<CalculationState[]>([createInitialState("Preventivo 1")]);
    const [isExporting, setIsExporting] = useState(false);
    const [isSharingGlobal, setIsSharingGlobal] = useState(false);
    
    useEffect(() => {
        try { const urlParams = new URLSearchParams(window.location.search); const data = urlParams.get('data'); if (data) { const decodedState = JSON.parse(atob(data)); if (Array.isArray(decodedState)) setModules(decodedState); else if (typeof decodedState === 'object' && decodedState !== null && decodedState.id) setModules([decodedState]); } } catch (error) { console.error("Failed to parse shared state from URL:", error); setModules([createInitialState("Preventivo 1")]); }
    }, []);
    const addCalculationModule = useCallback(() => { setModules(prev => [...prev, createInitialState(`Preventivo ${prev.length + 1}`)]); }, []);
    const removeCalculationModule = useCallback((id: string) => { setModules(prev => prev.filter(module => module.id !== id)); }, []);
    const duplicateCalculationModule = useCallback((id: string) => { setModules(prev => { const source = prev.find(m => m.id === id); if (!source) return prev; const newModule = { ...source, id: `calc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, moduleTitle: `${source.moduleTitle} (Copia)` }; return [...prev, newModule]; }); }, []);
    const handleStateChange = useCallback((newState: CalculationState) => { setModules(prev => prev.map(module => module.id === newState.id ? newState : module)); }, []);
    const handlePrint = () => { window.print(); };
    const handleReset = () => { if(window.confirm("Attenzione: Sei sicuro di voler resettare l'intera applicazione? Tutti i dati e i preventivi inseriti verranno cancellati e ripristinati ai valori di default.")) setModules([createInitialState("Preventivo 1")]); };
    const handleReload = () => { if(window.confirm("Sei sicuro di voler ricaricare la pagina? Eventuali modifiche non salvate andranno perse.")) window.location.reload(); }
    const handleSaveJSON = () => { const dataStr = JSON.stringify(modules, null, 2); const blob = new Blob([dataStr], { type: "application/json" }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `progetto_calcolo_${new Date().toISOString().slice(0,10)}.json`; document.body.appendChild(link); link.click(); document.body.removeChild(link); showToast('JSON salvato!'); };
    const handleGlobalShare = async () => { const stateString = JSON.stringify(modules); const base64State = btoa(stateString); const url = `${window.location.origin}${window.location.pathname}?data=${base64State}`; if (navigator.share) { try { await navigator.share({ title: 'Analisi Carichi Strutturali (Completo)', text: 'Visualizza i risultati di tutti i moduli di calcolo.', url: url }); } catch (error) { console.error('Error sharing:', error); } } else { navigator.clipboard.writeText(url).then(() => { setIsSharingGlobal(true); setTimeout(() => setIsSharingGlobal(false), 2000); showToast('Link copiato!'); }); } };
    const handleExportExcel = () => {
        if (!window.XLSX) { alert("Libreria Excel non caricata. Riprova."); return; }
        const wb = window.XLSX.utils.book_new();
        const headerStyle = { fill: { fgColor: { rgb: "1F2937" } }, font: { color: { rgb: "FFFFFF" }, bold: true, sz: 12 }, alignment: { horizontal: "center", vertical: "center" } };
        const subHeaderStyle = { fill: { fgColor: { rgb: "F97316" } }, font: { color: { rgb: "FFFFFF" }, bold: true }, alignment: { horizontal: "left" } };
        const labelStyle = { font: { bold: true, color: { rgb: "374151" } }, fill: { fgColor: { rgb: "F3F4F6" } } };
        const valueStyle = { alignment: { horizontal: "right" } };
        const resultStyle = { fill: { fgColor: { rgb: "FFF7ED" } }, font: { bold: true, color: { rgb: "C2410C" } }, alignment: { horizontal: "right" } };
        const rows: any[] = [];
        rows.push([{ v: "Analisi Carichi e Sollecitazioni - Report Dettagliato", s: { font: { bold: true, sz: 16 } } }]); rows.push([]);
        modules.forEach((mod, index) => {
            const selectedSolaio = abaco.find(e => e.codice === mod.solaioCodice); const selectedTrave = abaco.find(e => e.codice === mod.traveCodice);
            const pesoPropSolaio_mq = (selectedSolaio?.peso_kg_ml || 0) / (mod.interasseSolaio || 1); const carichiPerm = mod.caricoImpermeabilizzazione + mod.caricoIsolante + mod.caricoAltriPermanenti; const carichiAcc = mod.caricoNeve + mod.caricoFotovoltaico + mod.caricoAppesi; const caricoTotaleAreale = pesoPropSolaio_mq + carichiPerm + carichiAcc; const caricoLineareSolaio = caricoTotaleAreale * mod.areaInfluenzaTrave; const pesoTrave = selectedTrave?.peso_kg_ml || 0; const Q_tot = caricoLineareSolaio + pesoTrave; const L = mod.luceTrave; const Mmax = (Q_tot * Math.pow(L, 2)) / 8; const Tmax = (Q_tot * L) / 2; const E = 3e9; const I = selectedTrave?.momento_inerzia_cm4 || 0; let freccia = 0; if (I > 0 && L > 0) { const I_m4 = I / Math.pow(100, 4); freccia = ((5 * Q_tot * Math.pow(L, 4)) / (384 * E * I_m4)) * 100; }
            rows.push([{ v: mod.moduleTitle || `Modulo ${index + 1}`, s: headerStyle }, { v: "", s: headerStyle }, { v: "", s: headerStyle }, { v: "", s: headerStyle }]); rows.push([{ v: "DATI DI INPUT", s: subHeaderStyle }, null, null, null]); rows.push([{ v: "Elemento Solaio", s: labelStyle }, { v: selectedSolaio ? selectedSolaio.descrizione : mod.solaioCodice, s: valueStyle }, { v: "Elemento Trave", s: labelStyle }, { v: selectedTrave ? selectedTrave.descrizione : mod.traveCodice, s: valueStyle }]); rows.push([{ v: "Interasse Solaio (m)", s: labelStyle }, { v: mod.interasseSolaio, s: valueStyle }, { v: "Luce Trave (m)", s: labelStyle }, { v: mod.luceTrave, s: valueStyle }]); rows.push([{ v: "Area Influenza (m)", s: labelStyle }, { v: mod.areaInfluenzaTrave, s: valueStyle }, { v: "", s: labelStyle }, { v: "", s: valueStyle }]); rows.push([{ v: "CARICHI (kg/mq)", s: subHeaderStyle }, null, null, null]); rows.push([{ v: "Impermeabilizzazione", s: labelStyle }, { v: mod.caricoImpermeabilizzazione, s: valueStyle }, { v: "Neve", s: labelStyle }, { v: mod.caricoNeve, s: valueStyle }]); rows.push([{ v: "Isolante", s: labelStyle }, { v: mod.caricoIsolante, s: valueStyle }, { v: "Fotovoltaico", s: labelStyle }, { v: mod.caricoFotovoltaico, s: valueStyle }]); rows.push([{ v: "Altri Permanenti", s: labelStyle }, { v: mod.caricoAltriPermanenti, s: valueStyle }, { v: "Appesi / Impianti", s: labelStyle }, { v: mod.caricoAppesi, s: valueStyle }]); rows.push([{ v: "RISULTATI DI CALCOLO", s: subHeaderStyle }, null, null, null]); rows.push([{ v: "Carico Totale Areale (kg/mq)", s: labelStyle }, { v: caricoTotaleAreale.toFixed(2), s: resultStyle }, { v: "Q Lineare Totale (kg/m)", s: labelStyle }, { v: Q_tot.toFixed(2), s: resultStyle }]); rows.push([{ v: "Momento Max (kgm)", s: labelStyle }, { v: Mmax.toFixed(2), s: resultStyle }, { v: "Taglio Max (kg)", s: labelStyle }, { v: Tmax.toFixed(2), s: resultStyle }]); rows.push([{ v: "Freccia Max (cm)", s: labelStyle }, { v: freccia.toFixed(3), s: resultStyle }, { v: "", s: labelStyle }, { v: "", s: resultStyle }]); rows.push([]); rows.push([]);
        });
        rows.push([]); rows.push([{ v: "Software sviluppato da Efrem Giannessi - www.efremgiannessi.org", s: { font: { italic: true, color: { rgb: "666666" } } } }]);
        const ws = window.XLSX.utils.aoa_to_sheet(rows); ws['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 30 }, { wch: 15 }]; window.XLSX.utils.book_append_sheet(wb, ws, "Report"); window.XLSX.writeFile(wb, `Analisi_Preventivi_${new Date().toISOString().slice(0,10)}.xlsx`);
    };
    const handleExportPDF = async () => {
        setIsExporting(true); const { jsPDF } = window.jspdf; const element = document.getElementById('export-container'); if (!element || !window.html2canvas) { setIsExporting(false); return; }
        document.body.classList.add('pdf-exporting');
        try { const canvas = await window.html2canvas(element, { scale: 2, backgroundColor: '#111827' }); const imgData = canvas.toDataURL('image/png'); const pdf = new jsPDF('p', 'mm', 'a4'); const pdfWidth = pdf.internal.pageSize.getWidth(); const pdfHeight = (canvas.height * pdfWidth) / canvas.width; const pageHeight = pdf.internal.pageSize.getHeight(); let heightLeft = pdfHeight; let position = 0; pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight); heightLeft -= pageHeight; while (heightLeft > 0) { position = heightLeft - pdfHeight; pdf.addPage(); pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight); heightLeft -= pageHeight; } const pageCount = pdf.getNumberOfPages(); for(let i = 1; i <= pageCount; i++) { pdf.setPage(i); pdf.setFontSize(8); pdf.setTextColor(100); pdf.text('COPYRIGHT © 2025 EFREM GIANNESSI. TUTTI I DIRITTI RISERVATI. www.efremgiannessi.org', 10, pageHeight - 10); } pdf.save(`Report_Analisi_Carichi_${new Date().toISOString().slice(0,10)}.pdf`); } catch (error) { console.error("Error generating PDF:", error); } finally { document.body.classList.remove('pdf-exporting'); setIsExporting(false); }
    };

    return (
        <div className="min-h-full bg-gray-900 text-gray-200 font-sans relative">
            <div className="print-only fixed top-0 left-0 w-full text-center bg-white border-b-2 border-black pb-4 mb-8 z-[9999]">
                 <p className="text-black font-bold text-xl uppercase">Software progettato e sviluppato da Efrem Giannessi</p>
                 <p className="text-blue-600 underline text-lg">https://www.efremgiannessi.org/</p>
            </div>
            
            <div className="px-2 py-3 sm:p-4 lg:p-6 print:p-0">
                <header className="text-center mb-4 sm:mb-6 print:mt-24">
                    <h1 className="text-xl sm:text-4xl font-bold text-orange-500 tracking-tight print:text-black">Analisi Carichi e Sollecitazioni</h1>
                    <p className="mt-1 text-xs sm:text-base text-gray-400 print:text-gray-600">Calcolo strutturale elementi prefabbricati</p>
                    <div className="mt-3 flex justify-center no-print"><button onClick={addCalculationModule} className="inline-flex items-center px-3 py-1.5 border border-dashed border-gray-600 text-[10px] sm:text-xs font-medium rounded-lg text-gray-300 hover:bg-gray-800 hover:border-orange-500 transition-all active:scale-95"><svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>Nuovo Modulo</button></div>
                </header>
                <main id="export-container" className="space-y-4 w-full max-w-full mx-auto pb-20 print:max-w-full print:pb-0">
                    {modules.map((moduleState) => (<CalculationModule key={moduleState.id} calculationState={moduleState} onStateChange={handleStateChange} onRemove={() => removeCalculationModule(moduleState.id)} onDuplicate={() => duplicateCalculationModule(moduleState.id)} isRemovable={modules.length > 1} />))}
                    
                    {/* Dashboard Riassuntiva */}
                    <div className="mt-12 space-y-6 no-print">
                        <div className="flex items-center gap-2 px-2">
                            <div className="bg-orange-600 p-1.5 rounded-lg text-white shadow-lg shadow-orange-900/40">
                                <LayoutDashboard size={18} />
                            </div>
                            <h2 className="text-lg font-black uppercase tracking-tighter text-white">Dashboard Analitica Progetto</h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="glass-card rounded-2xl p-6 border-orange-500/10 bg-app-panel/40">
                                <span className="industrial-label mb-6 flex items-center gap-2"><TrendingUp size={12}/> Confronto Carichi Totali (kg/m)</span>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={modules.map((mod, idx) => {
                                            const selectedSolaio = abaco.find(e => e.codice === mod.solaioCodice);
                                            const selectedTrave = abaco.find(e => e.codice === mod.traveCodice);
                                            const pesoPropSolaio_mq = (selectedSolaio?.peso_kg_ml || 0) / (mod.interasseSolaio || 1);
                                            const carichiPerm = mod.caricoImpermeabilizzazione + mod.caricoIsolante + mod.caricoAltriPermanenti;
                                            const carichiAcc = mod.caricoNeve + mod.caricoFotovoltaico + mod.caricoAppesi;
                                            const caricoTotaleAreale = pesoPropSolaio_mq + carichiPerm + carichiAcc;
                                            const caricoLineareSolaio = caricoTotaleAreale * mod.areaInfluenzaTrave;
                                            const pesoTrave = selectedTrave?.peso_kg_ml || 0;
                                            const Q_tot = caricoLineareSolaio + pesoTrave;
                                            return { name: mod.moduleTitle || `Mod ${idx+1}`, value: parseFloat(Q_tot.toFixed(2)) };
                                        })}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                                            <XAxis dataKey="name" stroke="#4b5563" fontSize={10} />
                                            <YAxis stroke="#4b5563" fontSize={10} />
                                            <Tooltip contentStyle={{ backgroundColor: '#0a0f1d', border: '1px solid #1f2937', borderRadius: '8px' }} />
                                            <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="glass-card rounded-2xl p-6 border-orange-500/10 bg-app-panel/40">
                                <span className="industrial-label mb-6 flex items-center gap-2"><PieChartIcon size={12}/> Distribuzione Carichi (Media Progetto)</span>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: 'Permanenti', value: modules.reduce((acc, m) => acc + (m.caricoImpermeabilizzazione + m.caricoIsolante + m.caricoAltriPermanenti), 0) / modules.length },
                                                    { name: 'Accidentali', value: modules.reduce((acc, m) => acc + (m.caricoNeve + m.caricoFotovoltaico + m.caricoAppesi), 0) / modules.length },
                                                    { name: 'Peso Proprio', value: modules.reduce((acc, m) => {
                                                        const s = abaco.find(e => e.codice === m.solaioCodice);
                                                        return acc + ((s?.peso_kg_ml || 0) / (m.interasseSolaio || 1));
                                                    }, 0) / modules.length }
                                                ]}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                <Cell fill="#f97316" />
                                                <Cell fill="#ea580c" />
                                                <Cell fill="#9a3412" />
                                            </Pie>
                                            <Tooltip contentStyle={{ backgroundColor: '#0a0f1d', border: '1px solid #1f2937', borderRadius: '8px' }} />
                                            <Legend verticalAlign="bottom" height={36}/>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="print-only text-center text-[10px] text-gray-500 mt-8">
                        Generato automaticamente da Analisi Carichi Strutturali.
                    </div>
                </main>
                
                <div className="fixed bottom-0 left-0 w-full flex justify-center px-1.5 sm:px-3 z-50 no-print dock-container pointer-events-none mb-4">
                    <div className="bg-gray-800/95 backdrop-blur-xl border border-gray-600/50 rounded-2xl px-1.5 py-1.5 shadow-[0_4px_24px_rgba(0,0,0,0.5)] flex items-center justify-around gap-0.5 sm:gap-2 overflow-x-auto no-scrollbar pointer-events-auto max-w-full w-fit">
                        <button onClick={handleGlobalShare} className="flex flex-col items-center p-1 sm:p-2 text-gray-300 hover:text-orange-400 transition-all active:scale-90 group relative" aria-label="Condividi"><svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg><span className="text-[7px] sm:text-[9px] font-bold mt-0.5 uppercase tracking-tighter opacity-60 group-hover:opacity-100">{isSharingGlobal ? 'Copiato' : 'Link'}</span></button>
                        <div className="w-px h-6 bg-gray-600/40 mx-0.5"></div>
                        <button onClick={handlePrint} className="flex flex-col items-center p-1 sm:p-2 text-gray-300 hover:text-orange-400 transition-all active:scale-90 group relative" aria-label="Stampa"><svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg><span className="text-[7px] sm:text-[9px] font-bold mt-0.5 uppercase tracking-tighter opacity-60">Stampa</span></button>
                        <button onClick={handleExportPDF} disabled={isExporting} className="flex flex-col items-center p-1 sm:p-2 text-gray-300 hover:text-red-400 transition-all active:scale-90 group relative disabled:opacity-30" aria-label="PDF"><svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg><span className="text-[7px] sm:text-[9px] font-bold mt-0.5 uppercase tracking-tighter opacity-60">PDF</span></button>
                        <button onClick={handleExportExcel} className="flex flex-col items-center p-1 sm:p-2 text-gray-300 hover:text-green-400 transition-all active:scale-90 group relative" aria-label="Excel"><svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg><span className="text-[7px] sm:text-[9px] font-bold mt-0.5 uppercase tracking-tighter opacity-60">Excel</span></button>
                        <div className="w-px h-6 bg-gray-600/40 mx-0.5"></div>
                        <button onClick={handleSaveJSON} className="flex flex-col items-center p-1 sm:p-2 text-gray-300 hover:text-yellow-400 transition-all active:scale-90 group relative" aria-label="Salva"><svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg><span className="text-[7px] sm:text-[9px] font-bold mt-0.5 uppercase tracking-tighter opacity-60">Salva</span></button>
                        <button onClick={handleReset} className="flex flex-col items-center p-1 sm:p-2 text-gray-300 hover:text-orange-500 transition-all active:scale-90 group relative" aria-label="Reset"><svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg><span className="text-[7px] sm:text-[9px] font-bold mt-0.5 uppercase tracking-tighter opacity-60">Reset</span></button>
                        <button onClick={handleReload} className="flex flex-col items-center p-1 sm:p-2 text-gray-300 hover:text-purple-400 transition-all active:scale-90 group relative" aria-label="Reload"><svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg><span className="text-[7px] sm:text-[9px] font-bold mt-0.5 uppercase tracking-tighter opacity-60">Ricarica</span></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StructuralLoad;
