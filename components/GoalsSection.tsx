'use client';

import { useState } from 'react';
import { Goal } from '@/types';
import { Plus, Target, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import GoalCard from './GoalCard';
import GoalForm from './GoalForm';
import Link from 'next/link';

interface GoalsSectionProps {
    goals: Goal[];
    goalsProgress: Record<string, number>;
    currentDate: string;
    maxDisplay?: number;
}

export default function GoalsSection({
    goals,
    goalsProgress,
    currentDate,
    maxDisplay = 3
}: GoalsSectionProps) {
    const [showForm, setShowForm] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);

    const displayedGoals = goals.slice(0, maxDisplay);
    const hasMoreGoals = goals.length > maxDisplay;

    if (goals.length === 0 && !showForm) {
        return (
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-300 transition-colors -ml-1 p-1"
                    >
                        <Target className="w-4 h-4 flex-shrink-0" />
                        <span>Goals</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 flex-shrink-0" />}
                    </button>
                </div>
                {isExpanded && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-1">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
                            <Target className="w-8 h-8 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                Set your first goal to track your progress
                            </p>
                            <button
                                onClick={() => setShowForm(true)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Create Goal
                            </button>
                        </div>
                        <Link
                            href="/goals"
                            className="flex items-center justify-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline py-2"
                        >
                            View Goals Page
                            <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                )}
            </div>
        );
    }

    return (
        <>
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-300 transition-colors -ml-1 p-1"
                    >
                        <Target className="w-4 h-4 flex-shrink-0" />
                        <span>Goals</span>
                        {goals.length > 0 && (
                            <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                                ({goals.filter(g => goalsProgress[g.id] >= g.target).length}/{goals.length} achieved)
                            </span>
                        )}
                        {isExpanded ? <ChevronUp className="w-4 h-4 flex-shrink-0 ml-1" /> : <ChevronDown className="w-4 h-4 flex-shrink-0 ml-1" />}
                    </button>
                    {isExpanded && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                            title="Add new goal"
                        >
                            <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                    )}
                </div>

                {isExpanded && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                        <div className="space-y-2">
                            {displayedGoals.map((goal) => (
                                <GoalCard
                                    key={goal.id}
                                    goal={goal}
                                    progress={goalsProgress[goal.id] || 0}
                                    showActions={false}
                                />
                            ))}
                        </div>

                        <Link
                            href="/goals"
                            className="flex items-center justify-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline py-2"
                        >
                            {hasMoreGoals ? `View all ${goals.length} goals` : 'View Goals Page'}
                            <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                )}
            </div>

            {showForm && (
                <GoalForm
                    onClose={() => setShowForm(false)}
                    currentDate={currentDate}
                />
            )}
        </>
    );
}
