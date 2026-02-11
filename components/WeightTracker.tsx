'use client';

import { saveWeight } from '@/app/actions';
import { cn } from '@/lib/utils';
import { WeightEntry } from '@/types';
import { addDays, differenceInCalendarDays, format, isValid, parseISO, subDays } from 'date-fns';
import { Scale, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface WeightTrackerProps {
    date: string;
    entry: WeightEntry | null;
    entries: WeightEntry[];
}

const CHART_HEIGHT = 170;
const CHART_DAYS = 30;

function formatWeight(value: number) {
    return value.toFixed(1);
}

export default function WeightTracker({ date, entry, entries }: WeightTrackerProps) {
    const [weightInput, setWeightInput] = useState(entry ? formatWeight(entry.weight) : '');
    const [isSaving, setIsSaving] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [localEntry, setLocalEntry] = useState<WeightEntry | null>(entry);

    useEffect(() => {
        setWeightInput(entry ? formatWeight(entry.weight) : '');
        setLocalEntry(entry);
        setFeedback(null);
    }, [date, entry]);

    const anchorDate = useMemo(() => {
        const parsed = parseISO(date);
        return isValid(parsed) ? parsed : new Date();
    }, [date]);

    const effectiveEntries = useMemo(() => {
        const byDate = new Map(entries.map((item) => [item.date, item]));
        if (localEntry) {
            byDate.set(localEntry.date, localEntry);
        }
        return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
    }, [entries, localEntry]);

    const chart = useMemo(() => {
        const firstDay = subDays(anchorDate, CHART_DAYS - 1);
        const dateKeys = Array.from({ length: CHART_DAYS }, (_, index) =>
            format(addDays(firstDay, index), 'yyyy-MM-dd')
        );
        const entriesByDate = new Map(effectiveEntries.map((item) => [item.date, item]));
        const getX = (index: number) =>
            CHART_DAYS <= 1 ? 50 : (index / (CHART_DAYS - 1)) * 100;

        const allPoints = dateKeys.map((dateKey, index) => {
            const weight = entriesByDate.get(dateKey)?.weight ?? null;
            return {
                date: dateKey,
                x: getX(index),
                weight,
                label: format(parseISO(dateKey), 'MMM d'),
            };
        });

        const loggedPoints = allPoints.filter(
            (point): point is typeof point & { weight: number } => point.weight !== null
        );

        if (loggedPoints.length === 0) {
            return {
                allPoints,
                loggedPoints: [] as Array<typeof loggedPoints[number] & { y: number }>,
                linePath: '',
                areaPath: '',
                yTicks: [] as Array<{ y: number; value: number }>,
                domainMin: 0,
                domainMax: 0,
            };
        }

        const weights = loggedPoints.map((point) => point.weight);
        const minWeight = Math.min(...weights);
        const maxWeight = Math.max(...weights);
        const rawRange = maxWeight - minWeight;
        const padding = rawRange === 0 ? 1 : Math.max(0.5, rawRange * 0.15);
        const domainMin = minWeight - padding;
        const domainMax = maxWeight + padding;
        const range = Math.max(domainMax - domainMin, 1);

        const getY = (weight: number) => {
            const normalized = (weight - domainMin) / range;
            return CHART_HEIGHT - (normalized * CHART_HEIGHT);
        };

        const plottedPoints = loggedPoints.map((point) => ({
            ...point,
            y: getY(point.weight),
        }));

        const linePath = plottedPoints
            .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
            .join(' ');

        const firstPoint = plottedPoints[0];
        const lastPoint = plottedPoints[plottedPoints.length - 1];
        const areaPath = plottedPoints.length > 1
            ? `${linePath} L ${lastPoint.x} ${CHART_HEIGHT} L ${firstPoint.x} ${CHART_HEIGHT} Z`
            : '';

        const yTicks = [0, 0.5, 1].map((ratio) => ({
            y: CHART_HEIGHT - (ratio * CHART_HEIGHT),
            value: domainMin + ((domainMax - domainMin) * ratio),
        }));

        return {
            allPoints,
            loggedPoints: plottedPoints,
            linePath,
            areaPath,
            yTicks,
            domainMin,
            domainMax,
        };
    }, [anchorDate, effectiveEntries]);

    const trendStats = (() => {
        if (chart.loggedPoints.length === 0) {
            return {
                first: null as (typeof chart.loggedPoints)[number] | null,
                latest: null as (typeof chart.loggedPoints)[number] | null,
                change: null as number | null,
                weeklyChange: null as number | null,
            };
        }

        const first = chart.loggedPoints[0];
        const latest = chart.loggedPoints[chart.loggedPoints.length - 1];
        const change = latest.weight - first.weight;
        const elapsedDays = Math.max(
            differenceInCalendarDays(parseISO(latest.date), parseISO(first.date)),
            1
        );
        const weeklyChange = (change / elapsedDays) * 7;

        return { first, latest, change, weeklyChange };
    })();

    const trendTone = (() => {
        if (trendStats.change === null) return 'none';
        if (trendStats.change <= -0.2) return 'down';
        if (trendStats.change >= 0.2) return 'up';
        return 'flat';
    })();

    const trendMessage = (() => {
        if (chart.loggedPoints.length === 0) {
            return 'Start with today. A short daily logging habit is enough to build momentum.';
        }
        if (chart.loggedPoints.length === 1) {
            return 'Good start. Keep logging for a week to unlock a reliable trend.';
        }
        if (trendStats.change === null || trendStats.weeklyChange === null) {
            return 'Keep going. Consistency matters more than perfect days.';
        }
        if (trendTone === 'down') {
            return `Strong trend: down ${Math.abs(trendStats.change).toFixed(1)} in this window (${Math.abs(trendStats.weeklyChange).toFixed(1)} per week).`;
        }
        if (trendTone === 'up') {
            return `Trend is up ${trendStats.change.toFixed(1)}. Pick one small habit this week to reverse it.`;
        }
        return 'Stable trend. Small consistent choices can restart progress.';
    })();

    const labelIndexes = [0, 7, 14, 21, 29];

    const handleSaveWeight = async (event: React.FormEvent) => {
        event.preventDefault();

        const parsed = Number.parseFloat(weightInput);
        if (!Number.isFinite(parsed)) {
            setFeedback('Enter a valid number.');
            return;
        }
        if (parsed < 30 || parsed > 700) {
            setFeedback('Weight must be between 30 and 700.');
            return;
        }

        const rounded = Math.round(parsed * 10) / 10;
        setFeedback(null);
        setIsSaving(true);
        setLocalEntry({
            date,
            weight: rounded,
            updatedAt: Date.now(),
        });
        setWeightInput(formatWeight(rounded));

        try {
            await saveWeight(date, rounded);
            setFeedback('Saved.');
        } catch {
            setFeedback('Failed to save. Try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const trendIcon = trendTone === 'down'
        ? <TrendingDown className="w-4 h-4" />
        : trendTone === 'up'
            ? <TrendingUp className="w-4 h-4" />
            : <Minus className="w-4 h-4" />;

    return (
        <div id="weight-section" className="p-4 space-y-3 border-t bg-emerald-50/30 dark:bg-emerald-950/20 border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <Scale className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    Weight Trend
                </h2>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {chart.loggedPoints.length}/{CHART_DAYS} days logged
                </span>
            </div>

            <form onSubmit={handleSaveWeight} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-3 shadow-sm space-y-2">
                <label className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    Weight for {format(anchorDate, 'MMM d')}
                </label>
                <div className="flex gap-2">
                    <input
                        id="weight-input"
                        type="number"
                        inputMode="decimal"
                        step="0.1"
                        value={weightInput}
                        onChange={(e) => setWeightInput(e.target.value)}
                        placeholder="e.g. 178.4"
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                        type="submit"
                        disabled={isSaving}
                        className={cn(
                            'px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
                            isSaving
                                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                        )}
                    >
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Use one consistent unit (lb or kg).
                </p>
                {feedback && (
                    <p className={cn(
                        'text-xs font-medium',
                        feedback === 'Saved.' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                    )}>
                        {feedback}
                    </p>
                )}
            </form>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-3 shadow-sm">
                {chart.loggedPoints.length === 0 ? (
                    <div className="h-[170px] flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                        No data yet. Log today to start your trend.
                    </div>
                ) : (
                    <div className="relative">
                        <svg
                            viewBox={`0 0 100 ${CHART_HEIGHT}`}
                            className="w-full"
                            style={{ height: CHART_HEIGHT }}
                            preserveAspectRatio="none"
                        >
                            {chart.yTicks.map((tick) => (
                                <line
                                    key={tick.y}
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

                            <defs>
                                <linearGradient id="weightTrendFill" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity="0.28" />
                                    <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0.04" />
                                </linearGradient>
                            </defs>

                            {chart.areaPath && (
                                <path d={chart.areaPath} fill="url(#weightTrendFill)" />
                            )}

                            {chart.linePath && (
                                <path
                                    d={chart.linePath}
                                    fill="none"
                                    stroke={trendTone === 'up' ? 'rgb(245, 158, 11)' : 'rgb(16, 185, 129)'}
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    vectorEffect="non-scaling-stroke"
                                />
                            )}

                            {chart.loggedPoints.map((point) => (
                                <circle
                                    key={point.date}
                                    cx={point.x}
                                    cy={point.y}
                                    r="1.2"
                                    fill="white"
                                    stroke={trendTone === 'up' ? 'rgb(245, 158, 11)' : 'rgb(16, 185, 129)'}
                                    strokeWidth="1"
                                    vectorEffect="non-scaling-stroke"
                                >
                                    <title>{`${format(parseISO(point.date), 'MMM d')}: ${formatWeight(point.weight)}`}</title>
                                </circle>
                            ))}
                        </svg>

                        <div className="absolute inset-y-0 left-0 flex flex-col justify-between pointer-events-none">
                            {chart.yTicks.slice().reverse().map((tick) => (
                                <span key={tick.y} className="text-[10px] text-gray-500 dark:text-gray-400 -translate-x-1">
                                    {formatWeight(tick.value)}
                                </span>
                            ))}
                        </div>

                        <div className="mt-2 flex justify-between text-[11px] text-gray-500 dark:text-gray-400">
                            {labelIndexes.map((index) => (
                                <span key={index}>{chart.allPoints[index].label}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Start</div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {trendStats.first ? formatWeight(trendStats.first.weight) : '--'}
                    </div>
                </div>
                <div className="rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Latest</div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {trendStats.latest ? formatWeight(trendStats.latest.weight) : '--'}
                    </div>
                </div>
                <div className="rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Change</div>
                    <div className={cn(
                        'font-semibold',
                        trendStats.change === null
                            ? 'text-gray-500 dark:text-gray-400'
                            : trendStats.change <= 0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-amber-600 dark:text-amber-400'
                    )}>
                        {trendStats.change === null ? '--' : `${trendStats.change > 0 ? '+' : ''}${trendStats.change.toFixed(1)}`}
                    </div>
                </div>
            </div>

            <div className={cn(
                'rounded-xl border p-3 text-sm flex items-start gap-2',
                trendTone === 'down'
                    ? 'bg-emerald-100/60 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : trendTone === 'up'
                        ? 'bg-amber-100/60 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            )}>
                <span className="mt-0.5">{trendIcon}</span>
                <span>{trendMessage}</span>
            </div>
        </div>
    );
}
