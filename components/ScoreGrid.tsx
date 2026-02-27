'use client';

import { useState } from 'react';
import { DailyScore, WateringStatus } from '@/types';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, getDate, startOfWeek } from 'date-fns';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ScoreGridProps {
    scores: DailyScore[];
    wateringStatuses?: WateringStatus[];
    initialMonth?: string; // YYYY-MM format
    currentDate?: string; // YYYY-MM-DD format for highlighting
}

export default function ScoreGrid({ scores, wateringStatuses, initialMonth, currentDate }: ScoreGridProps) {
    const router = useRouter();
    const [currentMonth, setCurrentMonth] = useState(() => {
        return initialMonth || format(new Date(), 'yyyy-MM');
    });

    // Calculate date range: start from Sunday of the week containing the 1st of the month
    const monthStart = startOfMonth(parseISO(`${currentMonth}-01`));
    const monthEnd = endOfMonth(monthStart);
    const rangeStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // 0 = Sunday
    const days = eachDayOfInterval({ start: rangeStart, end: monthEnd });

    const getScoreColor = (score: number, hasData: boolean) => {
        if (!hasData) {
            return 'bg-slate-100 dark:bg-[#1b1f2e] border border-slate-200 dark:border-white/[0.05]';
        }
        if (score === 0) {
            return 'bg-indigo-500/20 border border-indigo-500/30';
        } else if (score >= 3) {
            return 'bg-green-500 dark:bg-green-600 border border-green-600 dark:border-green-700';
        } else if (score > 0) {
            return 'bg-green-300 dark:bg-green-800 border border-green-400 dark:border-green-700';
        } else if (score >= -2) {
            return 'bg-orange-300 dark:bg-orange-800 border border-orange-400 dark:border-orange-700';
        } else {
            return 'bg-red-500 dark:bg-red-600 border border-red-600 dark:border-red-700';
        }
    };

    const getTextColor = (score: number, hasData: boolean) => {
        if (!hasData) return 'text-slate-700 dark:text-slate-300';
        if (score === 0) return 'text-indigo-700 dark:text-indigo-300';
        if (score >= 3 || score < -2) return 'text-white';
        return 'text-slate-700 dark:text-slate-300';
    };

    const handlePrevMonth = () => {
        const prev = subMonths(parseISO(`${currentMonth}-01`), 1);
        setCurrentMonth(format(prev, 'yyyy-MM'));
    };

    const handleNextMonth = () => {
        const next = addMonths(parseISO(`${currentMonth}-01`), 1);
        setCurrentMonth(format(next, 'yyyy-MM'));
    };

    const handleDayClick = (dateStr: string) => {
        router.push(`/?date=${dateStr}`);
    };

    const isCurrentMonth = currentMonth === format(new Date(), 'yyyy-MM');
    const localToday = format(new Date(), 'yyyy-MM-dd');

    // Day of week labels (S, M, T, W, T, F, S) - Sunday first
    const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
        <div className="p-4 border-t border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[#141720]">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
                    {format(parseISO(`${currentMonth}-01`), 'MMMM yyyy')}
                </h2>
                <div className="flex gap-1">
                    <button
                        onClick={handlePrevMonth}
                        className="p-2 rounded-lg hover:bg-indigo-500/10 transition-colors text-slate-700 dark:text-slate-300"
                        aria-label="Previous month"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleNextMonth}
                        disabled={isCurrentMonth}
                        className={cn(
                            "p-2 rounded-lg transition-colors",
                            isCurrentMonth ? "text-slate-300 dark:text-slate-700 cursor-not-allowed" : "hover:bg-indigo-500/10 text-slate-700 dark:text-slate-300"
                        )}
                        aria-label="Next month"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Day of week headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
                {dayLabels.map((label, index) => (
                    <div key={index} className="text-center text-xs font-semibold text-slate-500">
                        {label}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
                {days.map((day) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const scoreData = scores.find((s) => s.date === dateStr);
                    const hasData = !!scoreData;
                    const score = scoreData ? scoreData.score : 0;
                    const isPreviousMonth = format(day, 'yyyy-MM') !== currentMonth;
                    const isFutureDay = dateStr > localToday;
                    const dayNumber = getDate(day);
                    const isSelected = currentDate === dateStr;
                    const watering = wateringStatuses?.find((w) => w.date === dateStr);

                    return (
                        <button
                            key={dateStr}
                            onClick={() => handleDayClick(dateStr)}
                            disabled={isFutureDay}
                            className={cn(
                                "relative aspect-square rounded-md transition-all hover:scale-105 cursor-pointer flex items-center justify-center text-sm font-semibold",
                                getScoreColor(score, hasData),
                                getTextColor(score, hasData),
                                isPreviousMonth && "opacity-30",
                                isFutureDay && "opacity-40 cursor-not-allowed hover:scale-100",
                                isSelected && "ring-4 ring-indigo-500 ring-offset-2 dark:ring-offset-[#141720] scale-105"
                            )}
                            title={isFutureDay
                                ? `${format(day, 'MMM d')} (future day)`
                                : !hasData
                                    ? `${format(day, 'MMM d')}: nothing logged`
                                    : `${format(day, 'MMM d')}: ${score > 0 ? '+' : ''}${score} pts`}
                        >
                            {dayNumber}
                            {(watering?.plants || watering?.vegetables) && (
                                <div className="absolute bottom-0.5 left-0 right-0 flex justify-center gap-0.5">
                                    {watering.plants && <span className="text-[12px] leading-none">🪴</span>}
                                    {watering.vegetables && <span className="text-[12px] leading-none">🥬</span>}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <span>🪴 Plants</span>
                    <span>🥬 Vegetables</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <span className="font-medium">Less</span>
                    <div className="flex gap-1.5">
                        <div className="w-4 h-4 rounded-sm bg-red-500 dark:bg-red-600 border border-red-600 dark:border-red-700" title="< -2" />
                        <div className="w-4 h-4 rounded-sm bg-orange-300 dark:bg-orange-800 border border-orange-400 dark:border-orange-700" title="-2 to -1" />
                        <div className="w-4 h-4 rounded-sm bg-indigo-500/20 border border-indigo-500/30" title="Even (0)" />
                        <div className="w-4 h-4 rounded-sm bg-green-300 dark:bg-green-800 border border-green-400 dark:border-green-700" title="1 to 2" />
                        <div className="w-4 h-4 rounded-sm bg-green-500 dark:bg-green-600 border border-green-600 dark:border-green-700" title=">= 3" />
                        <div className="w-4 h-4 rounded-sm bg-slate-100 dark:bg-[#1b1f2e] border border-slate-200 dark:border-white/[0.05]" title="Nothing logged" />
                    </div>
                    <span className="font-medium">More</span>
                </div>
            </div>
        </div>
    );
}
