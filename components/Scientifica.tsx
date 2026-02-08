import { useState } from 'react';
import { History, RotateCcw } from 'lucide-react';

interface Props {
  showToast: (msg: string) => void;
}

export default function Scientifica({ showToast }: Props) {
  const [currentExp, setCurrentExp] = useState("");
  const [preview, setPreview] = useState("");

  const insertChar = (char: string) => setCurrentExp(prev => prev + char);
  const clearAll = () => { setCurrentExp(""); setPreview(""); };

  const calculate = () => {
    try {
      const res = eval(currentExp.replace('×', '*').replace('÷', '/'));
      setPreview(res.toString());
      setCurrentExp(res.toString());
    } catch(e) {
      setPreview("ERROR");
    }
  };

  const Btn = ({ label, onClick, type = 'num', wide = false }: any) => {
    let base = "h-11 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-90 border shadow-sm ";
    if (type === 'num') base += "bg-gray-800 border-gray-700 text-white hover:bg-gray-700";
    else if (type === 'op') base += "bg-app-panel border-gray-800 text-orange-500 hover:bg-orange-600 hover:text-white";
    else if (type === 'eq') base += "bg-orange-600 border-orange-500 text-white hover:bg-orange-700 shadow-md";
    else if (type === 'ac') base += "bg-red-900/10 border-red-900/30 text-red-500 hover:bg-red-600 hover:text-white";
    
    return (
      <button onClick={onClick} className={`${base} ${wide ? 'col-span-2' : ''}`}>
        {label}
      </button>
    );
  };

  return (
    <div className="max-w-xs mx-auto space-y-5">
      <div className="flex flex-col gap-0.5 text-center">
        <span className="industrial-label">Module: 00_Precision_Terminal</span>
        <h1 className="text-2xl font-black uppercase tracking-tighter text-white">Scientific Unit</h1>
      </div>

      <div className="glass-card rounded-[30px] p-5 border-orange-500/10 shadow-2xl">
        {/* Display - Ridotto h-160 a h-110 */}
        <div className="bg-app-input border border-app-border rounded-2xl p-5 mb-5 flex flex-col items-end min-h-[110px] justify-between relative overflow-hidden">
          <span className="text-[7px] font-mono text-gray-700 absolute top-3 right-5 tracking-[0.2em]">REGISTER_0x8F</span>
          <div className="text-gray-500 font-mono text-[10px] mb-1 h-4">{preview || "0.00"}</div>
          <div className="text-3xl font-mono font-black text-white tracking-tighter max-w-full overflow-x-auto whitespace-nowrap scrollbar-hide">
            {currentExp || "0"}
          </div>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-2">
          <Btn label="AC" onClick={clearAll} type="ac" />
          <Btn label={<RotateCcw size={12} />} onClick={() => setCurrentExp("")} type="op" />
          <Btn label="%" type="op" />
          <Btn label="÷" onClick={() => insertChar('/')} type="op" />

          <Btn label="7" onClick={() => insertChar('7')} />
          <Btn label="8" onClick={() => insertChar('8')} />
          <Btn label="9" onClick={() => insertChar('9')} />
          <Btn label="×" onClick={() => insertChar('*')} type="op" />

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

        <div className="mt-5 flex justify-between items-center px-2">
           <button className="text-gray-600 hover:text-orange-500 transition-colors"><History size={14} /></button>
           <span className="text-[7px] font-black text-gray-700 uppercase tracking-widest">FPU_ACTIVE</span>
        </div>
      </div>
    </div>
  );
}