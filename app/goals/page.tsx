'use client';

import { useEffect, useState } from 'react';
import GoalCard from '@/components/GoalCard';
import GoalForm from '@/components/GoalForm';
import { Plus, Trophy, Target } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Goal, GoalAchievement } from '@/types';

export default function GoalsPage() {
    const [showForm, setShowForm] = useState(false);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [achievements, setAchievements] = useState<GoalAchievement[]>([]);
    const [goalsProgress, setGoalsProgress] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    const currentDate = format(new Date(), 'yyyy-MM-dd');

    const loadData = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/goals');
            const data = await response.json();
            setGoals(data.goals || []);
            setAchievements(data.achievements || []);
            setGoalsProgress(data.goalsProgress || {});
        } catch (error) {
            console.error('Failed to load goals:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Separate goals by status
    const activeGoals = goals.filter(g => g.status === 'active');
    const completedGoals = goals.filter(g => g.status === 'completed');

    if (loading) {
        return (
            <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
                <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 px-4 py-4">
                    <Link
                        href="/"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-2 block"
                    >
                        ← Back to Home
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Target className="w-6 h-6" />
                        Goals & Achievements
                    </h1>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
                {/* Header */}
                <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 px-4 py-4">
                    <div className="flex items-center justify-between mb-2">
                        <Link
                            href="/"
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            ← Back to Home
                        </Link>
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            New Goal
                        </button>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Target className="w-6 h-6" />
                        Goals & Achievements
                    </h1>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Active Goals Section */}
                    <section>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <Target className="w-5 h-5" />
                                Active Goals
                                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                    ({activeGoals.filter(g => goalsProgress[g.id] >= g.target).length}/{activeGoals.length} achieved)
                                </span>
                            </h2>
                        </div>

                        {activeGoals.length === 0 ? (
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
                                <Target className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    No active goals yet. Create your first goal to get started!
                                </p>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Create Goal
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {activeGoals.map((goal) => (
                                    <GoalCard
                                        key={goal.id}
                                        goal={goal}
                                        progress={goalsProgress[goal.id] || 0}
                                        showActions={true}
                                        onSuccess={loadData}
                                    />
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Completed Goals Section */}
                    {completedGoals.length > 0 && (
                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-3">
                                <Trophy className="w-5 h-5 text-green-600 dark:text-green-400" />
                                Completed Goals
                                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                    ({completedGoals.length})
                                </span>
                            </h2>
                            <div className="space-y-2">
                                {completedGoals.map((goal) => (
                                    <GoalCard
                                        key={goal.id}
                                        goal={goal}
                                        progress={goalsProgress[goal.id] || 0}
                                        showActions={true}
                                        onSuccess={loadData}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Achievements Section */}
                    {achievements.length > 0 && (
                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-3">
                                <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                Achievement History
                                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                    ({achievements.length})
                                </span>
                            </h2>
                            <div className="space-y-2">
                                {achievements.map((achievement) => (
                                    <div
                                        key={achievement.id}
                                        className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-10 h-10 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center">
                                                <Trophy className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                                    {achievement.goalSnapshot.title}
                                                </h3>
                                                {achievement.goalSnapshot.description && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                        {achievement.goalSnapshot.description}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-600 dark:text-gray-400">
                                                    <span>
                                                        Final: {Math.round(achievement.finalProgress)} / {achievement.goalSnapshot.target}
                                                    </span>
                                                    <span>
                                                        {format(new Date(achievement.achievedAt), 'MMM d, yyyy')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Empty State for Achievements */}
                    {achievements.length === 0 && activeGoals.length > 0 && (
                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-3">
                                <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                Achievement History
                            </h2>
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
                                <Trophy className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-600 dark:text-gray-400">
                                    No achievements yet. Complete a goal to earn your first achievement!
                                </p>
                            </div>
                        </section>
                    )}
                </div>
            </div>

            {showForm && (
                <GoalForm
                    onClose={() => setShowForm(false)}
                    onSuccess={loadData}
                    currentDate={currentDate}
                />
            )}
        </>
    );
}
