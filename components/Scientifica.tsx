import { useState } from 'react';
import { Delete, History, RotateCcw } from 'lucide-react';

interface Props {
  showToast: (msg: string) => void;
}

export default function Scientifica({ showToast }: Props) {
  const [currentExp, setCurrentExp] = useState("");
  const [preview, setPreview] = useState("");

  const insertChar = (char: string) => setCurrentExp(prev => prev + char);
  const clearAll = () => { setCurrentExp(""); setPreview(""); };
  const backspace = () => setCurrentExp(prev => prev.slice(0, -1));

  const calculate = () => {
    try {
      // Nota: in produzione userei una libreria di parsing sicura come mathjs
      const res = eval(currentExp.replace('×', '*').replace('÷', '/'));
      setPreview(res.toString());
      setCurrentExp(res.toString());
    } catch(e) {
      setPreview("ERROR");
    }
  };

  const Btn = ({ label, onClick, type = 'num', wide = false }: any) => {
    let base = "h-14 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-90 border shadow-md ";
    if (type === 'num') base += "bg-gray-800 border-gray-700 text-white hover:bg-gray-700";
    else if (type === 'op') base += "bg-app-panel border-gray-800 text-orange-500 hover:bg-orange-600 hover:text-white";
    else if (type === 'eq') base += "bg-orange-600 border-orange-500 text-white hover:bg-orange-700 shadow-xl shadow-orange-900/30";
    else if (type === 'ac') base += "bg-red-900/20 border-red-900/40 text-red-500 hover:bg-red-600 hover:text-white";
    
    return (
      <button onClick={onClick} className={`${base} ${wide ? 'col-span-2' : ''}`}>
        {label}
      </button>
    );
  };

  return (
    <div className="max-w-md mx-auto space-y-8">
      <div className="flex flex-col gap-1">
        <span className="industrial-label">Module: 00_Precision_Terminal</span>
        <h1 className="text-4xl font-black uppercase tracking-tighter text-white">Scientific Unit</h1>
      </div>

      <div className="glass-card rounded-[40px] p-8 border-orange-500/10 shadow-2xl">
        {/* Display */}
        <div className="bg-app-input border border-app-border rounded-3xl p-8 mb-8 flex flex-col items-end min-h-[160px] justify-between relative overflow-hidden">
          <div className="absolute top-4 left-6 flex gap-1">
             <div className="w-3 h-1 bg-orange-600 rounded-full"></div>
             <div className="w-3 h-1 bg-orange-600 rounded-full opacity-30"></div>
          </div>
          <span className="text-[8px] font-mono text-gray-700 absolute top-4 right-8 tracking-[0.4em]">MEM_REGISTER_0x8F</span>
          
          <div className="text-gray-500 font-mono text-xs mb-2 h-6">{preview || "0.00"}</div>
          <div className="text-5xl font-mono font-black text-white tracking-tighter max-w-full overflow-x-auto whitespace-nowrap scrollbar-hide">
            {currentExp || "0"}
          </div>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-3">
          <Btn label="AC" onClick={clearAll} type="ac" />
          <Btn label={<RotateCcw size={16} />} onClick={() => setCurrentExp("")} type="op" />
          <Btn label="%" type="op" />
          <Btn label="÷" onClick={() => insertChar('÷')} type="op" />

          <Btn label="7" onClick={() => insertChar('7')} />
          <Btn label="8" onClick={() => insertChar('8')} />
          <Btn label="9" onClick={() => insertChar('9')} />
          <Btn label="×" onClick={() => insertChar('×')} type="op" />

          <Btn label="4" onClick={() => insertChar('4')} />
          <Btn label="5" onClick={() => insertChar('5')} />
          <Btn label="6" onClick={() => insertChar('6')} />
          <Btn label="-" onClick={() => insertChar('-')} type="op" />

          <Btn label="1" onClick={() => insertChar('1')} />
          <Btn label="2" onClick={() => insertChar('2')} />
          <Btn label="3" onClick={() => insertChar('3')} />
          <Btn label="+" onClick={() => insertChar('+')} type="op" />

          <Btn label="0" onClick={() => insertChar('0')} wide />
          <Btn label="." onClick={() => insertChar('.')} />
          <Btn label="=" onClick={calculate} type="eq" />
        </div>

        <div className="mt-8 flex justify-between items-center px-4">
           <div className="flex gap-4">
              <button className="text-gray-600 hover:text-orange-500 transition-colors"><History size={16} /></button>
           </div>
           <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest">Floating_Point_Unit_Active</span>
        </div>
      </div>
    </div>
  );
}