'use client';

import { useEffect, useState } from 'react';
import { GoalAchievement } from '@/types';
import { Trophy, X } from 'lucide-react';
import { format } from 'date-fns';

interface AchievementToastProps {
    achievement: GoalAchievement;
    onDismiss: () => void;
}

export default function AchievementToast({ achievement, onDismiss }: AchievementToastProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger slide-in animation
        setTimeout(() => setIsVisible(true), 10);

        // Auto-dismiss after 5 seconds
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onDismiss, 300); // Wait for slide-out animation
        }, 5000);

        return () => clearTimeout(timer);
    }, [onDismiss]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onDismiss, 300);
    };

    return (
        <div
            className={`
                fixed bottom-4 right-4 z-50 max-w-sm w-full
                transform transition-all duration-300 ease-out
                ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
            `}
        >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 border-green-500 dark:border-green-600 p-4">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            Goal Achieved!
                        </h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                            {achievement.goalSnapshot.title}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-600 dark:text-gray-400">
                            <span>
                                Progress: {Math.round(achievement.finalProgress)} / {achievement.goalSnapshot.target}
                            </span>
                            <span>
                                {format(new Date(achievement.achievedAt), 'MMM d, yyyy')}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="flex-shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                        <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>
            </div>
        </div>
    );
}
