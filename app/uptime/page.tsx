'use client';

import { useEffect, useState } from 'react';
import { UptimeProject, UptimeDailyCheck } from '@/types';
import { Radio, Plus, RefreshCw, CheckCircle, XCircle, Pencil, Trash2, ArrowLeft } from 'lucide-react';
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
                        <Radio className="w-6 h-6" />
                        Up Status
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
                <div className="bg-white dark:bg-[#141720] border-b border-slate-200 dark:border-white/[0.07] px-4 py-4">
                    <div className="flex items-center justify-between mb-2">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#1b1f2e] border border-slate-200 dark:border-white/[0.07] text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Link>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCheckNow}
                                disabled={checking || projects.length === 0}
                                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 dark:border-white/[0.07] hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 text-sm rounded-lg transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
                                Check Now
                            </button>
                            <button
                                onClick={() => setShowForm(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Project
                            </button>
                        </div>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Radio className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                        Up Status
                    </h1>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Projects List */}
                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                            Projects
                            {projects.length > 0 && (
                                <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-2">
                                    ({projects.length})
                                </span>
                            )}
                        </h2>

                        {projects.length === 0 ? (
                            <div className="bg-slate-100 dark:bg-[#1b1f2e] rounded-2xl p-6 text-center">
                                <Radio className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-600 dark:text-slate-400 mb-4">
                                    No projects configured yet. Add your first project to start monitoring.
                                </p>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors"
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
                                            className="bg-slate-50 dark:bg-[#1b1f2e] rounded-xl p-3 border border-slate-200 dark:border-white/[0.07]"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-2 min-w-0 flex-1">
                                                    {result ? (
                                                        isUp ? (
                                                            <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                                        ) : (
                                                            <XCircle className="w-5 h-5 text-rose-500 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                                                        )
                                                    ) : (
                                                        <div className="w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-600 flex-shrink-0 mt-0.5" />
                                                    )}
                                                    <div className="min-w-0">
                                                        <h3 className="font-medium text-slate-900 dark:text-slate-100">
                                                            {project.name}
                                                        </h3>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                            {project.url}
                                                        </p>
                                                        {project.description && (
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                                {project.description}
                                                            </p>
                                                        )}
                                                        {result && (
                                                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                                {result.statusCode && (
                                                                    <span>HTTP {result.statusCode}</span>
                                                                )}
                                                                {result.responseTimeMs && (
                                                                    <span>{result.responseTimeMs}ms</span>
                                                                )}
                                                                {result.error && (
                                                                    <span className="text-rose-500">{result.error}</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 ml-2">
                                                    <button
                                                        onClick={() => handleEdit(project)}
                                                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded transition-colors"
                                                        title="Edit project"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(project.id)}
                                                        className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-500/10 rounded transition-colors"
                                                        title="Delete project"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
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
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                                7-Day History
                            </h2>
                            <div className="bg-slate-50 dark:bg-[#1b1f2e] rounded-2xl p-3 border border-slate-200 dark:border-white/[0.07]">
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
