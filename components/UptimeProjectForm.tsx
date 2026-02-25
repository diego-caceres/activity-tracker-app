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
                className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {editProject ? 'Edit Project' : 'Add Project'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Project Name *
                        </label>
                        <input
                            type="text"
                            id="project-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., My Supabase App"
                            required
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="project-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Health Check URL *
                        </label>
                        <input
                            type="url"
                            id="project-url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://myapp.com/api/health"
                            required
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="project-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description (optional)
                        </label>
                        <textarea
                            id="project-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of this project"
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Saving...' : editProject ? 'Update' : 'Add Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
