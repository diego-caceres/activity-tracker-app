import { redis } from './redis';
import { Todo, HabitEvent, HabitDefinition, DailyScore, DailyNote } from '@/types';
import { format, eachDayOfInterval, parseISO } from 'date-fns';

// Keys
const key = {
    todos: (date: string) => `todo:day:${date}`,
    habits: (date: string) => `habit:day:${date}`,
    score: (date: string) => `score:day:${date}`,
    notes: (date: string) => `notes:day:${date}`,
    settingsHabits: 'settings:habits',
    settingsRecurring: 'settings:recurring_todos',
};

// --- Todos ---

export async function getTodos(date: string): Promise<Todo[]> {
    // First, ensure recurring todos exist for this date
    await ensureRecurringTodos(date);

    const todos = await redis.get<Todo[]>(key.todos(date));
    return todos || [];
}

export async function saveTodo(date: string, todo: Todo): Promise<void> {
    const todos = await getTodos(date);
    const existingIndex = todos.findIndex((t) => t.id === todo.id);

    if (existingIndex >= 0) {
        todos[existingIndex] = todo;
    } else {
        todos.push(todo);
    }

    await redis.set(key.todos(date), todos);
}

export async function deleteTodo(date: string, todoId: string): Promise<void> {
    const todos = await getTodos(date);
    const newTodos = todos.filter((t) => t.id !== todoId);
    await redis.set(key.todos(date), newTodos);
}

export async function toggleTodo(date: string, todoId: string, status: 'pending' | 'done'): Promise<void> {
    const todos = await getTodos(date);
    const todo = todos.find((t) => t.id === todoId);
    if (todo) {
        todo.status = status;
        await redis.set(key.todos(date), todos);
    }
}

// Recurring Logic
async function ensureRecurringTodos(date: string): Promise<void> {
    // Check if we already initialized this date
    const exists = await redis.exists(key.todos(date));
    if (exists) return;

    // Fetch recurring templates
    const templates = await redis.get<Todo[]>(key.settingsRecurring);
    if (!templates || templates.length === 0) return;

    // Create instances for today
    const newTodos = templates.map((t) => ({
        ...t,
        id: crypto.randomUUID(), // New ID for the instance
        date,
        status: 'pending' as const,
        createdAt: Date.now(),
    }));

    await redis.set(key.todos(date), newTodos);
}

export async function addRecurringTodoTemplate(todo: Todo): Promise<void> {
    const templates = (await redis.get<Todo[]>(key.settingsRecurring)) || [];
    templates.push(todo);
    await redis.set(key.settingsRecurring, templates);
}

// --- Habits ---

export async function getHabitDefinitions(): Promise<HabitDefinition[]> {
    return (await redis.get<HabitDefinition[]>(key.settingsHabits)) || [];
}

export async function saveHabitDefinition(habit: HabitDefinition): Promise<void> {
    const habits = await getHabitDefinitions();
    const existingIndex = habits.findIndex((h) => h.id === habit.id);
    if (existingIndex >= 0) {
        habits[existingIndex] = habit;
    } else {
        habits.push(habit);
    }
    await redis.set(key.settingsHabits, habits);
}

export async function getHabitEvents(date: string): Promise<HabitEvent[]> {
    return (await redis.get<HabitEvent[]>(key.habits(date))) || [];
}

export async function logHabitEvent(date: string, event: HabitEvent): Promise<void> {
    const events = await getHabitEvents(date);
    events.push(event);
    await redis.set(key.habits(date), events);

    // Update score
    await updateDailyScore(date, event.scoreSnapshot);
}

export async function deleteHabitEvent(date: string, eventId: string): Promise<void> {
    const events = await getHabitEvents(date);
    const eventToDelete = events.find((e) => e.id === eventId);
    if (!eventToDelete) return;

    const newEvents = events.filter((e) => e.id !== eventId);
    await redis.set(key.habits(date), newEvents);

    // Reverse the score change
    await updateDailyScore(date, -eventToDelete.scoreSnapshot);
}

async function updateDailyScore(date: string, delta: number): Promise<void> {
    await redis.incrby(key.score(date), delta);
}

export async function getDailyScore(date: string): Promise<number> {
    const score = await redis.get<number>(key.score(date));
    return score || 0;
}

export async function getDailyScores(startDate: string, endDate: string): Promise<DailyScore[]> {
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    const dates = eachDayOfInterval({ start, end }).map((d) => format(d, 'yyyy-MM-dd'));

    if (dates.length === 0) return [];

    const pipeline = redis.pipeline();
    dates.forEach((date) => pipeline.get(key.score(date)));
    const results = await pipeline.exec();

    return dates.map((date, i) => ({
        date,
        score: (results[i] as number) || 0,
    }));
}

// --- Daily Notes ---

export async function getDailyNote(date: string): Promise<DailyNote | null> {
    return await redis.get<DailyNote>(key.notes(date));
}

export async function saveDailyNote(date: string, content: string): Promise<void> {
    const note: DailyNote = {
        date,
        content,
        updatedAt: Date.now(),
    };
    await redis.set(key.notes(date), note);
}
