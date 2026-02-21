
import React from 'react';

interface LoadDataItem { label: string; value: number; color: string; }
interface LoadBreakdownChartProps { data: LoadDataItem[]; }

const DonutSlice: React.FC<{ item: LoadDataItem, total: number, startAngle: number, radius: number, holeRadius: number }> = ({ item, total, startAngle, radius, holeRadius }) => {
    if (item.value <= 0 || total <= 0) return null;
    const angle = (item.value / total) * 360;
    const endAngle = startAngle + angle;
    const getCoords = (angle: number, r: number) => ({ x: 50 + r * Math.cos((angle - 90) * Math.PI / 180), y: 50 + r * Math.sin((angle - 90) * Math.PI / 180) });
    const start = getCoords(startAngle, radius);
    const end = getCoords(endAngle, radius);
    const startInner = getCoords(startAngle, holeRadius);
    const endInner = getCoords(endAngle, holeRadius);
    const largeArcFlag = angle > 180 ? 1 : 0;
    const pathData = [`M ${start.x} ${start.y}`, `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`, `L ${endInner.x} ${endInner.y}`, `A ${holeRadius} ${holeRadius} 0 ${largeArcFlag} 0 ${startInner.x} ${startInner.y}`, 'Z'].join(' ');
    return <path d={pathData} fill={item.color} />;
};

export const LoadBreakdownChart: React.FC<LoadBreakdownChartProps> = ({ data }) => {
    const totalValue = React.useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);
    if (totalValue <= 0) return <div className="text-center text-gray-500 text-xs">Nessun carico da visualizzare.</div>;
    let accumulatedAngle = 0;
    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <div className="relative w-28 h-28 flex-shrink-0">
                <svg viewBox="0 0 100 100" width="100%" height="100%">
                     {data.map(item => { const slice = <DonutSlice key={item.label} item={item} total={totalValue} startAngle={accumulatedAngle} radius={50} holeRadius={30} />; accumulatedAngle += (item.value / totalValue) * 360; return slice; })}
                </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"><span className="text-[10px] text-gray-400">Totale</span><span className="font-bold text-base text-gray-200">{totalValue.toFixed(0)}</span><span className="text-[10px] text-gray-400">kg/m</span></div>
            </div>
            <div className="flex flex-col space-y-1.5 text-[11px]">
                {data.map(item => (
                    <div key={item.label} className="flex items-center">
                        <span className="w-2.5 h-2.5 rounded-sm mr-1.5" style={{ backgroundColor: item.color }}></span>
                        <span className="text-gray-300 w-20">{item.label}</span>
                        <span className="font-semibold text-gray-200 w-14 text-right">{item.value.toFixed(1)}</span>
                        <span className="text-gray-400 w-10 text-right">({((item.value / totalValue) * 100).toFixed(0)}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
