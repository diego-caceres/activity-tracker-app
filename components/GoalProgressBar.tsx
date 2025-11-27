'use client';

import { cn } from '@/lib/utils';

interface GoalProgressBarProps {
    progress: number;
    target: number;
    color?: string;
}

export default function GoalProgressBar({ progress, target, color }: GoalProgressBarProps) {
    const percentage = Math.min((progress / target) * 100, 100);

    // Determine color based on progress percentage
    const getColorClass = () => {
        if (color) return color;
        if (percentage >= 100) return 'bg-green-500 dark:bg-green-600';
        if (percentage >= 67) return 'bg-blue-500 dark:bg-blue-600';
        if (percentage >= 34) return 'bg-yellow-500 dark:bg-yellow-600';
        return 'bg-gray-400 dark:bg-gray-600';
    };

    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>{Math.round(progress)} / {target}</span>
                <span>{Math.round(percentage)}%</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                    className={cn(
                        'h-full transition-all duration-500 ease-out',
                        getColorClass()
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
