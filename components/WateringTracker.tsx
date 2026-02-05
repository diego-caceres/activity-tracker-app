'use client';

import { useOptimistic, startTransition } from 'react';
import { WateringStatus } from '@/types';
import { toggleWatering } from '@/app/actions';
import { Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WateringTrackerProps {
    date: string;
    wateringStatus: WateringStatus | null;
}

export default function WateringTracker({ date, wateringStatus }: WateringTrackerProps) {
    const [optimisticStatus, updateOptimisticStatus] = useOptimistic(
        { plants: wateringStatus?.plants ?? false, vegetables: wateringStatus?.vegetables ?? false },
        (state, action: { category: 'plants' | 'vegetables'; value: boolean }) => ({
            ...state,
            [action.category]: action.value,
        })
    );

    const handleToggle = async (category: 'plants' | 'vegetables') => {
        const newValue = !optimisticStatus[category];
        startTransition(() => {
            updateOptimisticStatus({ category, value: newValue });
        });
        await toggleWatering(date, category, newValue);
    };

    return (
        <div className="p-4 space-y-3 border-t bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Droplets className="w-5 h-5 text-blue-500" />
                Watering
            </h2>

            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => handleToggle('plants')}
                    className={cn(
                        "flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all cursor-pointer",
                        optimisticStatus.plants
                            ? "bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 shadow-sm"
                            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    )}
                >
                    <span className="text-lg">🪴</span>
                    Plants
                </button>
                <button
                    onClick={() => handleToggle('vegetables')}
                    className={cn(
                        "flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all cursor-pointer",
                        optimisticStatus.vegetables
                            ? "bg-green-100 dark:bg-green-900/40 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 shadow-sm"
                            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    )}
                >
                    <span className="text-lg">🥬</span>
                    Vegetables
                </button>
            </div>
        </div>
    );
}
