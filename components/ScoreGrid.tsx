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
            // No activity logged — empty look
            return 'bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800';
        }
        if (score === 0) {
            // Logged but net zero (even)
            return 'bg-slate-300 dark:bg-slate-600 border border-slate-400 dark:border-slate-500';
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
        <div className="p-4 border-t bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {format(parseISO(`${currentMonth}-01`), 'MMMM yyyy')}
                </h2>
                <div className="flex gap-1">
                    <button
                        onClick={handlePrevMonth}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                        aria-label="Previous month"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleNextMonth}
                        disabled={isCurrentMonth}
                        className={cn(
                            "p-2 rounded-lg transition-colors",
                            isCurrentMonth ? "text-gray-300 dark:text-gray-700 cursor-not-allowed" : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
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
                    <div key={index} className="text-center text-xs font-semibold text-gray-500">
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
                                isPreviousMonth && "opacity-30",
                                isFutureDay && "opacity-40 cursor-not-allowed hover:scale-100",
                                score >= 3 || score < -2 ? "text-white" : "text-gray-700 dark:text-gray-300",
                                isSelected && "ring-4 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900 scale-105"
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
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>🪴 Plants</span>
                    <span>🥬 Vegetables</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Less</span>
                    <div className="flex gap-1.5">
                        <div className="w-4 h-4 rounded-sm bg-red-500 dark:bg-red-600 border border-red-600 dark:border-red-700" title="< -2" />
                        <div className="w-4 h-4 rounded-sm bg-orange-300 dark:bg-orange-800 border border-orange-400 dark:border-orange-700" title="-2 to -1" />
                        <div className="w-4 h-4 rounded-sm bg-slate-300 dark:bg-slate-600 border border-slate-400 dark:border-slate-500" title="Even (0)" />
                        <div className="w-4 h-4 rounded-sm bg-green-300 dark:bg-green-800 border border-green-400 dark:border-green-700" title="1 to 2" />
                        <div className="w-4 h-4 rounded-sm bg-green-500 dark:bg-green-600 border border-green-600 dark:border-green-700" title=">= 3" />
                        <div className="w-4 h-4 rounded-sm bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800" title="Nothing logged" />
                    </div>
                    <span className="font-medium">More</span>
                </div>
            </div>
        </div>
    );
}
