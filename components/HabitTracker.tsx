'use client';

import { useState, useOptimistic, startTransition } from 'react';
import { HabitDefinition, HabitEvent } from '@/types';
import { deleteHabitEvent, addHabitDefinition } from '@/app/actions';
import { Plus, Activity, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PREDEFINED_HABITS } from '@/lib/constants';

interface HabitTrackerProps {
    date: string;
    definitions: HabitDefinition[];
    events: HabitEvent[];
    dailyScore: number;
}

type HabitAction =
    | { type: 'add'; event: HabitEvent; definition: HabitDefinition }
    | { type: 'delete'; id: string };

export default function HabitTracker({ date, definitions, events, dailyScore }: HabitTrackerProps) {
    const [isAdding, setIsAdding] = useState<'healthy' | 'unhealthy' | null>(null);

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
            timestamp: Date.now(),
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
            if (!existingDefinition) {
                updateOptimisticState({ type: 'add', event: newEvent, definition: newDefinition });
            } else {
                // Definition already exists, just add the event
                updateOptimisticState({ type: 'add', event: newEvent, definition: newDefinition });
            }
            updateOptimisticScore(score);
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
        <div className="p-4 space-y-3 border-t bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <Activity className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    Habits
                </h2>
                <div className={cn(
                    "px-3 py-1 rounded-full font-bold text-sm transition-colors",
                    optimisticScore > 0 ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" :
                        optimisticScore < 0 ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                )}>
                    Score: {optimisticScore > 0 ? '+' : ''}{optimisticScore}
                </div>
            </div>

            {/* Logged Habits List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
                {optimisticState.events.length === 0 && (
                    <div className="p-4 text-gray-500 dark:text-gray-400 text-center">No habits logged today.</div>
                )}

                {optimisticState.events.map((event, index) => (
                    <div key={event.id}>
                        <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            {getHabitIcon(event.habitId) && (
                                <span className="text-xl flex-shrink-0">{getHabitIcon(event.habitId)}</span>
                            )}
                            <span className="flex-1 text-gray-900 dark:text-gray-100">{getHabitName(event.habitId)}</span>
                            <span className={cn(
                                "text-sm font-medium flex-shrink-0",
                                getHabitType(event.habitId) === 'healthy' ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                            )}>
                                {event.scoreSnapshot > 0 ? '+' : ''}{event.scoreSnapshot}
                            </span>
                            <button
                                onClick={() => handleDeleteEvent(event.id, event.scoreSnapshot)}
                                className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 p-1 transition-colors cursor-pointer"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        {index < optimisticState.events.length - 1 && <div className="border-t border-gray-100 dark:border-gray-700 ml-14" />}
                    </div>
                ))}

                {/* Add Habit Buttons at the bottom */}
                {optimisticState.events.length > 0 && <div className="border-t border-gray-200 dark:border-gray-700" />}
                <div className="grid grid-cols-2 gap-0">
                    <button
                        onClick={() => setIsAdding(isAdding === 'healthy' ? null : 'healthy')}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors border-r border-gray-200 dark:border-gray-700 cursor-pointer"
                    >
                        <Plus className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">Healthy</span>
                    </button>
                    <button
                        onClick={() => setIsAdding(isAdding === 'unhealthy' ? null : 'unhealthy')}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer"
                    >
                        <Plus className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">Unhealthy</span>
                    </button>
                </div>
            </div>

            {/* Habit Selection Modal */}
            {isAdding && (
                <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                            Select a {isAdding === 'healthy' ? 'Healthy' : 'Unhealthy'} Habit to Log
                        </h3>
                        <button
                            onClick={() => setIsAdding(null)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <Plus className="w-5 h-5 rotate-45" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-1">
                        {PREDEFINED_HABITS.filter(habit => habit.type === isAdding).map((habit) => (
                            <button
                                key={habit.id}
                                onClick={() => handleAddHabit(habit.id, habit.name, habit.type, habit.score, habit.icon)}
                                className={cn(
                                    "p-2 rounded-lg border text-left text-sm transition-colors flex flex-col gap-1 dark:bg-gray-700/50 dark:border-gray-600 cursor-pointer",
                                    habit.type === 'healthy'
                                        ? "hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-200 dark:hover:border-green-800"
                                        : "hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800"
                                )}
                            >
                                <span className="text-lg">{habit.icon}</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">{habit.name}</span>
                                <span className={cn(
                                    "text-xs",
                                    habit.type === 'healthy' ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
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
