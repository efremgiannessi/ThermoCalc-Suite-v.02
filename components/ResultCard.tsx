import React from 'react';

interface ResultCardProps {
  result: number | null;
}

const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const hasResult = result !== null && result > 0 && isFinite(result);

  return (
    <div className="sticky bottom-4 z-40 w-full mb-4 px-1">
      <div 
        className={`
          relative overflow-hidden rounded-2xl shadow-2xl transition-all duration-500 ease-out transform border
          ${hasResult ? 'bg-gradient-to-r from-orange-600 to-orange-800 scale-100 border-orange-400/50' : 'glass-panel scale-95 border-white/5'}
        `}
      >
        {/* Glow Effect Background */}
        {hasResult && (
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 blur-xl rounded-full animate-pulse pointer-events-none"></div>
        )}

        <div className="p-5 flex flex-col items-center justify-center text-center">
          <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${hasResult ? 'text-orange-200' : 'text-slate-500'}`}>
            Spessore Minimo Isolante
          </span>
          
          <div className="flex items-baseline gap-2">
            {hasResult ? (
              <>
                <span className="text-5xl font-black text-white tracking-tighter drop-shadow-md font-mono">
                  {result.toFixed(1).replace('.', ',')}
                </span>
                <span className="text-xl font-bold text-orange-200 uppercase">cm</span>
              </>
            ) : (
              <span className="text-xl font-bold text-slate-600 uppercase tracking-widest py-2">
                IN ATTESA DI DATI...
              </span>
            )}
          </div>
          
          {hasResult && (
            <div className="mt-2 text-[8px] font-mono text-orange-200/80 bg-black/20 px-3 py-1 rounded-full border border-white/10">
              CALCULATED • READY FOR PRODUCTION
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultCard;