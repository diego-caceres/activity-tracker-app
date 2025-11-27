import { Goal, GoalProgress, GoalAchievement } from '@/types';
import {
    getDailyScore,
    getDailyScores,
    calculateStreak,
    getGoalProgress,
    saveGoalProgress,
    recordAchievement,
    getHabitCountForPeriod,
    getTodoCompletionRate,
    getHealthyHabitCount,
    getActiveGoals,
} from './data';
import { format, parseISO, subDays, startOfWeek, startOfMonth } from 'date-fns';

// Main progress calculation function
export async function calculateGoalProgress(
    goal: Goal,
    date: string
): Promise<GoalProgress> {
    // Check cache first
    const cached = await getGoalProgress(goal.id, date);
    if (cached && Date.now() - cached.checkedAt < 3600000) {
        return cached;
    }

    // Calculate fresh progress
    let progress = 0;

    switch (goal.type) {
        case 'daily_score':
            progress = await getDailyScore(date);
            break;

        case 'weekly_score':
            const weekStart = format(
                subDays(parseISO(date), 6),
                'yyyy-MM-dd'
            );
            const scores = await getDailyScores(weekStart, date);
            progress = scores.reduce((sum, s) => sum + s.score, 0);
            break;

        case 'streak':
            progress = await calculateStreak(date);
            break;

        case 'habit_count':
            if (goal.habitId) {
                // For weekly goals, calculate from start of current week
                const weekStart = format(
                    startOfWeek(parseISO(date), { weekStartsOn: 0 }),
                    'yyyy-MM-dd'
                );
                progress = await getHabitCountForPeriod(
                    goal.habitId,
                    weekStart,
                    date
                );
            }
            break;

        case 'todo_completion':
            progress = await getTodoCompletionRate(
                goal.startDate,
                date
            );
            break;

        case 'habit_frequency':
            progress = await getHealthyHabitCount(
                goal.startDate,
                date
            );
            break;
    }

    const isAchieved = progress >= goal.target;

    const progressData: GoalProgress = {
        goalId: goal.id,
        date,
        progress,
        isAchieved,
        checkedAt: Date.now(),
    };

    // Save to cache
    await saveGoalProgress(progressData);

    // Record achievement if newly achieved
    if (isAchieved && goal.status === 'active') {
        await recordAchievement(goal, date, progress);
    }

    return progressData;
}

// Check all active goals after a data mutation
export async function checkRelevantGoals(
    date: string,
    triggerType: 'habit' | 'todo' | 'score'
): Promise<GoalAchievement[]> {
    const goals = await getActiveGoals();

    // Filter relevant goals based on trigger
    const relevantGoals = goals.filter(goal => {
        if (triggerType === 'habit') {
            return ['daily_score', 'weekly_score', 'habit_count',
                'habit_frequency', 'streak'].includes(goal.type);
        }
        if (triggerType === 'todo') {
            return ['todo_completion'].includes(goal.type);
        }
        return true;
    });

    const achievements: GoalAchievement[] = [];

    for (const goal of relevantGoals) {
        const progress = await calculateGoalProgress(goal, date);
        if (progress.isAchieved && goal.status === 'active') {
            const achievement = await recordAchievement(
                goal,
                date,
                progress.progress
            );
            achievements.push(achievement);
        }
    }

    return achievements;
}
