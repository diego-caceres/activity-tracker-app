'use client';

import { DailyScore } from '@/types';
import { format, parseISO, subDays } from 'date-fns';
import { useMemo } from 'react';

interface WeeklyChartProps {
    scores: DailyScore[];
}

export default function WeeklyChart({ scores }: WeeklyChartProps) {
    const chartData = useMemo(() => {
        // Generate the last 7 days
        const today = new Date();
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = subDays(today, 6 - i);
            return format(date, 'yyyy-MM-dd');
        });

        // Map scores to the last 7 days
        const data = last7Days.map(date => {
            const scoreData = scores.find(s => s.date === date);
            return {
                date,
                score: scoreData?.score ?? 0,
                label: format(parseISO(date), 'EEE'), // Mon, Tue, etc.
            };
        });

        // Calculate min and max for Y-axis scaling
        const scoreValues = data.map(d => d.score);
        const minScore = Math.min(...scoreValues, 0);
        const maxScore = Math.max(...scoreValues, 0);

        // Add padding to the range (10% on each side)
        const range = maxScore - minScore;
        const padding = range * 0.1 || 1; // At least 1 point padding
        const yMin = minScore - padding;
        const yMax = maxScore + padding;

        return { data, yMin, yMax };
    }, [scores]);

    const { data, yMin, yMax } = chartData;

    // Chart dimensions
    const chartHeight = 200;
    const chartWidth = 100; // percentage
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };

    // Calculate Y position for a score
    const getYPosition = (score: number) => {
        const range = yMax - yMin;
        if (range === 0) return chartHeight / 2;
        const normalizedScore = (score - yMin) / range;
        return chartHeight - (normalizedScore * chartHeight);
    };

    // Calculate X position for an index
    const getXPosition = (index: number) => {
        const step = 100 / (data.length - 1);
        return step * index;
    };

    // Generate SVG path for the line
    const linePath = data
        .map((point, index) => {
            const x = getXPosition(index);
            const y = getYPosition(point.score);
            return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
        })
        .join(' ');

    // Generate area path (for gradient fill)
    const areaPath = `${linePath} L ${getXPosition(data.length - 1)} ${chartHeight} L 0 ${chartHeight} Z`;

    // Y-axis ticks
    const yTicks = useMemo(() => {
        const tickCount = 5;
        const range = yMax - yMin;
        const step = range / (tickCount - 1);
        return Array.from({ length: tickCount }, (_, i) => {
            const value = yMin + (step * i);
            return {
                value: Math.round(value * 10) / 10,
                y: getYPosition(yMin + (step * i)),
            };
        });
    }, [yMin, yMax]);

    return (
        <div className="p-4 border-t bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                Weekly Trend
            </h2>

            <div className="relative" style={{ paddingLeft: padding.left, paddingRight: padding.right }}>
                {/* SVG Chart */}
                <div className="relative" style={{ height: chartHeight }}>
                    <svg
                        viewBox={`0 0 100 ${chartHeight}`}
                        className="w-full absolute inset-0"
                        style={{ height: chartHeight }}
                        preserveAspectRatio="none"
                    >
                        {/* Grid lines */}
                        {yTicks.map((tick, i) => (
                            <line
                                key={i}
                                x1="0"
                                y1={tick.y}
                                x2="100"
                                y2={tick.y}
                                stroke="currentColor"
                                strokeWidth="0.2"
                                className="text-gray-300 dark:text-gray-700"
                                vectorEffect="non-scaling-stroke"
                            />
                        ))}

                        {/* Area fill with gradient */}
                        <defs>
                            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="rgb(34, 197, 94)" stopOpacity="0.05" />
                            </linearGradient>
                        </defs>
                        <path
                            d={areaPath}
                            fill="url(#scoreGradient)"
                            className="transition-all duration-300"
                        />

                        {/* Line */}
                        <path
                            d={linePath}
                            fill="none"
                            stroke="rgb(34, 197, 94)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            vectorEffect="non-scaling-stroke"
                            className="transition-all duration-300"
                        />
                    </svg>

                    {/* Data points - rendered as absolute positioned divs to maintain circular shape */}
                    {data.map((point, index) => {
                        const xPercent = getXPosition(index);
                        const yPercent = (getYPosition(point.score) / chartHeight) * 100;
                        const isPositive = point.score >= 0;

                        return (
                            <div
                                key={point.date}
                                className="absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full bg-white border-2 transition-all duration-300 cursor-pointer hover:scale-125"
                                style={{
                                    left: `${xPercent}%`,
                                    top: `${yPercent}%`,
                                    borderColor: isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
                                }}
                                title={`${point.label}: ${point.score > 0 ? '+' : ''}${point.score}`}
                            />
                        );
                    })}
                </div>

                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between" style={{ width: padding.left }}>
                    {yTicks.slice().reverse().map((tick, i) => (
                        <div
                            key={i}
                            className="text-xs text-gray-600 dark:text-gray-400 text-right pr-2"
                            style={{ lineHeight: '1' }}
                        >
                            {tick.value > 0 ? '+' : ''}{tick.value}
                        </div>
                    ))}
                </div>

                {/* X-axis labels */}
                <div className="flex justify-between mt-2" style={{ marginLeft: -padding.left / 2, marginRight: -padding.right / 2 }}>
                    {data.map((point, index) => (
                        <div
                            key={point.date}
                            className="text-xs text-gray-600 dark:text-gray-400 text-center flex-1"
                        >
                            {point.label}
                        </div>
                    ))}
                </div>
            </div>

            {/* Summary stats */}
            <div className="mt-4 flex justify-around text-sm">
                <div className="text-center">
                    <div className="text-gray-500 dark:text-gray-400">Min</div>
                    <div className="font-bold text-gray-900 dark:text-gray-100">
                        {Math.min(...data.map(d => d.score)) > 0 ? '+' : ''}
                        {Math.min(...data.map(d => d.score))}
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-gray-500 dark:text-gray-400">Avg</div>
                    <div className="font-bold text-gray-900 dark:text-gray-100">
                        {(data.reduce((sum, d) => sum + d.score, 0) / data.length).toFixed(1) > '0' ? '+' : ''}
                        {(data.reduce((sum, d) => sum + d.score, 0) / data.length).toFixed(1)}
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-gray-500 dark:text-gray-400">Max</div>
                    <div className="font-bold text-gray-900 dark:text-gray-100">
                        {Math.max(...data.map(d => d.score)) > 0 ? '+' : ''}
                        {Math.max(...data.map(d => d.score))}
                    </div>
                </div>
            </div>
        </div>
    );
}
