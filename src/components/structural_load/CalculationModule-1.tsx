import React, { useMemo, useState } from 'react';
import type { CalculationState, StructuralElement } from './types';
import { abaco, groupedAbaco } from './database';
import { InputField } from './InputField';
import { SelectField } from './SelectField';
import { OutputField } from './OutputField';
import { StressDiagram } from './StressDiagram';
import { LoadBreakdownChart } from './LoadBreakdownChart';

interface CalculationModuleProps {
    calculationState: CalculationState;
    onStateChange: (newState: CalculationState) => void;
    onRemove: () => void;
    onDuplicate: () => void;
    isRemovable: boolean;
}

const findElement = (codice: string): StructuralElement | undefined => abaco.find(e => e.codice === codice);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mt-3 sm:mt-4">
        <h3 className="text-[10px] sm:text-base font-bold text-gray-500 mb-2 print:text-gray-500 print:text-sm uppercase tracking-widest">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
            {children}
        </div>
    </div>
);


export const CalculationModule: React.FC<CalculationModuleProps> = ({ calculationState, onStateChange, onRemove, onDuplicate, isRemovable }) => {
    const [isSharing, setIsSharing] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);

    const handleNumberChange = (field: keyof CalculationState, value: number) => {
        onStateChange({ ...calculationState, [field]: value });
    };

    const handleSelectChange = (field: keyof CalculationState, value: string) => {
        onStateChange({ ...calculationState, [field]: value });
    };

    const handleTitleChange = (newTitle: string) => {
        onStateChange({ ...calculationState, moduleTitle: newTitle });
    }
    
    const {
        moduleTitle,
        solaioCodice, interasseSolaio, traveCodice, luceTrave, areaInfluenzaTrave,
        caricoImpermeabilizzazione, caricoIsolante, caricoNeve,
        caricoFotovoltaico, caricoAppesi, caricoAltriPermanenti,
    } = calculationState;

    const selectedSolaio = useMemo(() => findElement(solaioCodice), [solaioCodice]);
    const selectedTrave = useMemo(() => findElement(traveCodice), [traveCodice]);

    const pesoPropSolaio_mq = useMemo(() => {
        const peso = selectedSolaio?.peso_kg_ml || 0;
        return interasseSolaio > 0 ? peso / interasseSolaio : 0;
    }, [selectedSolaio, interasseSolaio]);

    const carichiPermanentiPortati_mq = useMemo(() => 
        Number(caricoImpermeabilizzazione || 0) +
        Number(caricoIsolante || 0) +
        Number(caricoAltriPermanenti || 0)
    , [caricoImpermeabilizzazione, caricoIsolante, caricoAltriPermanenti]);

    const carichiAccidentali_mq = useMemo(() => 
        Number(caricoNeve || 0) +
        Number(caricoFotovoltaico || 0) +
        Number(caricoAppesi || 0)
    , [caricoNeve, caricoFotovoltaico, caricoAppesi]);
    
    const caricoTotaleAreale_mq = useMemo(() => 
        pesoPropSolaio_mq + carichiPermanentiPortati_mq + carichiAccidentali_mq
    , [pesoPropSolaio_mq, carichiPermanentiPortati_mq, carichiAccidentali_mq]);

    const pesoPropTrave_kgm = useMemo(() => selectedTrave?.peso_kg_ml || 0, [selectedTrave]);
    
    const caricoLineareDaSolaio_kgm = useMemo(() => 
        caricoTotaleAreale_mq * (areaInfluenzaTrave || 0)
    , [caricoTotaleAreale_mq, areaInfluenzaTrave]);

    const Q_CaricoLineare_totale_kgm = useMemo(() => 
        caricoLineareDaSolaio_kgm + pesoPropTrave_kgm
    , [caricoLineareDaSolaio_kgm, pesoPropTrave_kgm]);

    const M_max = useMemo(() => 
        (Q_CaricoLineare_totale_kgm * Math.pow(luceTrave || 0, 2)) / 8
    , [Q_CaricoLineare_totale_kgm, luceTrave]);

    const T_max = useMemo(() => 
        (Q_CaricoLineare_totale_kgm * (luceTrave || 0)) / 2
    , [Q_CaricoLineare_totale_kgm, luceTrave]);

    const freccia_cm = useMemo(() => {
        const E_calcestruzzo_kg_m2 = 3e9;
        const I_cm4 = selectedTrave?.momento_inerzia_cm4 || 0;
        if (I_cm4 <= 0 || luceTrave <= 0) return 0;
        const I_m4 = I_cm4 / Math.pow(100, 4);
        const q_kg_m = Q_CaricoLineare_totale_kgm;
        const L_m = luceTrave;
        const freccia_m = (5 * q_kg_m * Math.pow(L_m, 4)) / (384 * E_calcestruzzo_kg_m2 * I_m4);
        return freccia_m * 100;
    }, [selectedTrave, Q_CaricoLineare_totale_kgm, luceTrave]);

    const elementOptions = useMemo(() => {
        const noneOption = { value: 'NONE', label: 'Nessun elemento selezionato' };
        const groupedOptions = groupedAbaco.map(group => ({
            label: group.label,
            options: group.options.map(e => ({ value: e.codice, label: `${e.codice} - ${e.descrizione}` }))
        }));
        return [noneOption, ...groupedOptions];
    }, []);

    const loadChartData = useMemo(() => {
        const pesoProprioTrave = pesoPropTrave_kgm;
        const pesoProprioSolaio = pesoPropSolaio_mq * (areaInfluenzaTrave || 0);
        const permanentiPortati = carichiPermanentiPortati_mq * (areaInfluenzaTrave || 0);
        const accidentali = carichiAccidentali_mq * (areaInfluenzaTrave || 0);
        return [
            { label: 'P.P. Trave', value: pesoProprioTrave, color: '#9a3412' }, 
            { label: 'P.P. Solaio', value: pesoProprioSolaio, color: '#f97316' }, 
            { label: 'Permanenti', value: permanentiPortati, color: '#fbbf24' }, 
            { label: 'Accidentali', value: accidentali, color: '#a855f7' },
        ].filter(item => item.value > 0.01);
    }, [pesoPropTrave_kgm, pesoPropSolaio_mq, carichiPermanentiPortati_mq, carichiAccidentali_mq, areaInfluenzaTrave]);

    const handleShare = async () => {
        const stateString = JSON.stringify(calculationState);
        const base64State = btoa(stateString);
        const url = `${window.location.origin}${window.location.pathname}?data=${base64State}`;
        if (navigator.share) {
            try {
                await navigator.share({ title: 'Calcolo Strutturale', text: 'Risultati analisi carichi.', url: url });
            } catch (error) {}
        } else {
            navigator.clipboard.writeText(url).then(() => {
                setIsSharing(true);
                setTimeout(() => setIsSharing(false), 2000);
            });
        }
    };

    return (
        <div id={`module-to-print-${calculationState.id}`} className="bg-gray-800/60 rounded-2xl shadow-xl p-3 sm:p-5 border border-gray-700/50 relative print:bg-white print:border-gray-200 print:shadow-none print:break-inside-avoid">
            
            <div className="flex justify-between items-center mb-3 border-b border-gray-700 pb-2 print:border-gray-300">
                <div className="flex-grow mr-2">
                    {isEditingTitle ? (
                        <input
                            type="text"
                            value={moduleTitle}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            onBlur={() => setIsEditingTitle(false)}
                            onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                            autoFocus
                            className="bg-gray-700 text-base sm:text-xl font-bold text-orange-500 border border-orange-500 rounded-lg px-2 py-1 w-full focus:outline-none"
                        />
                    ) : (
                        <h2 
                            onClick={() => setIsEditingTitle(true)}
                            className="text-base sm:text-xl font-bold text-orange-500 hover:text-orange-400 cursor-pointer transition-colors flex items-center print:text-black active:opacity-60"
                        >
                            <span className="truncate">{moduleTitle}</span>
                            <svg className="w-3 h-3 ml-2 text-gray-500 no-print flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </h2>
                    )}
                </div>

                <div className="flex items-center gap-1.5 no-print">
                     <button onClick={onDuplicate} title="Duplica" className="text-gray-400 hover:text-orange-500 p-1.5 sm:p-2 transition-all bg-gray-700/50 hover:bg-gray-700 rounded-lg active:scale-90 shadow-sm border border-gray-600/50">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                    {isRemovable && (
                        <button onClick={onRemove} title="Elimina" className="text-gray-400 hover:text-red-500 p-1.5 sm:p-2 transition-all bg-gray-700/50 hover:bg-gray-700 rounded-lg active:scale-90 shadow-sm border border-gray-600/50">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    )}
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-4 pt-1">
                <div className="space-y-1.5">
                    <Section title="Dati di Solaio">
                        <SelectField id={`${calculationState.id}-solaio-codice`} label="Solaio" value={solaioCodice} onChange={(val) => handleSelectChange('solaioCodice', val)} options={elementOptions} />
                         <InputField id={`${calculationState.id}-interasse-solaio`} label="Interasse (i)" unit="m" value={interasseSolaio} onChange={(val) => handleNumberChange('interasseSolaio', val)} />
                    </Section>
                    <Section title="Dati di Trave">
                        <SelectField id={`${calculationState.id}-trave-codice`} label="Trave" value={traveCodice} onChange={(val) => handleSelectChange('traveCodice', val)} options={elementOptions} />
                        <InputField id={`${calculationState.id}-luce-trave`} label="Luce (L)" unit="m" value={luceTrave} onChange={(val) => handleNumberChange('luceTrave', val)} />
                        <InputField id={`${calculationState.id}-area-influenza`} label="Area Infl." unit="m" value={areaInfluenzaTrave} onChange={(val) => handleNumberChange('areaInfluenzaTrave', val)} />
                    </Section>
                    <Section title="Carichi Areali">
                        <InputField id={`${calculationState.id}-impermeabilizzazione`} label="Impermeab." unit="kg/mq" value={caricoImpermeabilizzazione} onChange={(val) => handleNumberChange('caricoImpermeabilizzazione', val)} />
                        <InputField id={`${calculationState.id}-isolante`} label="Isolante" unit="kg/mq" value={caricoIsolante} onChange={(val) => handleNumberChange('caricoIsolante', val)} />
                        <InputField id={`${calculationState.id}-altri-permanenti`} label="Altri Perm." unit="kg/mq" value={caricoAltriPermanenti} onChange={(val) => handleNumberChange('caricoAltriPermanenti', val)} />
                        <InputField id={`${calculationState.id}-neve`} label="Neve" unit="kg/mq" value={caricoNeve} onChange={(val) => handleNumberChange('caricoNeve', val)} />
                        <InputField id={`${calculationState.id}-fotovoltaico`} label="Fotovolt." unit="kg/mq" value={caricoFotovoltaico} onChange={(val) => handleNumberChange('caricoFotovoltaico', val)} />
                        <InputField id={`${calculationState.id}-appesi`} label="Appesi" unit="kg/mq" value={caricoAppesi} onChange={(val) => handleNumberChange('caricoAppesi', val)} />
                    </Section>
                </div>

                <div className="bg-gray-950/40 p-3 sm:p-5 rounded-2xl h-fit border border-gray-700/40 print:bg-gray-50 print:text-black">
                    <h3 className="text-[10px] sm:text-base font-bold text-gray-500 mb-4 text-center print:text-black uppercase tracking-[0.2em]">Risultati Analisi</h3>
                    
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <OutputField label="P.P. Solaio" value={pesoPropSolaio_mq.toFixed(1)} unit="kg/mq" />
                        <OutputField label="Perm. Portati" value={carichiPermanentiPortati_mq.toFixed(1)} unit="kg/mq" />
                        <OutputField label="Accidentali" value={carichiAccidentali_mq.toFixed(1)} unit="kg/mq" />
                        <OutputField label="Totale Areale" value={caricoTotaleAreale_mq.toFixed(1)} unit="kg/mq" />
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        <OutputField label="Q Totale (Lineare)" value={Q_CaricoLineare_totale_kgm.toFixed(1)} unit="kg/m" />
                        <div className="grid grid-cols-2 gap-2">
                            <OutputField label="Momento Mmax" value={M_max.toFixed(0)} unit="kgm" />
                            <OutputField label="Taglio Tmax" value={T_max.toFixed(0)} unit="kg" />
                        </div>
                        <OutputField label="Freccia Max" value={freccia_cm.toFixed(3)} unit="cm" />
                    </div>

                    {Q_CaricoLineare_totale_kgm > 0 && (
                        <div className="mt-6 border-t border-gray-800/60 pt-4 print:border-gray-300">
                            <LoadBreakdownChart data={loadChartData} />
                        </div>
                    )}

                     {luceTrave > 0 && Q_CaricoLineare_totale_kgm > 0 && (
                        <div className="mt-6">
                            <StressDiagram M_max={M_max} T_max={T_max} />
                        </div>
                    )}

                    <div className="mt-6 border-t border-gray-800/60 pt-4 no-print flex justify-center">
                         <button onClick={handleShare} disabled={isSharing} className="text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.2em] px-6 py-2 bg-orange-600/10 border border-orange-500/20 text-orange-500 rounded-full hover:bg-orange-600/20 transition-all active:scale-95">
                            {isSharing ? 'Copiato' : 'Condividi'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};