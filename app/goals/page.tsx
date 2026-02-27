'use client';

import { useEffect, useState } from 'react';
import GoalCard from '@/components/GoalCard';
import GoalForm from '@/components/GoalForm';
import { Plus, Trophy, Target, ArrowLeft } from 'lucide-react';
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
            <div className="flex flex-col h-screen bg-white dark:bg-[#141720]">
                <div className="bg-white dark:bg-[#141720] border-b border-slate-200 dark:border-white/[0.07] px-4 py-4">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#1b1f2e] border border-slate-200 dark:border-white/[0.07] text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-white/10 transition-colors mb-3"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Target className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                        Goals & Achievements
                    </h1>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-slate-500 dark:text-slate-400">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col h-screen bg-white dark:bg-[#141720]">
                {/* Header */}
                <div className="bg-white dark:bg-[#141720] border-b border-slate-200 dark:border-white/[0.07] px-4 py-4">
                    <div className="flex items-center justify-between mb-3">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#1b1f2e] border border-slate-200 dark:border-white/[0.07] text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Link>
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            New Goal
                        </button>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Target className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                        Goals & Achievements
                    </h1>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Active Goals Section */}
                    <section>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <Target className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                                Active Goals
                                <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                                    ({activeGoals.filter(g => goalsProgress[g.id] >= g.target).length}/{activeGoals.length} achieved)
                                </span>
                            </h2>
                        </div>

                        {activeGoals.length === 0 ? (
                            <div className="bg-slate-100 dark:bg-[#1b1f2e] rounded-2xl p-6 text-center border border-slate-200 dark:border-white/[0.07]">
                                <Target className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-600 dark:text-slate-400 mb-4">
                                    No active goals yet. Create your first goal to get started!
                                </p>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
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
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-3">
                                <Trophy className="w-5 h-5 text-green-500 dark:text-green-400" />
                                Completed Goals
                                <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
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
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-3">
                                <Trophy className="w-5 h-5 text-warning" />
                                Achievement History
                                <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                                    ({achievements.length})
                                </span>
                            </h2>
                            <div className="space-y-2">
                                {achievements.map((achievement) => (
                                    <div
                                        key={achievement.id}
                                        className="bg-green-500/5 dark:bg-green-500/5 rounded-2xl p-4 border border-green-500/20"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                                <Trophy className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-slate-900 dark:text-slate-100">
                                                    {achievement.goalSnapshot.title}
                                                </h3>
                                                {achievement.goalSnapshot.description && (
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                        {achievement.goalSnapshot.description}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
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
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-3">
                                <Trophy className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                                Achievement History
                            </h2>
                            <div className="bg-slate-100 dark:bg-[#1b1f2e] rounded-2xl p-6 text-center border border-slate-200 dark:border-white/[0.07]">
                                <Trophy className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-600 dark:text-slate-400">
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
