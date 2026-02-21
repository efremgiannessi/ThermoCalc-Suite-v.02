import React from 'react';

interface InputControlProps {
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  type?: 'text' | 'number' | 'select';
  options?: { label: string; value: string | number }[];
  placeholder?: string;
  suffix?: string;
  disabled?: boolean;
}

const InputControl: React.FC<InputControlProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  options,
  placeholder,
  suffix,
  disabled
}) => {
  return (
    <div className="flex flex-col gap-2 mb-4 w-full">
      <label className="industrial-label">
        {label}
      </label>
      
      <div className="relative group">
        {type === 'select' ? (
          <select
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="w-full glass-input rounded-xl px-4 py-3.5 text-base font-bold uppercase tracking-wide focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all appearance-none cursor-pointer disabled:opacity-50"
          >
            <option value="" disabled className="bg-app-panel">Seleziona...</option>
            {options?.map((opt, idx) => (
              <option key={idx} value={opt.value} className="bg-app-panel">
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type === 'number' ? 'text' : type} // Use text to handle comma/dot visually
            inputMode={type === 'number' ? 'decimal' : 'text'}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full glass-input rounded-xl px-4 py-3.5 text-lg font-mono font-bold focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder-slate-600 disabled:opacity-50"
          />
        )}
        
        {/* Dropdown Icon for Select */}
        {type === 'select' && (
          <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500 group-hover:text-orange-500 transition-colors">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        )}

        {/* Suffix for Inputs */}
        {suffix && type !== 'select' && (
          <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
            <span className="text-gray-500 font-mono text-xs">{suffix}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputControl;