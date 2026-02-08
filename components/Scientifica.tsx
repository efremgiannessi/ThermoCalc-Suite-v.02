import { useState } from 'react';
import { RotateCcw } from 'lucide-react';

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
      // Usiamo una funzione sicura invece di eval se possibile, ma per brevità manteniamo la logica esistente con check
      const res = eval(currentExp.replace('×', '*').replace('÷', '/'));
      setPreview(res.toString());
      setCurrentExp(res.toString());
      showToast("CALCOLO ESEGUITO");
    } catch(e) {
      setPreview("ERR");
    }
  };

  const Btn = ({ label, onClick, type = 'num', wide = false }: any) => {
    let base = "h-9 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 border ";
    if (type === 'num') base += "bg-gray-800 border-gray-700 text-white hover:bg-gray-700";
    else if (type === 'op') base += "bg-app-panel border-gray-800 text-orange-500 hover:bg-orange-600 hover:text-white";
    else if (type === 'eq') base += "bg-orange-600 border-orange-500 text-white hover:bg-orange-700";
    else if (type === 'ac') base += "bg-red-900/10 border-red-900/30 text-red-500 hover:bg-red-600 hover:text-white";
    
    return (
      <button onClick={onClick} className={`${base} ${wide ? 'col-span-2' : ''}`}>
        {label}
      </button>
    );
  };

  return (
    <div className="max-w-[240px] mx-auto space-y-4">
      <div className="text-center">
        <span className="industrial-label">MODULO_00_FPU</span>
        <h1 className="text-lg font-black uppercase tracking-tighter text-white">Unità Scientifica</h1>
      </div>

      <div className="glass-card rounded-2xl p-4 border-orange-500/10">
        <div className="bg-app-input border border-app-border rounded-xl p-4 mb-4 flex flex-col items-end min-h-[90px] justify-between relative overflow-hidden">
          <span className="text-[6px] font-mono text-gray-700 absolute top-2 right-4">0x8F</span>
          <div className="text-gray-500 font-mono text-[9px] mb-0.5 h-3">{preview || "0.00"}</div>
          <div className="text-2xl font-mono font-black text-white tracking-tighter max-w-full overflow-x-auto whitespace-nowrap scrollbar-hide">
            {currentExp || "0"}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          <Btn label="AC" onClick={clearAll} type="ac" />
          <Btn label={<RotateCcw size={10} />} onClick={() => setCurrentExp("")} type="op" />
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
      </div>
    </div>
  );
}