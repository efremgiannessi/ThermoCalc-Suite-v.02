
import React from 'react';

interface SelectOption { value: string; label: string; }
interface OptionGroup { label: string; options: SelectOption[]; }
type SelectOptions = (SelectOption | OptionGroup)[];

interface SelectFieldProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: SelectOptions;
}

export const SelectField: React.FC<SelectFieldProps> = ({ id, label, value, onChange, options }) => {
    return (
        <div className="flex flex-col">
            <label htmlFor={id} className="mb-0.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</label>
            <div className="relative group">
                 <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-gray-700/40 border border-gray-600/50 rounded-lg py-1.5 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all appearance-none text-sm">
                    {options.map(opt => {
                        if ('options' in opt) {
                            return <optgroup key={opt.label} label={opt.label}>{opt.options.map(o => <option key={o.value} value={o.value} className="bg-gray-800 text-gray-200">{o.label}</option>)}</optgroup>;
                        }
                        return <option key={opt.value} value={opt.value} className="bg-gray-800 text-gray-200">{opt.label}</option>;
                    })}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-500">
                    <svg className="fill-current h-3.5 w-3.5" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
            </div>
        </div>
    );
};
