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
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr>
                        <th className="text-left py-2 pr-3 text-gray-600 dark:text-gray-400 font-medium">
                            Project
                        </th>
                        {days.map((day) => (
                            <th key={day} className="px-1 py-2 text-center text-gray-600 dark:text-gray-400 font-medium min-w-[40px]">
                                {format(new Date(day + 'T12:00:00'), 'EEE')}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {projects.map((project) => (
                        <tr key={project.id}>
                            <td className="py-1.5 pr-3 text-gray-900 dark:text-gray-100 truncate max-w-[120px]">
                                {project.name}
                            </td>
                            {days.map((day) => {
                                const check = historyMap.get(day);
                                const result = check?.results.find(
                                    (r) => r.projectId === project.id
                                );

                                let bgColor = 'bg-gray-200 dark:bg-gray-700';
                                if (result) {
                                    bgColor =
                                        result.status === 'up'
                                            ? 'bg-green-500 dark:bg-green-600'
                                            : 'bg-red-500 dark:bg-red-600';
                                }

                                return (
                                    <td key={day} className="px-1 py-1.5">
                                        <div
                                            className={`w-6 h-6 rounded mx-auto ${bgColor}`}
                                            title={
                                                result
                                                    ? `${result.status} - ${result.responseTimeMs ? result.responseTimeMs + 'ms' : 'N/A'}`
                                                    : 'No data'
                                            }
                                        />
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
