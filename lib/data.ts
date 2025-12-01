import { redis } from './redis';
import { Todo, HabitEvent, HabitDefinition, DailyScore, DailyNote, Goal, GoalProgress, GoalAchievement } from '@/types';
import { format, eachDayOfInterval, parseISO, subDays } from 'date-fns';

// Keys
const key = {
    todos: (date: string) => `todo:day:${date}`,
    habits: (date: string) => `habit:day:${date}`,
    score: (date: string) => `score:day:${date}`,
    notes: (date: string) => `notes:day:${date}`,
    settingsHabits: 'settings:habits',
    goals: 'goals:active',
    goalById: (id: string) => `goal:${id}`,
    goalProgress: (goalId: string, date: string) => `goal:${goalId}:progress:${date}`,
    goalAchievements: 'goals:achievements',
    goalAchievementById: (id: string) => `goal:achievement:${id}`,
    goalsArchived: 'goals:archived',
};

// --- Todos ---

export async function getTodos(date: string): Promise<Todo[]> {
    const todos = await redis.get<Todo[]>(key.todos(date));
    return todos || [];
}

export async function getOverdueTodos(currentDate: string): Promise<Todo[]> {
    // Look back up to 30 days for uncompleted todos
    const start = subDays(parseISO(currentDate), 30);
    const dates = eachDayOfInterval({
        start,
        end: subDays(parseISO(currentDate), 1) // Only previous days, not current
    }).map((d) => format(d, 'yyyy-MM-dd'));

    const overdueTodos: Todo[] = [];

    for (const date of dates) {
        const todos = await redis.get<Todo[]>(key.todos(date));
        if (todos) {
            const pending = todos.filter(t => t.status === 'pending');
            overdueTodos.push(...pending);
        }
    }

    return overdueTodos;
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

export async function calculateStreak(endDate: string): Promise<number> {
    // We'll check the last 30 days for efficiency, assuming streaks rarely exceed that without checking
    // For a robust solution, we might need to check further back or store streak in a separate key
    const end = parseISO(endDate);
    const start = subDays(end, 60); // Check last 60 days

    const scores = await getDailyScores(format(start, 'yyyy-MM-dd'), endDate);

    // Sort by date descending (newest first)
    const sortedScores = scores.sort((a, b) => b.date.localeCompare(a.date));

    let streak = 0;
    // Check if today has a score (if not, start checking from yesterday)
    // Actually, for a streak, we usually count consecutive days up to yesterday OR today if completed

    for (const day of sortedScores) {
        if (day.score > 0) {
            streak++;
        } else if (day.score === 0) {
            // If it's today and 0, we don't break yet (maybe they haven't logged yet)
            // But if it's a past day and 0, streak is broken
            if (day.date !== endDate) {
                break;
            }
        } else {
            // Negative score breaks streak
            break;
        }
    }

    return streak;
}

// --- Goals ---

export async function getActiveGoals(): Promise<Goal[]> {
    const goalIds = await redis.get<string[]>(key.goals) || [];
    if (goalIds.length === 0) return [];

    const pipeline = redis.pipeline();
    goalIds.forEach(id => pipeline.get(key.goalById(id)));
    const results = await pipeline.exec();

    return results.filter(Boolean) as Goal[];
}

export async function getGoalById(goalId: string): Promise<Goal | null> {
    return await redis.get<Goal>(key.goalById(goalId));
}

export async function saveGoal(goal: Goal): Promise<void> {
    // Save goal object
    await redis.set(key.goalById(goal.id), goal);

    // Add to active goals list if active
    if (goal.status === 'active') {
        const goals = await redis.get<string[]>(key.goals) || [];
        if (!goals.includes(goal.id)) {
            goals.push(goal.id);
            await redis.set(key.goals, goals);
        }
    }
}

export async function updateGoalData(
    goalId: string,
    updates: Partial<Goal>
): Promise<void> {
    const goal = await getGoalById(goalId);
    if (!goal) return;

    const updatedGoal = {
        ...goal,
        ...updates,
        updatedAt: Date.now()
    };

    await redis.set(key.goalById(goalId), updatedGoal);
}

export async function archiveGoalData(goalId: string): Promise<void> {
    const goal = await getGoalById(goalId);
    if (!goal) return;

    // Update status
    goal.status = 'archived';
    goal.updatedAt = Date.now();
    await redis.set(key.goalById(goalId), goal);

    // Move from active to archived list
    const activeGoals = await redis.get<string[]>(key.goals) || [];
    const archivedGoals = await redis.get<string[]>(key.goalsArchived) || [];

    await redis.set(
        key.goals,
        activeGoals.filter(id => id !== goalId)
    );

    if (!archivedGoals.includes(goalId)) {
        archivedGoals.push(goalId);
        await redis.set(key.goalsArchived, archivedGoals);
    }
}

export async function deleteGoalData(goalId: string): Promise<void> {
    // Remove from active or archived list
    const activeGoals = await redis.get<string[]>(key.goals) || [];
    const archivedGoals = await redis.get<string[]>(key.goalsArchived) || [];

    await redis.set(key.goals, activeGoals.filter(id => id !== goalId));
    await redis.set(key.goalsArchived, archivedGoals.filter(id => id !== goalId));

    // Delete goal object
    await redis.del(key.goalById(goalId));
}

export async function getGoalProgress(
    goalId: string,
    date: string
): Promise<GoalProgress | null> {
    return await redis.get<GoalProgress>(
        key.goalProgress(goalId, date)
    );
}

export async function saveGoalProgress(
    progress: GoalProgress
): Promise<void> {
    await redis.set(
        key.goalProgress(progress.goalId, progress.date),
        progress,
        { ex: 3600 } // 1 hour TTL
    );
}

export async function getAchievements(): Promise<GoalAchievement[]> {
    const achievementIds = await redis.get<string[]>(
        key.goalAchievements
    ) || [];

    if (achievementIds.length === 0) return [];

    const pipeline = redis.pipeline();
    achievementIds.forEach(id =>
        pipeline.get(key.goalAchievementById(id))
    );
    const results = await pipeline.exec();

    return results.filter(Boolean) as GoalAchievement[];
}

export async function recordAchievement(
    goal: Goal,
    date: string,
    progress: number
): Promise<GoalAchievement> {
    const achievement: GoalAchievement = {
        id: crypto.randomUUID(),
        goalId: goal.id,
        achievedDate: date,
        achievedAt: Date.now(),
        finalProgress: progress,
        goalSnapshot: { ...goal },
    };

    // Save achievement
    await redis.set(
        key.goalAchievementById(achievement.id),
        achievement
    );

    // Add to achievements list
    const achievements = await redis.get<string[]>(
        key.goalAchievements
    ) || [];
    achievements.push(achievement.id);
    await redis.set(key.goalAchievements, achievements);

    // Update goal status
    await updateGoalData(goal.id, {
        status: 'completed',
        achievedAt: Date.now(),
    });

    return achievement;
}

// Helper: Get habit count for period
export async function getHabitCountForPeriod(
    habitId: string,
    startDate: string,
    endDate: string
): Promise<number> {
    const scores = await getDailyScores(startDate, endDate);
    let count = 0;

    for (const { date } of scores) {
        const events = await getHabitEvents(date);
        count += events.filter(e => e.habitId === habitId).length;
    }

    return count;
}

// Helper: Get todo completion rate
export async function getTodoCompletionRate(
    startDate: string,
    endDate: string
): Promise<number> {
    const dates = eachDayOfInterval({
        start: parseISO(startDate),
        end: parseISO(endDate),
    }).map(d => format(d, 'yyyy-MM-dd'));

    let totalTodos = 0;
    let completedTodos = 0;

    for (const date of dates) {
        const todos = await getTodos(date);
        totalTodos += todos.length;
        completedTodos += todos.filter(t => t.status === 'done').length;
    }

    return totalTodos === 0 ? 0 : (completedTodos / totalTodos) * 100;
}

// Helper: Get healthy habit count
export async function getHealthyHabitCount(
    startDate: string,
    endDate: string
): Promise<number> {
    const scores = await getDailyScores(startDate, endDate);
    let count = 0;

    const definitions = await getHabitDefinitions();
    const healthyIds = definitions
        .filter(d => d.type === 'healthy')
        .map(d => d.id);

    for (const { date } of scores) {
        const events = await getHabitEvents(date);
        count += events.filter(e => healthyIds.includes(e.habitId)).length;
    }

    return count;
}
