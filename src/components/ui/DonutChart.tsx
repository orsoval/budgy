import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function formatAmount(value: number): string {
    if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (Math.abs(value) >= 10_000) return `${(value / 1_000).toFixed(0)}k`;
    if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
    return value.toFixed(0);
}

interface DonutChartItem {
    id: string;
    label: string;
    value: number;
    color: string;
}

interface DonutChartProps {
    data: DonutChartItem[];
    currency: string;
}

export function DonutChart({ data, currency }: DonutChartProps) {
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const total = useMemo(() => data.reduce((acc, item) => acc + item.value, 0), [data]);

    const segments = useMemo(() => {
        return data.reduce((acc, item) => {
            const last = acc[acc.length - 1];
            const startAngle = last ? last.startAngle + last.angleSpace : 0;
            const percentage = total > 0 ? item.value / total : 0;
            const angleSpace = percentage * 360;
            
            const radius = 40;
            const circumference = 2 * Math.PI * radius;
            const strokeDasharray = `${(percentage * circumference)} ${circumference}`;
            const strokeDashoffset = -((startAngle / 360) * circumference);

            acc.push({
                ...item,
                percentage,
                strokeDasharray,
                strokeDashoffset,
                radius,
                circumference,
                startAngle,
                angleSpace
            });
            return acc;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }, [] as any[]);
    }, [data, total]);
    if (data.length === 0 || total === 0) {
        return <p className="text-sm text-zinc-500">Aucune donnée disponible.</p>;
    }

    const hoveredItem = data.find(i => i.id === hoveredId);

    return (
        <div className="flex flex-col md:flex-row items-center gap-8 w-full justify-center">
            {/* Chart */}
            <div className="relative w-48 h-48 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 origin-center drop-shadow-md">
                    {segments.map((segment) => {
                        const isHovered = hoveredId === segment.id;
                        const isMuted = hoveredId !== null && !isHovered;

                        return (
                            <motion.circle
                                key={segment.id}
                                cx="50"
                                cy="50"
                                r={segment.radius}
                                fill="none"
                                stroke={segment.color}
                                strokeWidth={isHovered ? 18 : 14}
                                strokeDasharray={segment.strokeDasharray}
                                strokeDashoffset={segment.strokeDashoffset}
                                className="transition-all duration-300 origin-center cursor-pointer"
                                style={{
                                    opacity: isMuted ? 0.4 : 1,
                                    filter: isHovered ? `drop-shadow(0 0 8px ${segment.color}66)` : 'none'
                                }}
                                initial={{ strokeDasharray: `0 ${segment.circumference}` }}
                                animate={{ strokeDasharray: segment.strokeDasharray }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                onMouseEnter={() => setHoveredId(segment.id)}
                                onMouseLeave={() => setHoveredId(null)}
                            />
                        );
                    })}
                </svg>

                {/* Center tooltip */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <AnimatePresence mode="wait">
                        {hoveredItem ? (
                            <motion.div
                                key="hovered"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.15 }}
                                className="text-center"
                            >
                                <p className="text-xs font-medium text-zinc-500 line-clamp-1 px-4">{hoveredItem.label}</p>
                                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                                    {((hoveredItem.value / total) * 100).toFixed(0)}%
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="total"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center"
                            >
                                <p className="text-xs font-medium text-zinc-500">Total</p>
                                <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                                    {total > 1000 ? `${(total/1000).toFixed(1)}k` : total.toFixed(0)}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Légende */}
            <div className="flex-1 w-full flex flex-col gap-3">
                {segments.map((segment) => {
                    const isHovered = hoveredId === segment.id;
                    const isMuted = hoveredId !== null && !isHovered;
                    
                    return (
                        <div 
                            key={segment.id} 
                            className={`flex items-center justify-between text-sm transition-opacity duration-200 cursor-pointer p-2 -mx-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-white/5 ${isMuted ? 'opacity-40' : 'opacity-100'}`}
                            onMouseEnter={() => setHoveredId(segment.id)}
                            onMouseLeave={() => setHoveredId(null)}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-3 h-3 rounded-full transition-transform duration-200 ${isHovered ? 'scale-125' : ''}`}
                                    style={{ backgroundColor: segment.color, boxShadow: isHovered ? `0 0 10px ${segment.color}` : 'none' }}
                                />
                                <span className={`font-medium ${isHovered ? 'text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                    {segment.label}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <span className="font-bold text-zinc-900 dark:text-white whitespace-nowrap text-sm">
                                    {formatAmount(segment.value)} <span className="font-medium text-zinc-500 text-xs">{currency}</span>
                                </span>
                                <span className="text-zinc-400 w-9 text-right font-medium text-xs">
                                    {(segment.percentage * 100).toFixed(0)}%
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
