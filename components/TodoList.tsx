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

    const handleAddTodo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTodoTitle.trim()) return;

        await addTodo(date, newTodoTitle, isRecurring);
        setNewTodoTitle('');
        setIsRecurring(false);
    };

    return (
        <div className="p-4 space-y-3">
            <h2 className="text-xl font-bold text-gray-900">Todos</h2>

            <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
                {todos.length === 0 && (
                    <div className="p-4 text-gray-500 text-center">No todos for this day.</div>
                )}

                {todos.map((todo, index) => (
                    <div key={todo.id}>
                        <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                            <button
                                onClick={() => toggleTodo(date, todo.id, todo.status === 'done' ? 'pending' : 'done')}
                                className={cn(
                                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
                                    todo.status === 'done'
                                        ? "bg-blue-500 border-blue-500"
                                        : "border-gray-300 hover:border-gray-400"
                                )}
                            >
                                {todo.status === 'done' && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                            </button>

                            <span
                                className={cn(
                                    "flex-1 truncate text-gray-900",
                                    todo.status === 'done' && "line-through text-gray-400"
                                )}
                            >
                                {todo.title}
                            </span>

                            {todo.isRecurring && (
                                <Repeat className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            )}

                            <button
                                onClick={() => deleteTodo(date, todo.id)}
                                className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        {index < todos.length - 1 && <div className="border-t border-gray-100 ml-14" />}
                    </div>
                ))}

                {/* Add Todo Input at the bottom */}
                {todos.length > 0 && <div className="border-t border-gray-200" />}
                <form onSubmit={handleAddTodo} className="flex items-center gap-3 px-4 py-3 bg-gray-50">
                    <Plus className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <input
                        type="text"
                        value={newTodoTitle}
                        onChange={(e) => setNewTodoTitle(e.target.value)}
                        placeholder="New Todo"
                        className="flex-1 bg-transparent focus:outline-none text-gray-900 placeholder-gray-400"
                    />
                    <button
                        type="button"
                        onClick={() => setIsRecurring(!isRecurring)}
                        className={cn(
                            "p-1.5 rounded-md transition-colors",
                            isRecurring ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
                        )}
                        title="Recurring daily"
                    >
                        <Repeat className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
