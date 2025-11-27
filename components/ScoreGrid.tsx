'use client';

import { useState } from 'react';
import { DailyScore } from '@/types';
import { format, parseISO, startOfMonth, endOfMonth, subDays, eachDayOfInterval, addMonths, subMonths, getDate, startOfWeek } from 'date-fns';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ScoreGridProps {
    scores: DailyScore[];
    initialMonth?: string; // YYYY-MM format
    currentDate?: string; // YYYY-MM-DD format for highlighting
}

export default function ScoreGrid({ scores, initialMonth, currentDate }: ScoreGridProps) {
    const router = useRouter();
    const [currentMonth, setCurrentMonth] = useState(() => {
        return initialMonth || format(new Date(), 'yyyy-MM');
    });

    // Calculate date range: start from Sunday of the week containing the 1st of the month
    const monthStart = startOfMonth(parseISO(`${currentMonth}-01`));
    const monthEnd = endOfMonth(monthStart);
    const rangeStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // 0 = Sunday
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

    const handleDayClick = (dateStr: string) => {
        router.push(`/?date=${dateStr}`);
    };

    const isCurrentMonth = currentMonth === format(new Date(), 'yyyy-MM');

    // Day of week labels (S, M, T, W, T, F, S) - Sunday first
    const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

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
                        const score = scoreData ? scoreData.score : 0;
                        const isPreviousMonth = format(day, 'yyyy-MM') !== currentMonth;
                        const dayNumber = getDate(day);
                        const isSelected = currentDate === dateStr;

                        return (
                            <button
                                key={dateStr}
                                onClick={() => handleDayClick(dateStr)}
                                className={cn(
                                    "aspect-square rounded-md transition-all hover:scale-105 cursor-pointer flex items-center justify-center text-sm font-semibold",
                                    getScoreColor(score),
                                    isPreviousMonth && "opacity-30",
                                    score >= 5 || score <= -5 ? "text-white" : "text-gray-700",
                                    isSelected && "ring-4 ring-blue-500 ring-offset-2 scale-105"
                                )}
                                title={`${format(day, 'MMM d')}: ${score > 0 ? '+' : ''}${score} pts`}
                            >
                                {dayNumber}
                            </button>
                        );
                    })}
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
