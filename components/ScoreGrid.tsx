'use client';

import { useState } from 'react';
import { DailyScore } from '@/types';
import { format, parseISO, startOfMonth, endOfMonth, subDays, eachDayOfInterval, addMonths, subMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ScoreGridProps {
    scores: DailyScore[];
    initialMonth?: string; // YYYY-MM format
}

export default function ScoreGrid({ scores, initialMonth }: ScoreGridProps) {
    const [currentMonth, setCurrentMonth] = useState(() => {
        return initialMonth || format(new Date(), 'yyyy-MM');
    });

    // Calculate date range: last 4 days of previous month + current month
    const monthStart = startOfMonth(parseISO(`${currentMonth}-01`));
    const monthEnd = endOfMonth(monthStart);
    const rangeStart = subDays(monthStart, 4);
    const days = eachDayOfInterval({ start: rangeStart, end: monthEnd });

    const getScoreColor = (score: number) => {
        if (score === 0) return 'bg-gray-200 border border-gray-300';
        if (score > 0) {
            if (score >= 10) return 'bg-green-600 border border-green-700';
            if (score >= 5) return 'bg-green-500 border border-green-600';
            return 'bg-green-300 border border-green-400';
        } else {
            if (score <= -10) return 'bg-red-600 border border-red-700';
            if (score <= -5) return 'bg-red-500 border border-red-600';
            return 'bg-red-300 border border-red-400';
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

    const isCurrentMonth = currentMonth === format(new Date(), 'yyyy-MM');

    return (
        <div className="p-4 border-t bg-white">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                    {format(parseISO(`${currentMonth}-01`), 'MMMM yyyy')}
                </h2>
                <div className="flex gap-1">
                    <button
                        onClick={handlePrevMonth}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                        aria-label="Previous month"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleNextMonth}
                        disabled={isCurrentMonth}
                        className={cn(
                            "p-2 rounded-lg transition-colors",
                            isCurrentMonth ? "text-gray-300 cursor-not-allowed" : "hover:bg-gray-100 text-gray-700"
                        )}
                        aria-label="Next month"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="w-full">
                <div className="grid grid-rows-7 grid-flow-col gap-2 w-full">
                    {days.map((day) => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const scoreData = scores.find((s) => s.date === dateStr);
                        const score = scoreData ? scoreData.score : 0;
                        const isPreviousMonth = format(day, 'yyyy-MM') !== currentMonth;

                        return (
                            <div
                                key={dateStr}
                                className={cn(
                                    "w-full aspect-square rounded-md transition-all hover:scale-105 cursor-pointer",
                                    getScoreColor(score),
                                    isPreviousMonth && "opacity-30"
                                )}
                                title={`${format(day, 'MMM d')}: ${score > 0 ? '+' : ''}${score} pts`}
                            />
                        );
                    })}
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 text-sm text-gray-600 mt-4">
                <span className="font-medium">Less</span>
                <div className="flex gap-1.5">
                    <div className="w-4 h-4 rounded-sm bg-red-500 border border-red-600" />
                    <div className="w-4 h-4 rounded-sm bg-gray-200 border border-gray-300" />
                    <div className="w-4 h-4 rounded-sm bg-green-500 border border-green-600" />
                </div>
                <span className="font-medium">More</span>
            </div>
        </div>
    );
}
