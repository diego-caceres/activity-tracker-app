'use client';

import { format, addDays, subDays, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
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
        <div className="flex items-center justify-between p-4 bg-white border-b sticky top-0 z-10">
            <button onClick={handlePrev} className="p-2 hover:bg-gray-100 rounded-full">
                <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="flex flex-col items-center">
                <span className="font-bold text-lg">{format(currentDate, 'EEEE, MMM d')}</span>
                <span className="text-xs text-gray-500 cursor-pointer" onClick={handleToday}>
                    {dateParam ? 'Go to Today' : 'Today'}
                </span>
            </div>

            <button onClick={handleNext} className="p-2 hover:bg-gray-100 rounded-full">
                <ChevronRight className="w-6 h-6" />
            </button>
        </div>
    );
}
