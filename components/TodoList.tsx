'use client';

import { useState } from 'react';
import { Todo } from '@/types';
import { addTodo, deleteTodo, toggleTodo } from '@/app/actions';
import { Check, Trash2, Plus, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TodoListProps {
    date: string;
    todos: Todo[];
}

export default function TodoList({ date, todos }: TodoListProps) {
    const [newTodoTitle, setNewTodoTitle] = useState('');
    const [isRecurring, setIsRecurring] = useState(false);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTodoTitle.trim()) return;

        await addTodo(date, newTodoTitle, isRecurring);
        setNewTodoTitle('');
        setIsRecurring(false);
    };

    return (
        <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold mb-2">Todos</h2>

            <form onSubmit={handleAdd} className="flex gap-2 mb-4">
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
                    <p className="text-gray-400 text-center py-4">No todos for this day.</p>
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
    );
}
