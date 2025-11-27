'use client';

import { format, addDays, subDays, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function DateNavigation() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dateParam = searchParams.get('date');

    const currentDate = dateParam ? parseISO(dateParam) : new Date();

    const handlePrev = () => {
        const newDate = subDays(currentDate, 1);
        router.push(`?date=${format(newDate, 'yyyy-MM-dd')}`);
    };

    const handleNext = () => {
        const newDate = addDays(currentDate, 1);
        router.push(`?date=${format(newDate, 'yyyy-MM-dd')}`);
    };

    const handleToday = () => {
        router.push('/');
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
                    {dateParam ? 'Go to Today' : 'Today'}
                </span>
            </div>

            <div className="flex items-center gap-2">
                <button onClick={handleNext} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                    <ChevronRight className="w-6 h-6 text-gray-900 dark:text-gray-100" />
                </button>
                <ThemeToggle />
            </div>
        </div>
    );
}
