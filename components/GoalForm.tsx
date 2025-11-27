'use client';

import { useState } from 'react';
import { createGoal } from '@/app/actions';
import { GoalType, GoalPeriod } from '@/types';
import { X, Target, Trophy, Flame, Repeat, CheckCircle, TrendingUp } from 'lucide-react';
import { PREDEFINED_HABITS } from '@/lib/constants';

interface GoalFormProps {
    onClose: () => void;
    onSuccess?: () => void;
    currentDate: string;
}

export default function GoalForm({ onClose, onSuccess, currentDate }: GoalFormProps) {
    const [goalType, setGoalType] = useState<GoalType>('habit_frequency');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [target, setTarget] = useState<number>(10);
    const [period, setPeriod] = useState<GoalPeriod>('weekly');
    const [habitId, setHabitId] = useState('');
    const [startDate, setStartDate] = useState(currentDate);
    const [endDate, setEndDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Update period to weekly when habit_count is selected
    const handleGoalTypeChange = (newType: GoalType) => {
        setGoalType(newType);
        if (newType === 'habit_count') {
            setPeriod('weekly');
        }
    };

    const goalTypes: { value: GoalType; label: string; icon: React.ReactNode; description: string }[] = [
        {
            value: 'daily_score',
            label: 'Daily Score',
            icon: <Target className="w-5 h-5" />,
            description: 'Reach a target score each day'
        },
        {
            value: 'weekly_score',
            label: 'Weekly Score',
            icon: <Trophy className="w-5 h-5" />,
            description: 'Accumulate total score over a week'
        },
        {
            value: 'streak',
            label: 'Streak',
            icon: <Flame className="w-5 h-5 fill-orange-500" />,
            description: 'Maintain consecutive positive days'
        },
        {
            value: 'habit_count',
            label: 'Specific Habit',
            icon: <Repeat className="w-5 h-5" />,
            description: 'Log a specific habit X times'
        },
        {
            value: 'todo_completion',
            label: 'Todo Completion',
            icon: <CheckCircle className="w-5 h-5" />,
            description: 'Complete X% of your todos'
        },
        {
            value: 'habit_frequency',
            label: 'Healthy Habits',
            icon: <TrendingUp className="w-5 h-5" />,
            description: 'Log any healthy habits X times'
        },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || target <= 0) return;

        setIsSubmitting(true);
        try {
            await createGoal(
                goalType,
                title,
                target,
                period,
                startDate,
                endDate || undefined,
                habitId || undefined,
                description || undefined
            );
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Failed to create goal:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Create New Goal</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Goal Type Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Goal Type
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {goalTypes.map((type) => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => handleGoalTypeChange(type.value)}
                                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                                        goalType === type.value
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className={goalType === type.value ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}>
                                            {type.icon}
                                        </div>
                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {type.label}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">{type.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Goal Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Log 10 healthy habits this week"
                            required
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description (optional)
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Additional details about your goal"
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Target */}
                    <div>
                        <label htmlFor="target" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Target *
                        </label>
                        <input
                            type="number"
                            id="target"
                            value={target}
                            onChange={(e) => setTarget(parseInt(e.target.value) || 0)}
                            min="1"
                            required
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Period */}
                    {goalType !== 'habit_count' && (
                        <div>
                            <label htmlFor="period" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Period
                            </label>
                            <select
                                id="period"
                                value={period}
                                onChange={(e) => setPeriod(e.target.value as GoalPeriod)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="custom">Custom</option>
                            </select>
                        </div>
                    )}
                    {goalType === 'habit_count' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Period
                            </label>
                            <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                                Weekly (fixed)
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Specific habit goals are tracked weekly
                            </p>
                        </div>
                    )}

                    {/* Habit Selector (only for habit_count type) */}
                    {goalType === 'habit_count' && (
                        <div>
                            <label htmlFor="habitId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Select Habit *
                            </label>
                            <select
                                id="habitId"
                                value={habitId}
                                onChange={(e) => setHabitId(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Choose a habit...</option>
                                {PREDEFINED_HABITS.map((habit) => (
                                    <option key={habit.id} value={habit.id}>
                                        {habit.icon} {habit.name} ({habit.type})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Date Range - only show for custom period or non-weekly goals */}
                    {(period === 'custom' || goalType === 'streak') && (
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Start Date *
                                </label>
                                <input
                                    type="date"
                                    id="startDate"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    End Date (optional)
                                </label>
                                <input
                                    type="date"
                                    id="endDate"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    min={startDate}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    )}

                    {/* Info for recurring goals */}
                    {period !== 'custom' && goalType !== 'streak' && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                                <strong>ℹ️ Ongoing Goal:</strong> This goal will track your progress for the current {period === 'daily' ? 'day' : period === 'weekly' ? 'week' : 'month'} automatically.
                            </p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Creating...' : 'Create Goal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
