'use client';

import { useState } from 'react';
import { HabitDefinition, HabitEvent } from '@/types';
import { logHabit, addHabitDefinition } from '@/app/actions';
import { Plus, Activity, Zap, ThumbsUp, ThumbsDown } from 'lucide-react';
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
    const [newHabitName, setNewHabitName] = useState('');
    const [newHabitType, setNewHabitType] = useState<'healthy' | 'unhealthy'>('healthy');
    const [newHabitScore, setNewHabitScore] = useState(1);

    const handleAddDefinition = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newHabitName.trim()) return;

        // Adjust score sign based on type
        const score = newHabitType === 'healthy' ? Math.abs(newHabitScore) : -Math.abs(newHabitScore);

        await addHabitDefinition(newHabitName, newHabitType, score);
        setNewHabitName('');
        setIsAdding(false);
    };

    const getEventCount = (habitId: string) => {
        return events.filter(e => e.habitId === habitId).length;
    };

    return (
        <div className="p-4 space-y-4 border-t bg-gray-50/50">
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

            <div className="grid grid-cols-2 gap-3">
                {definitions.map((habit) => (
                    <button
                        key={habit.id}
                        onClick={() => logHabit(date, habit.id, habit.score)}
                        className={cn(
                            "p-3 rounded-xl border shadow-sm flex flex-col items-center justify-center gap-2 transition-all active:scale-95",
                            habit.type === 'healthy'
                                ? "bg-white border-green-200 hover:border-green-400 hover:bg-green-50"
                                : "bg-white border-red-200 hover:border-red-400 hover:bg-red-50"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            {habit.type === 'healthy' ? <ThumbsUp className="w-4 h-4 text-green-500" /> : <ThumbsDown className="w-4 h-4 text-red-500" />}
                            <span className="font-medium text-sm">{habit.name}</span>
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                            {habit.score > 0 ? '+' : ''}{habit.score} pts • {getEventCount(habit.id)} today
                        </div>
                    </button>
                ))}

                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="p-3 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
                >
                    <Plus className="w-6 h-6" />
                    <span className="text-xs">Add Habit</span>
                </button>
            </div>

            {isAdding && (
                <div className="p-4 bg-white rounded-xl border shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm">Select a Habit to Track</h3>
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
                                    addHabitDefinition(habit.name, habit.type, habit.score);
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
                                <span className="font-medium">{habit.name}</span>
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
