'use client';

import { useState, useOptimistic, startTransition } from 'react';
import { Todo } from '@/types';
import { addTodo, deleteTodo, toggleTodo } from '@/app/actions';
import { Check, Trash2, Plus, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TodoListProps {
    date: string;
    todos: Todo[];
}

type TodoAction =
    | { type: 'add'; todo: Todo }
    | { type: 'delete'; id: string }
    | { type: 'toggle'; id: string; status: 'pending' | 'done' };

export default function TodoList({ date, todos }: TodoListProps) {
    const [newTodoTitle, setNewTodoTitle] = useState('');
    const [isRecurring, setIsRecurring] = useState(false);

    const [optimisticTodos, updateOptimisticTodos] = useOptimistic(
        todos,
        (state: Todo[], action: TodoAction) => {
            switch (action.type) {
                case 'add':
                    return [...state, action.todo];
                case 'delete':
                    return state.filter(t => t.id !== action.id);
                case 'toggle':
                    return state.map(t =>
                        t.id === action.id ? { ...t, status: action.status } : t
                    );
                default:
                    return state;
            }
        }
    );

    const handleAddTodo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTodoTitle.trim()) return;

        const newTodo: Todo = {
            id: crypto.randomUUID(),
            title: newTodoTitle,
            status: 'pending',
            date,
            isRecurring,
            createdAt: Date.now(),
        };

        const title = newTodoTitle;
        const recurring = isRecurring;

        setNewTodoTitle('');
        setIsRecurring(false);

        startTransition(() => {
            updateOptimisticTodos({ type: 'add', todo: newTodo });
        });

        await addTodo(date, title, recurring);
    };

    const handleToggleTodo = async (id: string, currentStatus: 'pending' | 'done') => {
        const newStatus = currentStatus === 'done' ? 'pending' : 'done';

        startTransition(() => {
            updateOptimisticTodos({ type: 'toggle', id, status: newStatus });
        });

        await toggleTodo(date, id, newStatus);
    };

    const handleDeleteTodo = async (id: string) => {
        startTransition(() => {
            updateOptimisticTodos({ type: 'delete', id });
        });

        await deleteTodo(date, id);
    };

    return (
        <div className="p-4 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Todos</h2>

            <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800">
                {optimisticTodos.length === 0 && (
                    <div className="p-4 text-gray-500 dark:text-gray-400 text-center">No todos for this day.</div>
                )}

                {optimisticTodos.map((todo, index) => (
                    <div key={todo.id}>
                        <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <button
                                onClick={() => handleToggleTodo(todo.id, todo.status)}
                                className={cn(
                                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
                                    todo.status === 'done'
                                        ? "bg-blue-500 border-blue-500"
                                        : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                                )}
                            >
                                {todo.status === 'done' && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                            </button>

                            <span
                                className={cn(
                                    "flex-1 truncate text-gray-900 dark:text-gray-100",
                                    todo.status === 'done' && "line-through text-gray-400 dark:text-gray-500"
                                )}
                            >
                                {todo.title}
                            </span>

                            {todo.isRecurring && (
                                <Repeat className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            )}

                            <button
                                onClick={() => handleDeleteTodo(todo.id)}
                                className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        {index < optimisticTodos.length - 1 && <div className="border-t border-gray-100 dark:border-gray-800 ml-14" />}
                    </div>
                ))}

                {/* Add Todo Input at the bottom */}
                {optimisticTodos.length > 0 && <div className="border-t border-gray-200 dark:border-gray-800" />}
                <form onSubmit={handleAddTodo} className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800">
                    <Plus className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <input
                        type="text"
                        value={newTodoTitle}
                        onChange={(e) => setNewTodoTitle(e.target.value)}
                        placeholder="New Todo"
                        className="flex-1 bg-transparent focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
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
