'use client';

import { useState } from 'react';
import { Todo, DailyNote } from '@/types';
import { addTodo, deleteTodo, toggleTodo, saveNote } from '@/app/actions';
import { Check, Trash2, Plus, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DailyLogProps {
    date: string;
    todos: Todo[];
    note: DailyNote | null;
}

export default function DailyLog({ date, todos, note }: DailyLogProps) {
    const [newTodoTitle, setNewTodoTitle] = useState('');
    const [noteContent, setNoteContent] = useState(note?.content || '');
    const [isSavingNote, setIsSavingNote] = useState(false);

    const handleAddTodo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTodoTitle.trim()) return;

        await addTodo(date, newTodoTitle);
        setNewTodoTitle('');
    };

    const handleSaveNote = async () => {
        setIsSavingNote(true);
        await saveNote(date, noteContent);
        setIsSavingNote(false);
    };

    return (
        <div className="p-4 space-y-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            {/* Daily Notes Section */}
            <div className="space-y-3">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <FileText className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    Daily Notes
                </h2>
                <div className="relative">
                    <textarea
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        onBlur={handleSaveNote}
                        placeholder="How was your day?..."
                        className="w-full h-32 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    />
                    {isSavingNote && (
                        <span className="absolute bottom-3 right-3 text-xs text-gray-400 dark:text-gray-500 animate-pulse">
                            Saving...
                        </span>
                    )}
                </div>
            </div>

            {/* Todos Section */}
            <div className="space-y-3">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Todos</h2>

                <form onSubmit={handleAddTodo} className="flex gap-2">
                    <input
                        type="text"
                        value={newTodoTitle}
                        onChange={(e) => setNewTodoTitle(e.target.value)}
                        placeholder="Add a new task..."
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    />
                    <button
                        type="submit"
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </form>

                <div className="space-y-2">
                    {todos.length === 0 && (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">No todos for this day.</p>
                    )}

                    {todos.map((todo) => (
                        <div
                            key={todo.id}
                            className={cn(
                                "flex items-center justify-between p-3 bg-white dark:bg-gray-800 border rounded-lg shadow-sm transition-all",
                                todo.status === 'done' && "bg-gray-50 dark:bg-gray-700 opacity-75"
                            )}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <button
                                    onClick={() => toggleTodo(date, todo.id, todo.status === 'done' ? 'pending' : 'done')}
                                    className={cn(
                                        "w-6 h-6 rounded-full border flex items-center justify-center transition-colors flex-shrink-0",
                                        todo.status === 'done'
                                            ? "bg-green-500 border-green-500 text-white"
                                            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                                    )}
                                >
                                    {todo.status === 'done' && <Check className="w-4 h-4" />}
                                </button>

                                <span className={cn(
                                    "flex-1 transition-all text-gray-900 dark:text-gray-100",
                                    todo.status === 'done' && "text-gray-400 dark:text-gray-500 line-through"
                                )}>
                                    {todo.title}
                                </span>
                            </div>

                            <button
                                onClick={() => deleteTodo(date, todo.id)}
                                className="text-gray-400 hover:text-red-500 p-1"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
