import { getTodos, getOverdueTodos, getHabitDefinitions, getHabitEvents, getDailyScore, getDailyScores, getDailyNote, calculateStreak, getActiveGoals, getAchievements } from '@/lib/data';
import { calculateGoalProgress } from '@/lib/goalCalculations';
import TodoList from '@/components/TodoList';
import DailyNotes from '@/components/DailyNotes';
import HabitTracker from '@/components/HabitTracker';
import WeeklyChart from '@/components/WeeklyChart';
import ScoreGrid from '@/components/ScoreGrid';
import DateNavigation from '@/components/DateNavigation';
import StreakCounter from '@/components/StreakCounter';
import GoalsSection from '@/components/GoalsSection';
import AchievementBadge from '@/components/AchievementBadge';
import { format, subDays, startOfMonth, subMonths } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;
  const date = dateParam || format(new Date(), 'yyyy-MM-dd');

  // Fetch data for the main view
  const [todos, overdueTodos, habitDefinitions, habitEvents, dailyScore, dailyNote, streak, goals, achievements] = await Promise.all([
    getTodos(date),
    getOverdueTodos(date),
    getHabitDefinitions(),
    getHabitEvents(date),
    getDailyScore(date),
    getDailyNote(date),
    calculateStreak(date),
    getActiveGoals(),
    getAchievements(),
  ]);

  // Fetch data for the calendar (current month + previous month for navigation)
  // This is much more efficient than loading 365 days
  const today = new Date();
  const endDate = format(today, 'yyyy-MM-dd');
  const startDate = format(subMonths(startOfMonth(today), 1), 'yyyy-MM-dd'); // Start from previous month
  const calendarScores = await getDailyScores(startDate, endDate);

  // Fetch data for weekly chart (last 7 days)
  const weeklyStart = format(subDays(today, 6), 'yyyy-MM-dd');
  const weeklyScores = await getDailyScores(weeklyStart, endDate);

  // Calculate progress for all active goals
  const goalsProgress: Record<string, number> = {};
  for (const goal of goals) {
    const progress = await calculateGoalProgress(goal, date);
    goalsProgress[goal.id] = progress.progress;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-2">
          <DateNavigation />
          <AchievementBadge achievements={achievements} />
        </div>
        <StreakCounter currentStreak={streak} />
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        <div className="px-4 py-3">
          <GoalsSection
            goals={goals}
            goalsProgress={goalsProgress}
            currentDate={date}
          />
        </div>

        <ScoreGrid scores={calendarScores} currentDate={date} />

        <TodoList date={date} todos={todos} overdueTodos={overdueTodos} />

        <HabitTracker
          date={date}
          definitions={habitDefinitions}
          events={habitEvents}
          dailyScore={dailyScore}
        />

        <WeeklyChart scores={weeklyScores} />

        <DailyNotes date={date} note={dailyNote} />
      </div>
    </div>
  );
}
