'use client';

import { useState, useEffect, useRef } from 'react';
import { UptimeProject, UptimeDailyCheck } from '@/types';
import { Radio, ChevronDown, ChevronUp, CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface UptimeStatusCardProps {
    projects: UptimeProject[];
    dailyCheck: UptimeDailyCheck | null;
    currentDate: string;
}

export default function UptimeStatusCard({ projects, dailyCheck, currentDate }: UptimeStatusCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [localCheck, setLocalCheck] = useState(dailyCheck);
    const checkTriggered = useRef(false);

    const today = format(new Date(), 'yyyy-MM-dd');
    const isToday = currentDate === today;

    // Reset ref when date changes
    useEffect(() => {
        checkTriggered.current = false;
        setLocalCheck(dailyCheck);
    }, [currentDate, dailyCheck]);

    // Auto-trigger check once for today if no cached result
    useEffect(() => {
        if (!isToday || localCheck || projects.length === 0 || checkTriggered.current) {
            return;
        }
        checkTriggered.current = true;

        setIsChecking(true);
        fetch('/api/uptime', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date: currentDate }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.check) {
                    setLocalCheck(data.check);
                }
            })
            .catch((err) => console.error('Uptime check failed:', err))
            .finally(() => setIsChecking(false));
    }, [isToday, localCheck, projects.length, currentDate]);

    if (projects.length === 0) return null;

    const upCount = localCheck
        ? localCheck.results.filter((r) => r.status === 'up').length
        : 0;
    const totalCount = projects.length;

    return (
        <div className="px-4 py-3">
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-300 transition-colors -ml-1 p-1"
                    >
                        <Radio className="w-4 h-4 flex-shrink-0" />
                        <span>Up Status</span>
                        {isChecking ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-500" />
                        ) : localCheck ? (
                            <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                                ({upCount}/{totalCount} up)
                            </span>
                        ) : null}
                        {isExpanded ? (
                            <ChevronUp className="w-4 h-4 flex-shrink-0 ml-1" />
                        ) : (
                            <ChevronDown className="w-4 h-4 flex-shrink-0 ml-1" />
                        )}
                    </button>
                </div>

                {isExpanded && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                        {isChecking && !localCheck ? (
                            <div className="flex items-center justify-center py-4 text-sm text-gray-500 dark:text-gray-400">
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Checking projects...
                            </div>
                        ) : localCheck ? (
                            <div className="space-y-1.5">
                                {projects.map((project) => {
                                    const result = localCheck.results.find(
                                        (r) => r.projectId === project.id
                                    );
                                    const isUp = result?.status === 'up';

                                    return (
                                        <div
                                            key={project.id}
                                            className="flex items-center justify-between py-1.5 px-2 bg-gray-50 dark:bg-gray-800 rounded"
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                {isUp ? (
                                                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                                ) : (
                                                    <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                                                )}
                                                <span className="text-sm text-gray-900 dark:text-gray-100 truncate">
                                                    {project.name}
                                                </span>
                                            </div>
                                            {result?.responseTimeMs && (
                                                <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                                                    {result.responseTimeMs}ms
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                                No check data for this date
                            </div>
                        )}

                        <Link
                            href="/uptime"
                            className="flex items-center justify-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline py-2"
                        >
                            View Uptime Page
                            <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
