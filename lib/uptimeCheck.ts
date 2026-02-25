import { UptimeProject, UptimeCheckResult, UptimeDailyCheck } from '@/types';
import { getUptimeProjects, getUptimeDailyCheck, saveUptimeDailyCheck } from './data';

export async function checkSingleProject(project: UptimeProject): Promise<UptimeCheckResult> {
    const startTime = Date.now();

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(project.url, {
            method: 'GET',
            signal: controller.signal,
            cache: 'no-store',
        });

        clearTimeout(timeout);

        const responseTimeMs = Date.now() - startTime;

        return {
            projectId: project.id,
            status: response.ok ? 'up' : 'down',
            responseTimeMs,
            statusCode: response.status,
            checkedAt: Date.now(),
        };
    } catch (error) {
        return {
            projectId: project.id,
            status: 'down',
            responseTimeMs: null,
            statusCode: null,
            checkedAt: Date.now(),
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

export async function runUptimeChecks(date: string): Promise<UptimeDailyCheck> {
    const projects = await getUptimeProjects();

    const results = await Promise.all(
        projects.map((project) => checkSingleProject(project))
    );

    const check: UptimeDailyCheck = {
        date,
        results,
        checkedAt: Date.now(),
    };

    await saveUptimeDailyCheck(date, check);
    return check;
}

export async function getOrRunUptimeChecks(date: string): Promise<UptimeDailyCheck | null> {
    const existing = await getUptimeDailyCheck(date);
    if (existing) return existing;

    const projects = await getUptimeProjects();
    if (projects.length === 0) return null;

    return await runUptimeChecks(date);
}
