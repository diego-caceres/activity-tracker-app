'use client';

import { useState } from 'react';
import { addUptimeProject, updateUptimeProject } from '@/app/actions';
import { UptimeProject } from '@/types';
import { X } from 'lucide-react';

interface UptimeProjectFormProps {
    onClose: () => void;
    onSuccess?: () => void;
    editProject?: UptimeProject;
}

export default function UptimeProjectForm({ onClose, onSuccess, editProject }: UptimeProjectFormProps) {
    const [name, setName] = useState(editProject?.name || '');
    const [url, setUrl] = useState(editProject?.url || '');
    const [description, setDescription] = useState(editProject?.description || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !url) return;

        setIsSubmitting(true);
        try {
            if (editProject) {
                await updateUptimeProject(editProject.id, name, url, description || undefined);
            } else {
                await addUptimeProject(name, url, description || undefined);
            }
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Failed to save project:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-white dark:bg-[#1b1f2e] rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-white/[0.07]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 bg-white dark:bg-[#1b1f2e] border-b border-slate-200 dark:border-white/[0.07] px-4 py-3 flex items-center justify-between rounded-t-2xl">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {editProject ? 'Edit Project' : 'Add Project'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label htmlFor="project-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Project Name *
                        </label>
                        <input
                            type="text"
                            id="project-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., My Supabase App"
                            required
                            className="w-full px-3 py-2 border border-slate-300 dark:border-white/[0.07] rounded-lg bg-white dark:bg-[#141720] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="project-url" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Health Check URL *
                        </label>
                        <input
                            type="url"
                            id="project-url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://myapp.com/api/health"
                            required
                            className="w-full px-3 py-2 border border-slate-300 dark:border-white/[0.07] rounded-lg bg-white dark:bg-[#141720] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="project-description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Description (optional)
                        </label>
                        <textarea
                            id="project-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of this project"
                            rows={2}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-white/[0.07] rounded-lg bg-white dark:bg-[#141720] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-slate-300 dark:border-white/[0.07] rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Saving...' : editProject ? 'Update' : 'Add Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
