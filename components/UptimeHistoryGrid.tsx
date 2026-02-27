'use client';

import { UptimeProject, UptimeDailyCheck } from '@/types';
import { format, subDays } from 'date-fns';

interface UptimeHistoryGridProps {
    projects: UptimeProject[];
    history: UptimeDailyCheck[];
}

export default function UptimeHistoryGrid({ projects, history }: UptimeHistoryGridProps) {
    if (projects.length === 0) return null;

    const today = new Date();
    const days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(today, 6 - i);
        return format(date, 'yyyy-MM-dd');
    });

    const historyMap = new Map<string, UptimeDailyCheck>();
    for (const check of history) {
        historyMap.set(check.date, check);
    }

    return (
        <div className="space-y-3">
            {projects.map((project) => (
                <div key={project.id}>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1.5 truncate">
                        {project.name}
                    </p>
                    <div className="grid grid-cols-7 gap-1.5">
                        {days.map((day) => {
                            const check = historyMap.get(day);
                            const result = check?.results.find(
                                (r) => r.projectId === project.id
                            );

                            let bgColor = 'bg-slate-200 dark:bg-[#141720]';
                            if (result) {
                                bgColor = result.status === 'up'
                                    ? 'bg-green-500 dark:bg-green-600'
                                    : 'bg-rose-500 dark:bg-rose-600';
                            }

                            return (
                                <div key={day} className="flex flex-col items-center gap-1">
                                    <div
                                        className={`w-full aspect-square rounded-md ${bgColor}`}
                                        title={
                                            result
                                                ? `${format(new Date(day + 'T12:00:00'), 'EEE MMM d')} — ${result.status}${result.responseTimeMs ? ` (${result.responseTimeMs}ms)` : ''}`
                                                : `${format(new Date(day + 'T12:00:00'), 'EEE MMM d')} — no data`
                                        }
                                    />
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                        {format(new Date(day + 'T12:00:00'), 'EEE')[0]}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
