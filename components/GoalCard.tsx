'use client';

import { Goal } from '@/types';
import { Target, Trophy, Flame, Repeat, CheckCircle, TrendingUp, Archive, X } from 'lucide-react';
import GoalProgressBar from './GoalProgressBar';
import { archiveGoal, deleteGoal } from '@/app/actions';
import { useState } from 'react';

interface GoalCardProps {
    goal: Goal;
    progress: number;
    showActions?: boolean;
    onSuccess?: () => void;
}

export default function GoalCard({ goal, progress, showActions = false, onSuccess }: GoalCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const getIcon = () => {
        switch (goal.type) {
            case 'daily_score':
                return <Target className="w-4 h-4" />;
            case 'weekly_score':
                return <Trophy className="w-4 h-4" />;
            case 'streak':
                return <Flame className="w-4 h-4 fill-orange-500" />;
            case 'habit_count':
                return <Repeat className="w-4 h-4" />;
            case 'todo_completion':
                return <CheckCircle className="w-4 h-4" />;
            case 'habit_frequency':
                return <TrendingUp className="w-4 h-4" />;
        }
    };

    const getStatusColor = () => {
        const percentage = (progress / goal.target) * 100;
        if (goal.status === 'completed') return 'text-green-600 dark:text-green-400';
        if (percentage >= 67) return 'text-blue-600 dark:text-blue-400';
        if (percentage >= 34) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-gray-600 dark:text-gray-400';
    };

    const handleArchive = async () => {
        await archiveGoal(goal.id);
        onSuccess?.();
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this goal?')) {
            await deleteGoal(goal.id);
            onSuccess?.();
        }
    };

    return (
        <div
            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                    <div className={`mt-0.5 ${getStatusColor()}`}>
                        {getIcon()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {goal.title}
                        </h3>
                        {goal.description && isExpanded && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {goal.description}
                            </p>
                        )}
                    </div>
                </div>

                {showActions && (
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={handleArchive}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                            title="Archive goal"
                        >
                            <Archive className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                            onClick={handleDelete}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                            title="Delete goal"
                        >
                            <X className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                        </button>
                    </div>
                )}
            </div>

            <GoalProgressBar progress={progress} target={goal.target} />

            {isExpanded && (
                <div className="text-xs text-gray-500 dark:text-gray-400 pt-1 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between">
                        <span>Period: {goal.period}</span>
                        <span>
                            {goal.startDate}
                            {goal.endDate && ` - ${goal.endDate}`}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
