'use client';

import { useState, useOptimistic, startTransition, Fragment } from 'react';
import { Todo } from '@/types';
import { addTodo, updateTodo, deleteTodo, toggleTodo } from '@/app/actions';
import { Check, Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';
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
    const [showOverdue, setShowOverdue] = useState(false);

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

    const todayTodos = optimisticTodos;
    const overdueList = optimisticOverdueTodos;
    const hasAnyTodos = todayTodos.length > 0 || overdueList.length > 0;

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
        const todoDate = todo.date;

        startTransition(() => {
            updateOptimisticTodos({ type: 'toggle', id: todo.id, status: newStatus });
            updateOptimisticOverdueTodos({ type: 'toggle', id: todo.id, status: newStatus });
        });

        await toggleTodo(todoDate, todo.id, newStatus);
    };

    const handleDeleteTodo = async (todo: Todo) => {
        const todoDate = todo.date;

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

        if (diff > 0) {
            setSwipeOffset(Math.min(diff, 80));
        } else {
            setSwipeOffset(0);
        }
    };

    const handleTouchEnd = () => {
        setTouchStart(null);
        if (swipeOffset < 40) {
            setSwipeOffset(0);
            setSwipingId(null);
        } else {
            setSwipeOffset(80);
        }
    };

    const renderTodoItem = (todo: Todo, index: number, total: number) => {
        const isOverdue = todo.date !== date;
        const formattedDate = isOverdue ? format(parseISO(todo.date), 'MMM d') : null;
        const isEditing = editingId === todo.id;
        const isSwiping = swipingId === todo.id;
        const offset = isSwiping ? swipeOffset : 0;

        return (
            <Fragment key={todo.id}>
                <div className="relative overflow-hidden group">
                    {/* Delete button background (revealed on swipe) */}
                    <button
                        onClick={() => handleDeleteTodo(todo)}
                        className="absolute inset-0 bg-rose-500 flex items-center justify-end pr-4"
                    >
                        <Trash2 className="w-5 h-5 text-white" />
                    </button>

                    {/* Main content */}
                    <div
                        className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-all bg-white dark:bg-[#1b1f2e] relative"
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
                                    ? "bg-indigo-600 border-indigo-600"
                                    : "border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500"
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
                                    className="w-full px-2 py-1 text-sm rounded border border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-[#1b1f2e] text-slate-900 dark:text-slate-100 resize-none"
                                />
                            ) : (
                                <button
                                    onClick={() => handleStartEdit(todo)}
                                    className="text-left w-full cursor-text hover:opacity-80 transition-opacity"
                                >
                                    <div
                                        className={cn(
                                            "text-slate-900 dark:text-slate-100 whitespace-pre-wrap break-words",
                                            todo.status === 'done' && "line-through text-slate-400 dark:text-slate-500"
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
                            className="text-slate-400 hover:text-rose-500 p-1 transition-all mt-1 opacity-0 group-hover:opacity-100 cursor-pointer"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                {index < total - 1 && <div className="border-t border-slate-100 dark:border-white/5 ml-14" />}
            </Fragment>
        );
    };

    return (
        <div id="todos-section" className="p-4 space-y-3 bg-white dark:bg-[#141720]">
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">Todos</h2>

            <div className="bg-white dark:bg-[#1b1f2e] rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.07]">
                {!hasAnyTodos && (
                    <div className="p-4 text-slate-500 dark:text-slate-400 text-center">No todos for this day.</div>
                )}

                {overdueList.length > 0 && (
                    <div className="border-b border-slate-200 dark:border-white/[0.07]">
                        <button
                            onClick={() => setShowOverdue(!showOverdue)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-amber-50/70 dark:bg-amber-950/20 text-left"
                        >
                            <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
                                Overdue ({overdueList.length})
                            </span>
                            {showOverdue
                                ? <ChevronUp className="w-4 h-4 text-amber-700 dark:text-amber-300" />
                                : <ChevronDown className="w-4 h-4 text-amber-700 dark:text-amber-300" />}
                        </button>
                    </div>
                )}

                {showOverdue && overdueList.map((todo, index) => renderTodoItem(todo, index, overdueList.length))}

                {showOverdue && overdueList.length > 0 && todayTodos.length > 0 && (
                    <div className="border-t border-slate-200 dark:border-white/[0.07]" />
                )}

                {todayTodos.length > 0 && todayTodos.map((todo, index) => renderTodoItem(todo, index, todayTodos.length))}

                {/* Add Todo Input at the bottom */}
                {hasAnyTodos && <div className="border-t border-slate-200 dark:border-white/[0.07]" />}
                <form onSubmit={handleAddTodo} className="flex items-start gap-3 px-4 py-3 bg-slate-50 dark:bg-[#141720]">
                    <Plus className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-1" />
                    <textarea
                        id="todo-add-input"
                        value={newTodoTitle}
                        onChange={(e) => setNewTodoTitle(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleAddTodo(e);
                            }
                        }}
                        placeholder="Add a todo..."
                        rows={2}
                        className="flex-1 bg-transparent focus:outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 resize-none"
                    />
                    <button
                        type="submit"
                        className="px-3 py-1.5 mt-0.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors cursor-pointer"
                    >
                        Add
                    </button>
                </form>
            </div>
        </div>
    );
}
