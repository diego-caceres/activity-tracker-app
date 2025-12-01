'use client';

import { useState, useOptimistic, startTransition } from 'react';
import { Todo } from '@/types';
import { addTodo, deleteTodo, toggleTodo } from '@/app/actions';
import { Check, Trash2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

interface TodoListProps {
    date: string;
    todos: Todo[];
    overdueTodos: Todo[];
}

type TodoAction =
    | { type: 'add'; todo: Todo }
    | { type: 'delete'; id: string }
    | { type: 'toggle'; id: string; status: 'pending' | 'done' };

export default function TodoList({ date, todos, overdueTodos }: TodoListProps) {
    const [newTodoTitle, setNewTodoTitle] = useState('');

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

    const [optimisticOverdueTodos, updateOptimisticOverdueTodos] = useOptimistic(
        overdueTodos,
        (state: Todo[], action: TodoAction) => {
            switch (action.type) {
                case 'delete':
                    return state.filter(t => t.id !== action.id);
                case 'toggle':
                    // When completed, remove from overdue list
                    if (action.status === 'done') {
                        return state.filter(t => t.id !== action.id);
                    }
                    return state;
                default:
                    return state;
            }
        }
    );

    const allTodos = [...optimisticOverdueTodos, ...optimisticTodos];

    const handleAddTodo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTodoTitle.trim()) return;

        const newTodo: Todo = {
            id: crypto.randomUUID(),
            title: newTodoTitle,
            status: 'pending',
            date,
            createdAt: Date.now(),
        };

        const title = newTodoTitle;

        setNewTodoTitle('');

        startTransition(() => {
            updateOptimisticTodos({ type: 'add', todo: newTodo });
        });

        await addTodo(date, title);
    };

    const handleToggleTodo = async (todo: Todo) => {
        const newStatus = todo.status === 'done' ? 'pending' : 'done';
        const todoDate = todo.date; // Use the original date of the todo

        startTransition(() => {
            updateOptimisticTodos({ type: 'toggle', id: todo.id, status: newStatus });
            updateOptimisticOverdueTodos({ type: 'toggle', id: todo.id, status: newStatus });
        });

        await toggleTodo(todoDate, todo.id, newStatus);
    };

    const handleDeleteTodo = async (todo: Todo) => {
        const todoDate = todo.date; // Use the original date of the todo

        startTransition(() => {
            updateOptimisticTodos({ type: 'delete', id: todo.id });
            updateOptimisticOverdueTodos({ type: 'delete', id: todo.id });
        });

        await deleteTodo(todoDate, todo.id);
    };

    return (
        <div className="p-4 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Todos</h2>

            <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800">
                {allTodos.length === 0 && (
                    <div className="p-4 text-gray-500 dark:text-gray-400 text-center">No todos for this day.</div>
                )}

                {allTodos.map((todo, index) => {
                    const isOverdue = todo.date !== date;
                    const formattedDate = isOverdue ? format(parseISO(todo.date), 'MMM d') : null;

                    return (
                        <div key={todo.id}>
                            <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <button
                                    onClick={() => handleToggleTodo(todo)}
                                    className={cn(
                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
                                        todo.status === 'done'
                                            ? "bg-blue-500 border-blue-500"
                                            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                                    )}
                                >
                                    {todo.status === 'done' && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                                </button>

                                <div className="flex-1 flex flex-col min-w-0">
                                    <span
                                        className={cn(
                                            "truncate text-gray-900 dark:text-gray-100",
                                            todo.status === 'done' && "line-through text-gray-400 dark:text-gray-500"
                                        )}
                                    >
                                        {todo.title}
                                    </span>
                                    {isOverdue && (
                                        <span className="text-xs text-orange-500 dark:text-orange-400 opacity-75">
                                            {formattedDate}
                                        </span>
                                    )}
                                </div>

                                <button
                                    onClick={() => handleDeleteTodo(todo)}
                                    className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            {index < allTodos.length - 1 && <div className="border-t border-gray-100 dark:border-gray-800 ml-14" />}
                        </div>
                    );
                })}

                {/* Add Todo Input at the bottom */}
                {allTodos.length > 0 && <div className="border-t border-gray-200 dark:border-gray-800" />}
                <form onSubmit={handleAddTodo} className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800">
                    <Plus className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <input
                        type="text"
                        value={newTodoTitle}
                        onChange={(e) => setNewTodoTitle(e.target.value)}
                        placeholder="New Todo"
                        className="flex-1 bg-transparent focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    />
                </form>
            </div>
        </div>
    );
}
