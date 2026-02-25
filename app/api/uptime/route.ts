import { NextResponse, NextRequest } from 'next/server';
import { getUptimeProjects, getUptimeHistory, getUptimeDailyCheck } from '@/lib/data';
import { getOrRunUptimeChecks } from '@/lib/uptimeCheck';
import { format, subDays } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const today = format(new Date(), 'yyyy-MM-dd');
        const weekAgo = format(subDays(new Date(), 6), 'yyyy-MM-dd');

        const [projects, todayCheck, history] = await Promise.all([
            getUptimeProjects(),
            getUptimeDailyCheck(today),
            getUptimeHistory(weekAgo, today),
        ]);

        return NextResponse.json({
            projects,
            todayCheck,
            history,
        });
    } catch (error) {
        console.error('Failed to fetch uptime data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch uptime data' },
            { status: 500 }
        );
    }
}

// POST: run checks for a date, returning cached result if already checked today.
// Used by the main page auto-check (avoids revalidatePath).
export async function POST(request: NextRequest) {
    try {
        const { date } = await request.json();
        if (!date) {
            return NextResponse.json({ error: 'date is required' }, { status: 400 });
        }

        const check = await getOrRunUptimeChecks(date);
        return NextResponse.json({ check });
    } catch (error) {
        console.error('Failed to run uptime check:', error);
        return NextResponse.json(
            { error: 'Failed to run uptime check' },
            { status: 500 }
        );
    }
}
