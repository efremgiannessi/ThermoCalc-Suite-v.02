
import React, { useState, useEffect } from 'react';

interface InputFieldProps {
    id: string;
    label: string;
    unit: string;
    value: number;
    onChange: (value: number) => void;
    type?: 'number';
    step?: string;
}

export const InputField: React.FC<InputFieldProps> = ({ id, label, unit, value, onChange, step = "0.01" }) => {
    const [textValue, setTextValue] = useState(String(value));
    useEffect(() => { if (parseFloat(textValue) !== value) setTextValue(String(value)); }, [value]);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newText = e.target.value;
        setTextValue(newText);
        if (newText === '' || newText === '-') onChange(0);
        else { const num = parseFloat(newText); if (!isNaN(num)) onChange(num); }
    };
    const handleBlur = () => setTextValue(String(value));
    return (
        <div className="flex flex-col">
            <label htmlFor={id} className="mb-0.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</label>
            <div className="relative group">
                <input type="text" inputMode="decimal" id={id} value={textValue} onChange={handleChange} onBlur={handleBlur} step={step} className="w-full bg-gray-700/40 border border-gray-600/50 rounded-lg py-1.5 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-sm" aria-describedby={`${id}-unit`} />
                <span id={`${id}-unit`} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 pointer-events-none text-[9px] font-bold uppercase">{unit}</span>
            </div>
        </div>
    );
};
