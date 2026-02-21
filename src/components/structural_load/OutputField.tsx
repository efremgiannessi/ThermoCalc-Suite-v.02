
import React from 'react';

interface OutputFieldProps { label: string; value: string; unit: string; formula?: string; }

export const OutputField: React.FC<OutputFieldProps> = ({ label, value, unit, formula }) => {
    return (
        <div className="flex flex-col p-1.5 sm:p-2.5 bg-gray-950/40 rounded-lg border border-gray-800/30">
            <span className="text-[9px] sm:text-[11px] font-medium text-gray-400 uppercase tracking-tighter sm:tracking-normal">{label}</span>
            <div className="flex items-baseline mt-0.5">
                 <span className="text-xs sm:text-lg font-bold text-orange-500">{value}</span>
                 <span className="ml-1 text-[8px] sm:text-[10px] text-gray-500">{unit}</span>
            </div>
            {formula && <span className="hidden sm:block text-[8px] text-gray-600 mt-0.5 italic">{formula}</span>}
        </div>
    );
};
