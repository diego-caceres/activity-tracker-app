'use client';

import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakCounterProps {
    currentStreak: number;
}

export default function StreakCounter({ currentStreak }: StreakCounterProps) {
    const [prevStreak, setPrevStreak] = useState(currentStreak);

    useEffect(() => {
        if (currentStreak > prevStreak) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FFD700', '#FFA500', '#FF4500'] // Gold, Orange, Red
            });
        }
        setPrevStreak(currentStreak);
    }, [currentStreak, prevStreak]);

    if (currentStreak === 0) return null;

    return (
        <div className={cn(
            "flex items-center justify-center gap-1.5 py-1 text-xs font-medium text-orange-600 dark:text-orange-400 transition-all animate-in fade-in slide-in-from-top-1"
        )}>
            <Flame className="w-3.5 h-3.5 fill-orange-500" />
            <span>{currentStreak} day streak</span>
        </div>
    );
}
