'use client';

import { useState } from 'react';
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

export default function HabitTracker({ date, definitions, events, dailyScore }: HabitTrackerProps) {
    const [isAdding, setIsAdding] = useState(false);

    const getHabitName = (habitId: string) => {
        const definition = definitions.find(d => d.id === habitId);
        return definition?.name || 'Unknown Habit';
    };

    const getHabitIcon = (habitId: string) => {
        const definition = definitions.find(d => d.id === habitId);
        return definition?.icon;
    };

    const getHabitType = (habitId: string) => {
        const definition = definitions.find(d => d.id === habitId);
        return definition?.type;
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
                    dailyScore > 0 ? "bg-green-100 text-green-700" :
                        dailyScore < 0 ? "bg-red-100 text-red-700" : "bg-gray-200 text-gray-700"
                )}>
                    Score: {dailyScore > 0 ? '+' : ''}{dailyScore}
                </div>
            </div>

            {/* Logged Habits List */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
                {events.length === 0 && (
                    <div className="p-4 text-gray-500 text-center">No habits logged today.</div>
                )}

                {events.map((event, index) => (
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
                                onClick={() => deleteHabitEvent(date, event.id)}
                                className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        {index < events.length - 1 && <div className="border-t border-gray-100 ml-14" />}
                    </div>
                ))}

                {/* Add Habit Button at the bottom */}
                {events.length > 0 && <div className="border-t border-gray-200" />}
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 text-blue-500 hover:bg-gray-100 transition-colors"
                >
                    <Plus className="w-5 h-5 flex-shrink-0" />
                    <span className="text-gray-600">Add Habit</span>
                </button>
            </div>

            {/* Habit Selection Modal */}
            {isAdding && (
                <div className="p-4 bg-white rounded-xl border shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm text-gray-900">Select a Habit to Log</h3>
                        <button
                            onClick={() => setIsAdding(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <Plus className="w-5 h-5 rotate-45" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-1">
                        {PREDEFINED_HABITS.map((habit) => (
                            <button
                                key={habit.name}
                                onClick={() => {
                                    addHabitDefinition(date, habit.name, habit.type, habit.score, habit.icon);
                                    setIsAdding(false);
                                }}
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
