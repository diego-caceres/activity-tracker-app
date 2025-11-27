'use client';

import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { GoalAchievement } from '@/types';
import Link from 'next/link';

interface AchievementBadgeProps {
    achievements: GoalAchievement[];
}

export default function AchievementBadge({ achievements }: AchievementBadgeProps) {
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // Get last viewed timestamp from localStorage
        const lastViewed = localStorage.getItem('lastViewedAchievements');
        const lastViewedTime = lastViewed ? parseInt(lastViewed) : 0;

        // Count achievements after last viewed time
        const newAchievements = achievements.filter(
            (achievement) => achievement.achievedAt > lastViewedTime
        );

        setUnreadCount(newAchievements.length);
    }, [achievements]);

    const handleClick = () => {
        // Update last viewed timestamp
        localStorage.setItem('lastViewedAchievements', Date.now().toString());
        setUnreadCount(0);
    };

    if (achievements.length === 0) return null;

    return (
        <Link
            href="/goals"
            onClick={handleClick}
            className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            title={`${achievements.length} achievement${achievements.length !== 1 ? 's' : ''} - View goals`}
        >
            <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-600 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </Link>
    );
}
