'use client';

import { useState, useOptimistic, startTransition } from 'react';
import { HabitDefinition, HabitEvent } from '@/types';
import { HabitLastUsedMap } from '@/lib/data';
import { deleteHabitEvent, addHabitDefinition } from '@/app/actions';
import { Plus, Activity, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PREDEFINED_HABITS } from '@/lib/constants';

interface HabitTrackerProps {
    date: string;
    definitions: HabitDefinition[];
    events: HabitEvent[];
    dailyScore: number;
    habitLastUsed: HabitLastUsedMap;
}

type HabitAction =
    | { type: 'add'; event: HabitEvent; definition: HabitDefinition }
    | { type: 'delete'; id: string };

export default function HabitTracker({ date, definitions, events, dailyScore, habitLastUsed }: HabitTrackerProps) {
    const [isAdding, setIsAdding] = useState<'healthy' | 'unhealthy' | null>(null);

    const [optimisticLastUsed, updateOptimisticLastUsed] = useOptimistic(
        habitLastUsed,
        (state, update: { habitId: string; timestamp: number }) => ({
            ...state,
            [update.habitId]: update.timestamp,
        })
    );

    const [optimisticState, updateOptimisticState] = useOptimistic(
        { events, definitions },
        (state, action: HabitAction) => {
            switch (action.type) {
                case 'add':
                    return {
                        events: [...state.events, action.event],
                        definitions: [...state.definitions, action.definition]
                    };
                case 'delete':
                    return {
                        events: state.events.filter(e => e.id !== action.id),
                        definitions: state.definitions
                    };
                default:
                    return state;
            }
        }
    );

    const [optimisticScore, updateOptimisticScore] = useOptimistic(
        dailyScore,
        (state: number, delta: number) => state + delta
    );

    const sortedHabits = (type: 'healthy' | 'unhealthy') => {
        return PREDEFINED_HABITS
            .filter(habit => habit.type === type)
            .sort((a, b) => (optimisticLastUsed[b.id] || 0) - (optimisticLastUsed[a.id] || 0));
    };

    const getHabitName = (habitId: string) => {
        const definition = optimisticState.definitions.find(d => d.id === habitId);
        return definition?.name || 'Unknown Habit';
    };

    const getHabitIcon = (habitId: string) => {
        const definition = optimisticState.definitions.find(d => d.id === habitId);
        return definition?.icon;
    };

    const getHabitType = (habitId: string) => {
        const definition = optimisticState.definitions.find(d => d.id === habitId);
        return definition?.type;
    };

    const handleAddHabit = async (habitId: string, name: string, type: 'healthy' | 'unhealthy', score: number, icon?: string) => {
        const newEvent: HabitEvent = {
            id: crypto.randomUUID(),
            habitId,
            date,
            timestamp: 0,
            scoreSnapshot: score,
        };

        // Check if definition already exists
        const existingDefinition = optimisticState.definitions.find(d => d.id === habitId);
        const newDefinition: HabitDefinition = existingDefinition || {
            id: habitId,
            name,
            type,
            score,
            icon,
        };

        setIsAdding(null);

        startTransition(() => {
            updateOptimisticState({ type: 'add', event: newEvent, definition: newDefinition });
            updateOptimisticScore(score);
            updateOptimisticLastUsed({ habitId, timestamp: Date.now() });
        });

        await addHabitDefinition(date, habitId, name, type, score, icon);
    };

    const handleDeleteEvent = async (eventId: string, score: number) => {
        startTransition(() => {
            updateOptimisticState({ type: 'delete', id: eventId });
            updateOptimisticScore(-score);
        });

        await deleteHabitEvent(date, eventId);
    };

    return (
        <div id="habits-section" className="p-4 space-y-3 border-t border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[#141720]">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-black flex items-center gap-2 text-slate-900 dark:text-slate-100">
                    <Activity className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                    Habits
                </h2>
                <div className={cn(
                    "px-3 py-1 rounded-full font-bold text-sm transition-colors",
                    optimisticScore > 0 ? "bg-green-500/10 text-green-700 dark:text-green-400" :
                        optimisticScore < 0 ? "bg-rose-500/10 text-rose-700 dark:text-rose-400" : "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400"
                )}>
                    Score: {optimisticScore > 0 ? '+' : ''}{optimisticScore}
                </div>
            </div>

            {/* Logged Habits List */}
            <div className="bg-white dark:bg-[#1b1f2e] rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.07]">
                {optimisticState.events.length === 0 && (
                    <div className="p-4 text-slate-500 dark:text-slate-400 text-center">No habits logged today.</div>
                )}

                {optimisticState.events.map((event, index) => (
                    <div key={event.id}>
                        <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                            {getHabitIcon(event.habitId) && (
                                <span className="text-xl flex-shrink-0">{getHabitIcon(event.habitId)}</span>
                            )}
                            <span className="flex-1 text-slate-900 dark:text-slate-100">{getHabitName(event.habitId)}</span>
                            <span className={cn(
                                "text-sm font-medium flex-shrink-0",
                                getHabitType(event.habitId) === 'healthy' ? "text-green-500 dark:text-green-400" : "text-rose-500 dark:text-rose-400"
                            )}>
                                {event.scoreSnapshot > 0 ? '+' : ''}{event.scoreSnapshot}
                            </span>
                            <button
                                onClick={() => handleDeleteEvent(event.id, event.scoreSnapshot)}
                                className="text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 p-1 transition-colors cursor-pointer"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        {index < optimisticState.events.length - 1 && <div className="border-t border-slate-100 dark:border-white/[0.05] ml-14" />}
                    </div>
                ))}

                {/* Add Habit Buttons at the bottom */}
                {optimisticState.events.length > 0 && <div className="border-t border-slate-200 dark:border-white/[0.07]" />}
                <div className="grid grid-cols-2 gap-0">
                    <button
                        id="habit-quick-healthy"
                        onClick={() => setIsAdding(isAdding === 'healthy' ? null : 'healthy')}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-colors border-r border-slate-200 dark:border-white/[0.07] cursor-pointer"
                    >
                        <Plus className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">Healthy</span>
                    </button>
                    <button
                        onClick={() => setIsAdding(isAdding === 'unhealthy' ? null : 'unhealthy')}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                    >
                        <Plus className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">Unhealthy</span>
                    </button>
                </div>
            </div>

            {/* Habit Selection Modal */}
            {isAdding && (
                <div className="p-4 bg-white dark:bg-[#1b1f2e] rounded-2xl border border-slate-200 dark:border-white/[0.07] space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                            Select a {isAdding === 'healthy' ? 'Healthy' : 'Unhealthy'} Habit to Log
                        </h3>
                        <button
                            onClick={() => setIsAdding(null)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                            <Plus className="w-5 h-5 rotate-45" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-1">
                        {sortedHabits(isAdding).map((habit) => (
                            <button
                                key={habit.id}
                                onClick={() => handleAddHabit(habit.id, habit.name, habit.type, habit.score, habit.icon)}
                                className={cn(
                                    "p-2 rounded-xl border border-slate-200 dark:border-white/[0.07] text-left text-sm transition-colors flex flex-col gap-1 dark:bg-[#141720]/80 cursor-pointer",
                                    habit.type === 'healthy'
                                        ? "hover:bg-green-50 dark:hover:bg-green-500/10 hover:border-green-200 dark:hover:border-green-800/50"
                                        : "hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:border-rose-200 dark:hover:border-rose-800/50"
                                )}
                            >
                                <span className="text-lg">{habit.icon}</span>
                                <span className="font-medium text-slate-900 dark:text-slate-100">{habit.name}</span>
                                <span className={cn(
                                    "text-xs",
                                    habit.type === 'healthy' ? "text-green-500 dark:text-green-400" : "text-rose-500 dark:text-rose-400"
                                )}>
                                    {habit.score > 0 ? '+' : ''}{habit.score} pts
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
