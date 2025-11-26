'use server';

import { revalidatePath } from 'next/cache';
import {
    saveTodo,
    deleteTodo as deleteTodoData,
    toggleTodo as toggleTodoData,
    addRecurringTodoTemplate,
    logHabitEvent,
    saveHabitDefinition
} from '@/lib/data';
import { Todo, HabitEvent, HabitDefinition } from '@/types';

// --- Todos ---

export async function addTodo(date: string, title: string, isRecurring: boolean) {
    const todo: Todo = {
        id: crypto.randomUUID(),
        title,
        status: 'pending',
        date,
        isRecurring,
        createdAt: Date.now(),
    };

    await saveTodo(date, todo);

    if (isRecurring) {
        await addRecurringTodoTemplate(todo);
    }

    revalidatePath('/');
}

export async function deleteTodo(date: string, id: string) {
    await deleteTodoData(date, id);
    revalidatePath('/');
}

export async function toggleTodo(date: string, id: string, status: 'pending' | 'done') {
    await toggleTodoData(date, id, status);
    revalidatePath('/');
}

// --- Habits ---

export async function logHabit(date: string, habitId: string, score: number) {
    const event: HabitEvent = {
        id: crypto.randomUUID(),
        habitId,
        date,
        timestamp: Date.now(),
        scoreSnapshot: score,
    };

    await logHabitEvent(date, event);
    revalidatePath('/');
}

export async function addHabitDefinition(name: string, type: 'healthy' | 'unhealthy', score: number, icon?: string) {
    const habit: HabitDefinition = {
        id: crypto.randomUUID(),
        name,
        type,
        score,
        icon,
    };

    await saveHabitDefinition(habit);
    revalidatePath('/');
}

// --- Daily Notes ---

export async function saveNote(date: string, content: string) {
    const { saveDailyNote } = await import('@/lib/data');
    await saveDailyNote(date, content);
    revalidatePath('/');
}
