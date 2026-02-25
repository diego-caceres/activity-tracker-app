'use client';

import { cn } from '@/lib/utils';
import { Activity, ClipboardList, Scale, Target } from 'lucide-react';

interface TodayFocusCardProps {
    pendingTodos: number;
    overdueTodos: number;
    dailyScore: number;
    hasWeightEntry: boolean;
    uptimeUp: number;
    uptimeTotal: number;
}

function focusElement(id: string) {
    const target = document.getElementById(id);
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        target.focus();
    }
}

function goToSection(sectionId: string, focusId?: string) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (focusId) {
        window.setTimeout(() => focusElement(focusId), 220);
    }
}

export default function TodayFocusCard({
    pendingTodos,
    overdueTodos,
    dailyScore,
    hasWeightEntry,
    uptimeUp,
    uptimeTotal,
}: TodayFocusCardProps) {
    const scoreTone = dailyScore > 0 ? 'text-emerald-700 dark:text-emerald-300' : dailyScore < 0 ? 'text-red-700 dark:text-red-300' : 'text-slate-700 dark:text-slate-300';
    const allUp = uptimeTotal > 0 && uptimeUp === uptimeTotal;
    const uptimeTone = uptimeTotal === 0 ? 'text-gray-500 dark:text-gray-400' : allUp ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300';

    return (
        <div id="today-focus-section" className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-b from-white to-emerald-50/30 dark:from-gray-900 dark:to-emerald-950/20">
            <div className="rounded-xl border border-emerald-200/70 dark:border-emerald-900/70 bg-white/95 dark:bg-gray-900/95 shadow-sm p-3">
                <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Today Focus</h2>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2 py-1.5 text-center">
                        <div className="text-gray-500 dark:text-gray-400">Uptime</div>
                        <div className={cn('font-semibold', uptimeTone)}>
                            {uptimeTotal === 0 ? '—' : `${uptimeUp}/${uptimeTotal}`}
                        </div>
                    </div>
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2 py-1.5 text-center">
                        <div className="text-gray-500 dark:text-gray-400">Score</div>
                        <div className={cn('font-semibold', scoreTone)}>
                            {dailyScore > 0 ? '+' : ''}{dailyScore}
                        </div>
                    </div>
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2 py-1.5 text-center">
                        <div className="text-gray-500 dark:text-gray-400">Weight</div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{hasWeightEntry ? 'Logged' : 'Pending'}</div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <button
                        onClick={() => goToSection('todos-section', 'todo-add-input')}
                        className="h-11 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs font-medium flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer"
                    >
                        <ClipboardList className="w-4 h-4" />
                        Todo
                    </button>
                    <button
                        onClick={() => {
                            goToSection('habits-section');
                            window.setTimeout(() => {
                                const healthyButton = document.getElementById('habit-quick-healthy');
                                if (healthyButton instanceof HTMLButtonElement) {
                                    healthyButton.click();
                                }
                            }, 240);
                        }}
                        className="h-11 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs font-medium flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer"
                    >
                        <Activity className="w-4 h-4" />
                        Habit
                    </button>
                    <button
                        onClick={() => goToSection('weight-section', 'weight-input')}
                        className="h-11 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer"
                    >
                        <Scale className="w-4 h-4" />
                        Weight
                    </button>
                </div>
            </div>
        </div>
    );
}
