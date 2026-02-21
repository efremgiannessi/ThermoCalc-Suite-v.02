
import React from 'react';

interface StressDiagramProps { M_max: number; T_max: number; }

export const StressDiagram: React.FC<StressDiagramProps> = ({ M_max, T_max }) => {
    const viewBoxWidth = 400; const viewBoxHeight = 250; const margin = 20; const beamY = 40; const shearBaselineY = 110; const momentBaselineY = 200;
    const beamStart = margin; const beamEnd = viewBoxWidth - margin; const beamLength = beamEnd - beamStart; const beamCenter = beamStart + beamLength / 2;
    const shearHeight = 35; const momentHeight = 50;

    const formatNumber = (num: number) => num < 1000 ? num.toFixed(0) : (num / 1000).toFixed(1) + 'k';

    return (
        <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} width="100%" height="auto" role="img" className="text-gray-400">
            <line x1={beamStart} y1={beamY} x2={beamEnd} y2={beamY} stroke="currentColor" strokeWidth="2" />
            <path d={`M ${beamStart - 5} ${beamY + 10} l 5 -10 l 5 10 z`} fill="currentColor" />
            <path d={`M ${beamEnd - 5} ${beamY + 10} l 5 -10 l 5 10 z`} fill="currentColor" />
            <g>
                <text x={beamStart} y={shearBaselineY - shearHeight - 5} fontSize="12" fill="currentColor" textAnchor="start">+{formatNumber(T_max)} kg</text>
                <text x={beamEnd} y={shearBaselineY + shearHeight + 12} fontSize="12" fill="currentColor" textAnchor="end">-{formatNumber(T_max)} kg</text>
                <text x={beamCenter} y={shearBaselineY - 5} fontSize="12" fill="currentColor" textAnchor="middle">Taglio (T)</text>
                <path d={`M ${beamStart},${shearBaselineY - shearHeight} L ${beamCenter},${shearBaselineY} L ${beamEnd},${shearBaselineY + shearHeight}`} fill="none" stroke="#f59e0b" strokeWidth="1.5" />
                <path d={`M ${beamStart},${shearBaselineY - shearHeight} L ${beamCenter},${shearBaselineY} L ${beamEnd},${shearBaselineY + shearHeight} L ${beamEnd},${shearBaselineY} L ${beamStart},${shearBaselineY} Z`} fill="#f59e0b" fillOpacity="0.2" />
                <line x1={beamStart} y1={shearBaselineY} x2={beamEnd} y2={shearBaselineY} stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
            </g>
            <g>
                <text x={beamCenter} y={momentBaselineY + momentHeight + 15} fontSize="12" fill="currentColor" textAnchor="middle">Mmax: {formatNumber(M_max)} kgm</text>
                <text x={beamCenter} y={momentBaselineY - 5} fontSize="12" fill="currentColor" textAnchor="middle">Momento (M)</text>
                <path d={`M ${beamStart},${momentBaselineY} Q ${beamCenter},${momentBaselineY + momentHeight} ${beamEnd},${momentBaselineY}`} fill="none" stroke="#f97316" strokeWidth="1.5" />
                <path d={`M ${beamStart},${momentBaselineY} Q ${beamCenter},${momentBaselineY + momentHeight} ${beamEnd},${momentBaselineY} Z`} fill="#f97316" fillOpacity="0.2" />
                <line x1={beamStart} y1={momentBaselineY} x2={beamEnd} y2={momentBaselineY} stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
            </g>
        </svg>
    );
};
