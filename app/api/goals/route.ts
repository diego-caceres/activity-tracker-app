import { NextResponse } from 'next/server';
import { getActiveGoals, getAchievements } from '@/lib/data';
import { calculateGoalProgress } from '@/lib/goalCalculations';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const currentDate = format(new Date(), 'yyyy-MM-dd');

        // Fetch goals and achievements in parallel
        const [goals, achievements] = await Promise.all([
            getActiveGoals(),
            getAchievements(),
        ]);

        // Calculate progress for all active goals
        const goalsProgress: Record<string, number> = {};
        for (const goal of goals) {
            const progress = await calculateGoalProgress(goal, currentDate);
            goalsProgress[goal.id] = progress.progress;
        }

        return NextResponse.json({
            goals,
            achievements,
            goalsProgress,
        });
    } catch (error) {
        console.error('Failed to fetch goals:', error);
        return NextResponse.json(
            { error: 'Failed to fetch goals' },
            { status: 500 }
        );
    }
}
