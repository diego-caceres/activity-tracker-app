'use server';

import { revalidatePath } from 'next/cache';
import {
    saveTodo,
    deleteTodo as deleteTodoData,
    toggleTodo as toggleTodoData,
    addRecurringTodoTemplate,
    logHabitEvent,
    deleteHabitEvent as deleteHabitEventData,
    saveHabitDefinition,
    saveGoal,
    updateGoalData,
    archiveGoalData,
    deleteGoalData,
} from '@/lib/data';
import { Todo, HabitEvent, HabitDefinition, Goal, GoalType, GoalPeriod } from '@/types';
import { checkRelevantGoals } from '@/lib/goalCalculations';

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
    await checkRelevantGoals(date, 'todo');
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
    await checkRelevantGoals(date, 'habit');
    revalidatePath('/');
}

export async function addHabitDefinition(date: string, habitId: string, name: string, type: 'healthy' | 'unhealthy', score: number, icon?: string) {
    const habit: HabitDefinition = {
        id: habitId,
        name,
        type,
        score,
        icon,
    };

    // Save definition (will update if already exists)
    await saveHabitDefinition(habit);

    // Immediately log the habit
    await logHabit(date, habitId, score);
}

export async function deleteHabitEvent(date: string, eventId: string) {
    await deleteHabitEventData(date, eventId);
    await checkRelevantGoals(date, 'habit');
    revalidatePath('/');
}

// --- Daily Notes ---

export async function saveNote(date: string, content: string) {
    const { saveDailyNote } = await import('@/lib/data');
    await saveDailyNote(date, content);
    revalidatePath('/');
}

// --- Goals ---

export async function createGoal(
    type: GoalType,
    title: string,
    target: number,
    period: GoalPeriod,
    startDate: string,
    endDate?: string,
    habitId?: string,
    description?: string
) {
    const goal: Goal = {
        id: crypto.randomUUID(),
        type,
        title,
        description,
        target,
        period,
        startDate,
        endDate,
        habitId,
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };

    await saveGoal(goal);
    revalidatePath('/');
    revalidatePath('/goals');
}

export async function updateGoal(goalId: string, updates: Partial<Goal>) {
    await updateGoalData(goalId, updates);
    revalidatePath('/');
    revalidatePath('/goals');
}

export async function archiveGoal(goalId: string) {
    await archiveGoalData(goalId);
    revalidatePath('/');
    revalidatePath('/goals');
}

export async function deleteGoal(goalId: string) {
    await deleteGoalData(goalId);
    revalidatePath('/');
    revalidatePath('/goals');
}
