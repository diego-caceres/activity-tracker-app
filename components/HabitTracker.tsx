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

type OptimisticHabitState = {
    events: HabitEvent[];
    definitions: HabitDefinition[];
};

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

    const handleAddHabit = async (name: string, type: 'healthy' | 'unhealthy', score: number, icon?: string) => {
        const habitId = crypto.randomUUID();
        const newEvent: HabitEvent = {
            id: crypto.randomUUID(),
            habitId,
            date,
            timestamp: Date.now(),
            scoreSnapshot: score,
        };

        const newDefinition: HabitDefinition = {
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
        });

        await addHabitDefinition(date, name, type, score, icon);
    };

    const handleDeleteEvent = async (eventId: string, score: number) => {
        startTransition(() => {
            updateOptimisticState({ type: 'delete', id: eventId });
            updateOptimisticScore(-score);
        });

        await deleteHabitEvent(date, eventId);
    };

    return (
        <div className="p-4 space-y-3 border-t bg-gray-50/50">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                    <Activity className="w-5 h-5 text-gray-700" />
                    Habits
                </h2>
                <div className={cn(
                    "px-3 py-1 rounded-full font-bold text-sm",
                    optimisticScore > 0 ? "bg-green-100 text-green-700" :
                        optimisticScore < 0 ? "bg-red-100 text-red-700" : "bg-gray-200 text-gray-700"
                )}>
                    Score: {optimisticScore > 0 ? '+' : ''}{optimisticScore}
                </div>
            </div>

            {/* Logged Habits List */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
                {optimisticState.events.length === 0 && (
                    <div className="p-4 text-gray-500 text-center">No habits logged today.</div>
                )}

                {optimisticState.events.map((event, index) => (
                    <div key={event.id}>
                        <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                            {getHabitIcon(event.habitId) && (
                                <span className="text-xl flex-shrink-0">{getHabitIcon(event.habitId)}</span>
                            )}
                            <span className="flex-1 text-gray-900">{getHabitName(event.habitId)}</span>
                            <span className={cn(
                                "text-sm font-medium flex-shrink-0",
                                getHabitType(event.habitId) === 'healthy' ? "text-green-600" : "text-red-600"
                            )}>
                                {event.scoreSnapshot > 0 ? '+' : ''}{event.scoreSnapshot}
                            </span>
                            <button
                                onClick={() => handleDeleteEvent(event.id, event.scoreSnapshot)}
                                className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        {index < optimisticState.events.length - 1 && <div className="border-t border-gray-100 ml-14" />}
                    </div>
                ))}

                {/* Add Habit Buttons at the bottom */}
                {optimisticState.events.length > 0 && <div className="border-t border-gray-200" />}
                <div className="grid grid-cols-2 gap-0">
                    <button
                        onClick={() => setIsAdding(isAdding === 'healthy' ? null : 'healthy')}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-green-50 text-green-600 hover:bg-green-100 transition-colors border-r border-gray-200"
                    >
                        <Plus className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">Healthy</span>
                    </button>
                    <button
                        onClick={() => setIsAdding(isAdding === 'unhealthy' ? null : 'unhealthy')}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                        <Plus className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">Unhealthy</span>
                    </button>
                </div>
            </div>

            {/* Habit Selection Modal */}
            {isAdding && (
                <div className="p-4 bg-white rounded-xl border shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm text-gray-900">
                            Select a {isAdding === 'healthy' ? 'Healthy' : 'Unhealthy'} Habit to Log
                        </h3>
                        <button
                            onClick={() => setIsAdding(null)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <Plus className="w-5 h-5 rotate-45" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-1">
                        {PREDEFINED_HABITS.filter(habit => habit.type === isAdding).map((habit) => (
                            <button
                                key={habit.name}
                                onClick={() => handleAddHabit(habit.name, habit.type, habit.score, habit.icon)}
                                className={cn(
                                    "p-2 rounded-lg border text-left text-sm transition-colors flex flex-col gap-1",
                                    habit.type === 'healthy'
                                        ? "hover:bg-green-50 hover:border-green-200"
                                        : "hover:bg-red-50 hover:border-red-200"
                                )}
                            >
                                <span className="text-lg">{habit.icon}</span>
                                <span className="font-medium text-gray-900">{habit.name}</span>
                                <span className={cn(
                                    "text-xs",
                                    habit.type === 'healthy' ? "text-green-600" : "text-red-600"
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
