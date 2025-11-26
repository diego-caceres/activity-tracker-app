'use client';

import { useState } from 'react';
import { Todo, DailyNote } from '@/types';
import { addTodo, deleteTodo, toggleTodo, saveNote } from '@/app/actions';
import { Check, Trash2, Plus, Repeat, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DailyLogProps {
    date: string;
    todos: Todo[];
    note: DailyNote | null;
}

export default function DailyLog({ date, todos, note }: DailyLogProps) {
    const [newTodoTitle, setNewTodoTitle] = useState('');
    const [isRecurring, setIsRecurring] = useState(false);
    const [noteContent, setNoteContent] = useState(note?.content || '');
    const [isSavingNote, setIsSavingNote] = useState(false);

    const handleAddTodo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTodoTitle.trim()) return;

        await addTodo(date, newTodoTitle, isRecurring);
        setNewTodoTitle('');
        setIsRecurring(false);
    };

    const handleSaveNote = async () => {
        setIsSavingNote(true);
        await saveNote(date, noteContent);
        setIsSavingNote(false);
    };

    return (
        <div className="p-4 space-y-6">
            {/* Daily Notes Section */}
            <div className="space-y-3">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                    <FileText className="w-5 h-5 text-gray-700" />
                    Daily Notes
                </h2>
                <div className="relative">
                    <textarea
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        onBlur={handleSaveNote}
                        placeholder="Write your thoughts, reflections, or notes for the day..."
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-y"
                    />
                    {isSavingNote && (
                        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                            Saving...
                        </div>
                    )}
                </div>
            </div>

            {/* Todos Section */}
            <div className="space-y-3">
                <h2 className="text-xl font-bold text-gray-900">Todos</h2>

                <form onSubmit={handleAddTodo} className="flex gap-2">
                    <input
                        type="text"
                        value={newTodoTitle}
                        onChange={(e) => setNewTodoTitle(e.target.value)}
                        placeholder="Add a new task..."
                        className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="button"
                        onClick={() => setIsRecurring(!isRecurring)}
                        className={cn(
                            "p-2 rounded-lg border transition-colors",
                            isRecurring ? "bg-blue-100 border-blue-500 text-blue-700" : "bg-gray-50 border-gray-200 text-gray-500"
                        )}
                        title="Recurring daily"
                    >
                        <Repeat className="w-5 h-5" />
                    </button>
                    <button
                        type="submit"
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </form>

                <div className="space-y-2">
                    {todos.length === 0 && (
                        <p className="text-gray-500 text-center py-4">No todos for this day.</p>
                    )}

                    {todos.map((todo) => (
                        <div
                            key={todo.id}
                            className={cn(
                                "flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm transition-all",
                                todo.status === 'done' && "bg-gray-50 opacity-75"
                            )}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <button
                                    onClick={() => toggleTodo(date, todo.id, todo.status === 'done' ? 'pending' : 'done')}
                                    className={cn(
                                        "w-6 h-6 rounded-full border flex items-center justify-center transition-colors flex-shrink-0",
                                        todo.status === 'done'
                                            ? "bg-green-500 border-green-500 text-white"
                                            : "border-gray-300 hover:border-gray-400"
                                    )}
                                >
                                    {todo.status === 'done' && <Check className="w-4 h-4" />}
                                </button>

                                <span
                                    className={cn(
                                        "truncate",
                                        todo.status === 'done' && "line-through text-gray-500"
                                    )}
                                >
                                    {todo.title}
                                </span>

                                {todo.isRecurring && (
                                    <Repeat className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                )}
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
