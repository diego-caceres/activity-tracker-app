'use client';

import { useEffect, useState } from 'react';
import { UptimeProject, UptimeDailyCheck } from '@/types';
import { Radio, Plus, RefreshCw, CheckCircle, XCircle, Pencil, Trash2, Loader2 } from 'lucide-react';
import { removeUptimeProject, triggerUptimeCheck } from '@/app/actions';
import UptimeProjectForm from '@/components/UptimeProjectForm';
import UptimeHistoryGrid from '@/components/UptimeHistoryGrid';
import Link from 'next/link';
import { format } from 'date-fns';

export default function UptimePage() {
    const [projects, setProjects] = useState<UptimeProject[]>([]);
    const [todayCheck, setTodayCheck] = useState<UptimeDailyCheck | null>(null);
    const [history, setHistory] = useState<UptimeDailyCheck[]>([]);
    const [loading, setLoading] = useState(true);
    const [checking, setChecking] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editProject, setEditProject] = useState<UptimeProject | undefined>();

    const loadData = async () => {
        try {
            const response = await fetch('/api/uptime');
            const data = await response.json();
            setProjects(data.projects || []);
            setTodayCheck(data.todayCheck || null);
            setHistory(data.history || []);
        } catch (error) {
            console.error('Failed to load uptime data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCheckNow = async () => {
        setChecking(true);
        try {
            const today = format(new Date(), 'yyyy-MM-dd');
            await triggerUptimeCheck(today);
            await loadData();
        } catch (error) {
            console.error('Failed to trigger check:', error);
        } finally {
            setChecking(false);
        }
    };

    const handleDelete = async (id: string) => {
        await removeUptimeProject(id);
        await loadData();
    };

    const handleEdit = (project: UptimeProject) => {
        setEditProject(project);
        setShowForm(true);
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditProject(undefined);
    };

    const handleFormSuccess = () => {
        loadData();
    };

    if (loading) {
        return (
            <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
                <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 px-4 py-4">
                    <Link
                        href="/"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-2 block"
                    >
                        &larr; Back to Home
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Radio className="w-6 h-6" />
                        Up Status
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
                <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 px-4 py-4">
                    <div className="flex items-center justify-between mb-2">
                        <Link
                            href="/"
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            &larr; Back to Home
                        </Link>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCheckNow}
                                disabled={checking || projects.length === 0}
                                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm rounded-md transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
                                Check Now
                            </button>
                            <button
                                onClick={() => setShowForm(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Project
                            </button>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Radio className="w-6 h-6" />
                        Up Status
                    </h1>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Projects List */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                            Projects
                            {projects.length > 0 && (
                                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                                    ({projects.length})
                                </span>
                            )}
                        </h2>

                        {projects.length === 0 ? (
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
                                <Radio className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    No projects configured yet. Add your first project to start monitoring.
                                </p>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Project
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {projects.map((project) => {
                                    const result = todayCheck?.results.find(
                                        (r) => r.projectId === project.id
                                    );
                                    const isUp = result?.status === 'up';

                                    return (
                                        <div
                                            key={project.id}
                                            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-2 min-w-0 flex-1">
                                                    {result ? (
                                                        isUp ? (
                                                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                                        ) : (
                                                            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                                        )
                                                    ) : (
                                                        <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0 mt-0.5" />
                                                    )}
                                                    <div className="min-w-0">
                                                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                                            {project.name}
                                                        </h3>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                            {project.url}
                                                        </p>
                                                        {project.description && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                                {project.description}
                                                            </p>
                                                        )}
                                                        {result && (
                                                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                                {result.statusCode && (
                                                                    <span>HTTP {result.statusCode}</span>
                                                                )}
                                                                {result.responseTimeMs && (
                                                                    <span>{result.responseTimeMs}ms</span>
                                                                )}
                                                                {result.error && (
                                                                    <span className="text-red-500">{result.error}</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 ml-2">
                                                    <button
                                                        onClick={() => handleEdit(project)}
                                                        className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                                                        title="Edit project"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(project.id)}
                                                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                                                        title="Delete project"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* 7-Day History */}
                    {projects.length > 0 && (
                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                7-Day History
                            </h2>
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                <UptimeHistoryGrid
                                    projects={projects}
                                    history={history}
                                />
                            </div>
                        </section>
                    )}
                </div>
            </div>

            {showForm && (
                <UptimeProjectForm
                    onClose={handleFormClose}
                    onSuccess={handleFormSuccess}
                    editProject={editProject}
                />
            )}
        </>
    );
}
