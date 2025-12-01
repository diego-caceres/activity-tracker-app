'use client';

import { useState, useOptimistic, startTransition } from 'react';
import { Todo } from '@/types';
import { addTodo, updateTodo, deleteTodo, toggleTodo } from '@/app/actions';
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
    | { type: 'toggle'; id: string; status: 'pending' | 'done' }
    | { type: 'update'; id: string; title: string };

export default function TodoList({ date, todos, overdueTodos }: TodoListProps) {
    const [newTodoTitle, setNewTodoTitle] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingText, setEditingText] = useState('');
    const [swipingId, setSwipingId] = useState<string | null>(null);
    const [swipeOffset, setSwipeOffset] = useState(0);
    const [touchStart, setTouchStart] = useState<number | null>(null);

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
                case 'update':
                    return state.map(t =>
                        t.id === action.id ? { ...t, title: action.title } : t
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
                case 'update':
                    return state.map(t =>
                        t.id === action.id ? { ...t, title: action.title } : t
                    );
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

    const handleStartEdit = (todo: Todo) => {
        setEditingId(todo.id);
        setEditingText(todo.title);
    };

    const handleSaveEdit = async (todo: Todo) => {
        if (!editingText.trim()) {
            setEditingId(null);
            return;
        }

        const todoDate = todo.date;
        const newTitle = editingText;
        setEditingId(null);

        startTransition(() => {
            updateOptimisticTodos({ type: 'update', id: todo.id, title: newTitle });
            updateOptimisticOverdueTodos({ type: 'update', id: todo.id, title: newTitle });
        });

        await updateTodo(todoDate, todo.id, newTitle);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingText('');
    };

    const handleTouchStart = (e: React.TouchEvent, todoId: string) => {
        setTouchStart(e.touches[0].clientX);
        setSwipingId(todoId);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (touchStart === null) return;

        const currentTouch = e.touches[0].clientX;
        const diff = touchStart - currentTouch;

        // Only allow left swipe (positive diff) and limit to 80px
        if (diff > 0) {
            setSwipeOffset(Math.min(diff, 80));
        } else {
            setSwipeOffset(0);
        }
    };

    const handleTouchEnd = () => {
        setTouchStart(null);
        // If swiped more than 40px, keep it open, otherwise close
        if (swipeOffset < 40) {
            setSwipeOffset(0);
            setSwipingId(null);
        } else {
            setSwipeOffset(80);
        }
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
                    const isEditing = editingId === todo.id;
                    const isSwiping = swipingId === todo.id;
                    const offset = isSwiping ? swipeOffset : 0;

                    return (
                        <>
                            <div key={todo.id} className="relative overflow-hidden group">
                                {/* Delete button background (revealed on swipe) */}
                                <button
                                    onClick={() => handleDeleteTodo(todo)}
                                    className="absolute inset-0 bg-red-500 flex items-center justify-end pr-4"
                                >
                                    <Trash2 className="w-5 h-5 text-white" />
                                </button>

                                {/* Main content */}
                                <div
                                    className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all bg-white dark:bg-gray-900 relative"
                                    style={{
                                        transform: `translateX(-${offset}px)`,
                                        transition: touchStart === null ? 'transform 0.3s ease' : 'none'
                                    }}
                                    onTouchStart={(e) => handleTouchStart(e, todo.id)}
                                    onTouchMove={handleTouchMove}
                                    onTouchEnd={handleTouchEnd}
                                >
                                    <button
                                        onClick={() => handleToggleTodo(todo)}
                                        className={cn(
                                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 mt-1",
                                            todo.status === 'done'
                                                ? "bg-blue-500 border-blue-500"
                                                : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                                        )}
                                    >
                                        {todo.status === 'done' && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                                    </button>

                                    <div className="flex-1 flex flex-col min-w-0">
                                        {isEditing ? (
                                            <textarea
                                                value={editingText}
                                                onChange={(e) => setEditingText(e.target.value)}
                                                onBlur={() => handleSaveEdit(todo)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSaveEdit(todo);
                                                    } else if (e.key === 'Escape') {
                                                        handleCancelEdit();
                                                    }
                                                }}
                                                autoFocus
                                                rows={2}
                                                className="w-full px-2 py-1 text-sm rounded border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                                            />
                                        ) : (
                                            <button
                                                onClick={() => handleStartEdit(todo)}
                                                className="text-left w-full cursor-text hover:opacity-80 transition-opacity"
                                            >
                                                <div
                                                    className={cn(
                                                        "text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words",
                                                        todo.status === 'done' && "line-through text-gray-400 dark:text-gray-500"
                                                    )}
                                                    style={{
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden'
                                                    }}
                                                >
                                                    {todo.title}
                                                </div>
                                            </button>
                                        )}
                                        {isOverdue && !isEditing && (
                                            <span className="text-xs text-orange-500 dark:text-orange-400 opacity-75 mt-1">
                                                {formattedDate}
                                            </span>
                                        )}
                                    </div>

                                    {/* Delete button - hidden by default, visible on hover (desktop) */}
                                    <button
                                        onClick={() => handleDeleteTodo(todo)}
                                        className="text-gray-400 hover:text-red-500 p-1 transition-all mt-1 opacity-0 group-hover:opacity-100 cursor-pointer"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            {index < allTodos.length - 1 && <div className="border-t border-gray-100 dark:border-gray-800 ml-14" />}
                        </>
                    );
                })}

                {/* Add Todo Input at the bottom */}
                {allTodos.length > 0 && <div className="border-t border-gray-200 dark:border-gray-800" />}
                <form onSubmit={handleAddTodo} className="flex items-start gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800">
                    <Plus className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                    <textarea
                        value={newTodoTitle}
                        onChange={(e) => setNewTodoTitle(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleAddTodo(e);
                            }
                        }}
                        placeholder="New Todo (Shift+Enter for new line)"
                        rows={2}
                        className="flex-1 bg-transparent focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                    />
                </form>
            </div>
        </div>
    );
}
