'use client';

import { format } from 'date-fns';
import { Activity, Home, Scale, SquareCheckBig } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

function scrollTo(sectionId: string, focusId?: string) {
    const container = document.querySelector('.overflow-y-auto');
    const section = document.getElementById(sectionId);
    if (!section) return;

    if (container instanceof HTMLElement) {
        const containerRect = container.getBoundingClientRect();
        const sectionRect = section.getBoundingClientRect();
        const top = container.scrollTop + (sectionRect.top - containerRect.top) - 8;
        container.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    } else {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (!focusId) return;

    window.setTimeout(() => {
        const target = document.getElementById(focusId);
        if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
            target.focus();
        }
    }, 220);
}

export default function MobileQuickBar() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const goToToday = () => {
        const localToday = format(new Date(), 'yyyy-MM-dd');
        const currentDate = searchParams.get('date');

        if (currentDate === localToday) {
            scrollTo('today-focus-section');
            return;
        }

        router.push(`/?date=${localToday}`);

        // Wait for route update and then force focus card into view.
        window.setTimeout(() => scrollTo('today-focus-section'), 220);
        window.setTimeout(() => scrollTo('today-focus-section'), 640);
    };

    return (
        <div className="border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm px-2 py-2">
            <div className="grid grid-cols-4 gap-2">
                <button
                    onClick={goToToday}
                    className="h-11 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-800 dark:text-gray-200 flex flex-col items-center justify-center active:scale-[0.98] cursor-pointer"
                >
                    <Home className="w-4 h-4 mb-0.5" />
                    Today
                </button>
                <button
                    onClick={() => scrollTo('todos-section', 'todo-add-input')}
                    className="h-11 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-800 dark:text-gray-200 flex flex-col items-center justify-center active:scale-[0.98] cursor-pointer"
                >
                    <SquareCheckBig className="w-4 h-4 mb-0.5" />
                    Todos
                </button>
                <button
                    onClick={() => {
                        scrollTo('habits-section');
                        window.setTimeout(() => {
                            const healthyButton = document.getElementById('habit-quick-healthy');
                            if (healthyButton instanceof HTMLButtonElement) {
                                healthyButton.click();
                            }
                        }, 250);
                    }}
                    className="h-11 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-800 dark:text-gray-200 flex flex-col items-center justify-center active:scale-[0.98] cursor-pointer"
                >
                    <Activity className="w-4 h-4 mb-0.5" />
                    Habit
                </button>
                <button
                    onClick={() => scrollTo('weight-section', 'weight-input')}
                    className="h-11 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex flex-col items-center justify-center active:scale-[0.98] cursor-pointer"
                >
                    <Scale className="w-4 h-4 mb-0.5" />
                    Weight
                </button>
            </div>
        </div>
    );
}
