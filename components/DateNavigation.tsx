'use client';

import { format, addDays, subDays, parseISO, isValid } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function DateNavigation() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dateParam = searchParams.get('date');

    const localTodayStr = format(new Date(), 'yyyy-MM-dd');
    const parsedDate = dateParam ? parseISO(dateParam) : parseISO(localTodayStr);
    const currentDate = isValid(parsedDate) ? parsedDate : parseISO(localTodayStr);
    const currentDateStr = format(currentDate, 'yyyy-MM-dd');
    const isAtToday = currentDateStr >= localTodayStr;
    const isToday = currentDateStr === localTodayStr;

    const handlePrev = () => {
        const newDate = subDays(currentDate, 1);
        router.push(`?date=${format(newDate, 'yyyy-MM-dd')}`);
    };

    const handleNext = () => {
        if (isAtToday) return;
        const newDate = addDays(currentDate, 1);
        router.push(`?date=${format(newDate, 'yyyy-MM-dd')}`);
    };

    const handleToday = () => {
        router.push(`/?date=${localTodayStr}`);
    };

    return (
        <div className="flex items-center justify-between flex-1">
            <div className="flex items-center gap-2">
                <button onClick={handlePrev} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                    <ChevronLeft className="w-6 h-6 text-gray-900 dark:text-gray-100" />
                </button>
            </div>

            <div className="flex flex-col items-center">
                <span className="font-bold text-lg text-gray-900 dark:text-gray-100">{format(currentDate, 'EEEE, MMM d')}</span>
                <span className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200" onClick={handleToday}>
                    {isToday ? 'Today' : 'Go to Today'}
                </span>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={handleNext}
                    disabled={isAtToday}
                    className={cn(
                        "p-2 rounded-full transition-colors text-gray-900 dark:text-gray-100",
                        isAtToday
                            ? "text-gray-300 dark:text-gray-700 cursor-not-allowed"
                            : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
                <ThemeToggle />
            </div>
        </div>
    );
}
