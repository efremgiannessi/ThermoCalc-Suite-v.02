import { useState } from 'react';

interface Props {
  showToast: (msg: string) => void;
}

export default function Scientifica({ showToast }: Props) {
  const [currentExp, setCurrentExp] = useState("");
  const [calcMode, setCalcMode] = useState<"deg" | "rad">("deg");
  const [history, setHistory] = useState<string[]>([]);
  const [preview, setPreview] = useState("");

  const formatNumber = (num: number) => parseFloat(num.toPrecision(12)).toString();

  const factorial = (n: number): number => (n !== 1) ? n * factorial(n - 1) : 1;
  const calc_sin = (x: number) => Math.sin(calcMode === 'deg' ? x * Math.PI / 180 : x);
  const calc_cos = (x: number) => Math.cos(calcMode === 'deg' ? x * Math.PI / 180 : x);
  const calc_tan = (x: number) => Math.tan(calcMode === 'deg' ? x * Math.PI / 180 : x);
  const calc_asin = (x: number) => calcMode === 'deg' ? Math.asin(x) * 180 / Math.PI : Math.asin(x);
  const calc_acos = (x: number) => calcMode === 'deg' ? Math.acos(x) * 180 / Math.PI : Math.acos(x);
  const calc_atan = (x: number) => calcMode === 'deg' ? Math.atan(x) * 180 / Math.PI : Math.atan(x);

  const evaluateExpression = (str: string) => {
    let safeStr = str.replace(/π/g, Math.PI.toString()).replace(/E/g, Math.E.toString());
    safeStr = safeStr.replace(/\^/g, "**");
    safeStr = safeStr.replace(/(\d+)!/g, "factorial($1)");
    safeStr = safeStr.replace(/sqrt\(/g, "Math.sqrt(");
    safeStr = safeStr.replace(/log\(/g, "Math.log10(");
    safeStr = safeStr.replace(/ln\(/g, "Math.log(");
    safeStr = safeStr.replace(/asin\(/g, "this.calc_asin(");
    safeStr = safeStr.replace(/acos\(/g, "this.calc_acos(");
    safeStr = safeStr.replace(/atan\(/g, "this.calc_atan(");
    safeStr = safeStr.replace(/sin\(/g, "this.calc_sin(");
    safeStr = safeStr.replace(/cos\(/g, "this.calc_cos(");
    safeStr = safeStr.replace(/tan\(/g, "this.calc_tan(");

    const context = {
      Math, factorial,
      calc_sin, calc_cos, calc_tan,
      calc_asin, calc_acos, calc_atan
    };
    // eslint-disable-next-line no-new-func
    const fn = new Function("return " + safeStr);
    return fn.call(context);
  };

  const tryEval = (exp: string) => {
    if (exp.length === 0) { setPreview(""); return; }
    try {
      const res = evaluateExpression(exp);
      if (!isNaN(res) && isFinite(res)) setPreview(formatNumber(res));
      else setPreview("");
    } catch (e) { setPreview(""); }
  };

  const insertChar = (char: string) => {
    let newExp = currentExp;
    if (char === 'PI') char = 'π';
    if ((char === '(' || char === 'π' || char === 'E') && currentExp.length > 0) {
        const last = currentExp.slice(-1);
        if (!isNaN(parseFloat(last)) || last === ')' || last === 'π' || last === 'E') newExp += '*';
    }
    newExp += char;
    setCurrentExp(newExp);
    tryEval(newExp);
  };

  const sciFunc = (fn: string) => {
    let newExp = currentExp;
    if (newExp.length > 0) {
        const last = newExp.slice(-1);
        if (!isNaN(parseFloat(last)) || last === ')') newExp += '*';
    }
    if(fn === 'random') newExp += Math.random().toFixed(4);
    else newExp += fn + "(";
    setCurrentExp(newExp);
    tryEval(newExp);
  };

  const backspace = () => {
    const newExp = currentExp.slice(0, -1);
    setCurrentExp(newExp);
    tryEval(newExp);
  };

  const clearAll = () => { setCurrentExp(""); setPreview(""); };
  const calcPercent = () => { const newExp = currentExp + "/100"; setCurrentExp(newExp); tryEval(newExp); };

  const calculate = () => {
    if (currentExp.length === 0) return;
    try {
        const res = evaluateExpression(currentExp);
        if (isNaN(res) || !isFinite(res)) throw new Error("Err");
        const formatted = formatNumber(res);
        setHistory(prev => [currentExp + " = " + formatted, ...prev.slice(0, 2)]);
        setCurrentExp(formatted);
        setPreview("");
    } catch (e) { setPreview("Errore"); }
  };

  const copyResult = () => { navigator.clipboard.writeText(currentExp); showToast('Risultato copiato'); };

  const Btn = ({ label, type, onClick, extraClass }: any) => {
    let baseClass = "h-14 rounded-xl text-sm font-semibold transition-all active:scale-95 flex items-center justify-center shadow-lg select-none backdrop-blur-md border ";
    if (type === 'num') baseClass += "bg-white/5 border-white/5 text-white text-xl font-sans hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]";
    else if (type === 'op') baseClass += "bg-accent-600/30 border-accent-500/30 text-accent-400 text-xl hover:bg-accent-500/40 hover:text-white";
    else if (type === 'fn') baseClass += "bg-slate-900/40 border-white/5 text-slate-400 text-xs hover:bg-white/10 hover:text-white";
    else if (type === 'ac') baseClass += "bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/40 hover:text-white hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]";
    else if (type === 'eq') baseClass += "bg-emerald-500/20 border-emerald-400/30 text-emerald-400 text-2xl hover:bg-emerald-500/40 hover:text-white hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]";
    
    return <button onClick={onClick} className={`${baseClass} ${extraClass || ''}`}>{label}</button>;
  };

  return (
    <div className="max-w-lg mx-auto glass-panel rounded-[2rem] p-8 animate-slide-in shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
      <div className="glass-input rounded-2xl p-6 mb-6 shadow-inner flex flex-col relative overflow-hidden h-[160px] border border-white/10">
        <button 
            onClick={() => { setCalcMode(m => m === 'deg' ? 'rad' : 'deg'); tryEval(currentExp); }} 
            className={`absolute top-4 left-4 text-[10px] font-bold px-2 py-1 rounded-lg cursor-pointer transition-colors uppercase tracking-wider backdrop-blur-md ${calcMode === 'deg' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}
        >
            {calcMode}
        </button>
        <div className="text-[11px] text-slate-500 h-10 overflow-hidden text-right mb-1 leading-5 opacity-60 font-mono">
            {history.map((h, i) => <div key={i}>{h}</div>)}
        </div>
        <div className="text-xl text-slate-500 text-right h-8 overflow-hidden font-mono mb-1">{preview}</div>
        <div className="text-4xl font-mono text-white text-right overflow-x-auto whitespace-nowrap scrollbar-hide mt-auto flex justify-end items-center tracking-tight">
            {currentExp || '0'}
            <span className="w-[3px] h-[1.2em] bg-accent-500 inline-block ml-1 animate-pulse rounded-full shadow-[0_0_8px_#3b82f6]"></span>
        </div>
        <button onClick={copyResult} className="absolute bottom-3 left-3 text-slate-600 hover:text-slate-300 transition-colors p-2"><i className="fa-regular fa-copy"></i></button>
      </div>

      <div className="grid grid-cols-5 gap-3">
        <Btn type="fn" label="sin" onClick={() => sciFunc('sin')} />
        <Btn type="fn" label="cos" onClick={() => sciFunc('cos')} />
        <Btn type="fn" label="tan" onClick={() => sciFunc('tan')} />
        <Btn type="fn" label="(" onClick={() => insertChar('(')} />
        <Btn type="fn" label=")" onClick={() => insertChar(')')} />

        <Btn type="fn" label="sin⁻¹" onClick={() => sciFunc('asin')} />
        <Btn type="fn" label="cos⁻¹" onClick={() => sciFunc('acos')} />
        <Btn type="fn" label="tan⁻¹" onClick={() => sciFunc('atan')} />
        <Btn type="fn" label="log" onClick={() => sciFunc('log')} />
        <Btn type="fn" label="ln" onClick={() => sciFunc('ln')} />

        <Btn type="fn" label="x²" onClick={() => insertChar('^2')} />
        <Btn type="fn" label="xʸ" onClick={() => insertChar('^')} />
        <Btn type="fn" label="√" onClick={() => sciFunc('sqrt')} />
        <Btn type="fn" label="RND" onClick={() => sciFunc('random')} />
        <Btn type="op" label="÷" onClick={() => insertChar('/')} />

        <Btn type="num" label="7" onClick={() => insertChar('7')} />
        <Btn type="num" label="8" onClick={() => insertChar('8')} />
        <Btn type="num" label="9" onClick={() => insertChar('9')} />
        <button onClick={backspace} className="h-14 rounded-xl text-lg font-semibold transition-all active:scale-95 flex items-center justify-center shadow-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/30 backdrop-blur-md"><i className="fa-solid fa-delete-left"></i></button>
        <Btn type="op" label="×" onClick={() => insertChar('*')} />

        <Btn type="num" label="4" onClick={() => insertChar('4')} />
        <Btn type="num" label="5" onClick={() => insertChar('5')} />
        <Btn type="num" label="6" onClick={() => insertChar('6')} />
        <Btn type="ac" label="AC" onClick={clearAll} />
        <Btn type="op" label="-" onClick={() => insertChar('-')} />

        <Btn type="num" label="1" onClick={() => insertChar('1')} />
        <Btn type="num" label="2" onClick={() => insertChar('2')} />
        <Btn type="num" label="3" onClick={() => insertChar('3')} />
        <Btn type="fn" label="π" onClick={() => insertChar('PI')} />
        <Btn type="op" label="+" onClick={() => insertChar('+')} />

        <Btn type="num" label="0" onClick={() => insertChar('0')} extraClass="rounded-bl-xl" />
        <Btn type="num" label="." onClick={() => insertChar('.')} />
        <Btn type="fn" label="e" onClick={() => insertChar('E')} />
        <Btn type="fn" label="%" onClick={calcPercent} />
        <Btn type="eq" label="=" onClick={calculate} extraClass="rounded-br-xl" />
      </div>
    </div>
  );
}