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
    const scoreTone = dailyScore > 0 ? 'text-green-500 dark:text-green-400' : dailyScore < 0 ? 'text-rose-500 dark:text-rose-400' : 'text-slate-600 dark:text-slate-300';
    const allUp = uptimeTotal > 0 && uptimeUp === uptimeTotal;
    const uptimeTone = uptimeTotal === 0 ? 'text-slate-500 dark:text-slate-400' : allUp ? 'text-green-500 dark:text-green-400' : 'text-rose-500 dark:text-rose-400';

    return (
        <div id="today-focus-section" className="p-4 border-b border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[#141720]">
            <div className="rounded-2xl border border-slate-200/70 dark:border-white/[0.07] bg-white dark:bg-[#141720] p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Today Focus</h2>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="rounded-xl bg-slate-100 dark:bg-[#1b1f2e] px-2 py-3 flex flex-col items-center gap-1">
                        <div className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 dark:text-slate-400">Uptime</div>
                        <div className={cn('text-3xl font-black tabular-nums leading-none', uptimeTone)}>
                            {uptimeTotal === 0 ? '—' : `${uptimeUp}/${uptimeTotal}`}
                        </div>
                    </div>
                    <div className="rounded-xl bg-slate-100 dark:bg-[#1b1f2e] px-2 py-3 flex flex-col items-center gap-1">
                        <div className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 dark:text-slate-400">Score</div>
                        <div className={cn('text-3xl font-black tabular-nums leading-none', scoreTone)}>
                            {dailyScore > 0 ? '+' : ''}{dailyScore}
                        </div>
                    </div>
                    <div className="rounded-xl bg-slate-100 dark:bg-[#1b1f2e] px-2 py-3 flex flex-col items-center gap-1">
                        <div className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 dark:text-slate-400">Weight</div>
                        <div className="text-base font-black leading-none text-slate-900 dark:text-slate-100">{hasWeightEntry ? 'Logged' : 'Pending'}</div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <button
                        onClick={() => goToSection('todos-section', 'todo-add-input')}
                        className="h-11 rounded-2xl bg-slate-100 dark:bg-[#1b1f2e] text-slate-900 dark:text-slate-100 text-xs font-medium flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
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
                        className="h-11 rounded-2xl bg-slate-100 dark:bg-[#1b1f2e] text-slate-900 dark:text-slate-100 text-xs font-medium flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                    >
                        <Activity className="w-4 h-4" />
                        Habit
                    </button>
                    <button
                        onClick={() => goToSection('weight-section', 'weight-input')}
                        className="h-11 rounded-2xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
                    >
                        <Scale className="w-4 h-4" />
                        Weight
                    </button>
                </div>
            </div>
        </div>
    );
}
