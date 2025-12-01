'use client';

import { useEffect, useRef, useState } from 'react';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakCounterProps {
    currentStreak: number;
}

export default function StreakCounter({ currentStreak }: StreakCounterProps) {
    const [isVisible, setIsVisible] = useState(true);
    const lastScrollY = useRef(0);

    useEffect(() => {
        // Find the scrollable container - it's the parent's sibling or the next element
        const scrollContainer = document.querySelector('.overflow-y-auto');

        if (!scrollContainer) return;

        const handleScroll = () => {
            const currentScrollY = scrollContainer.scrollTop;

            // Hide when scrolling down, show when scrolling up or at top
            if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }

            lastScrollY.current = currentScrollY;
        };

        scrollContainer.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            scrollContainer.removeEventListener('scroll', handleScroll);
        };
    }, []);

    if (currentStreak === 0) return null;

    return (
        <div className={cn(
            "flex items-center justify-center gap-1.5 text-xs font-medium text-orange-600 dark:text-orange-400 transition-all duration-300 overflow-hidden",
            isVisible ? "opacity-100 h-6 py-1" : "opacity-0 h-0 py-0"
        )}>
            <Flame className="w-3.5 h-3.5 fill-orange-500" />
            <span>{currentStreak} day streak</span>
        </div>
    );
}
