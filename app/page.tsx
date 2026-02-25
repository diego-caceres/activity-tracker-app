import {
  getTodos,
  getOverdueTodos,
  getHabitDefinitions,
  getHabitEvents,
  getDailyScore,
  getDailyScores,
  getDailyNote,
  getWateringStatus,
  getWateringStatuses,
  calculateStreak,
  getActiveGoals,
  getAchievements,
  getWeightEntry,
  getWeightEntries,
  getHabitLastUsed,
  getUptimeProjects,
  getUptimeDailyCheck,
} from '@/lib/data';
import { calculateGoalProgress } from '@/lib/goalCalculations';
import TodoList from '@/components/TodoList';
import DailyNotes from '@/components/DailyNotes';
import HabitTracker from '@/components/HabitTracker';
import WeeklyChart from '@/components/WeeklyChart';
import ScoreGrid from '@/components/ScoreGrid';
import DateNavigation from '@/components/DateNavigation';
import StreakCounter from '@/components/StreakCounter';
import WateringTracker from '@/components/WateringTracker';
import GoalsSection from '@/components/GoalsSection';
import AchievementBadge from '@/components/AchievementBadge';
import LocalDateRedirect from '@/components/LocalDateRedirect';
import TodayFocusCard from '@/components/TodayFocusCard';
import MobileQuickBar from '@/components/MobileQuickBar';
import WeightTracker from '@/components/WeightTracker';
import UptimeStatusCard from '@/components/UptimeStatusCard';
import { format, parseISO, subDays, startOfMonth, subMonths } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;
  if (!dateParam) {
    return <LocalDateRedirect />;
  }

  const parsedDate = parseISO(dateParam);
  if (Number.isNaN(parsedDate.getTime())) {
    return <LocalDateRedirect />;
  }
  const selectedDate = parsedDate;
  const date = dateParam;

  // Fetch data for the main view
  const [
    todos,
    overdueTodos,
    habitDefinitions,
    habitEvents,
    dailyScore,
    dailyNote,
    wateringStatus,
    streak,
    goals,
    achievements,
    weightEntry,
    habitLastUsed,
    uptimeProjects,
    uptimeDailyCheck,
  ] = await Promise.all([
    getTodos(date),
    getOverdueTodos(date),
    getHabitDefinitions(),
    getHabitEvents(date),
    getDailyScore(date),
    getDailyNote(date),
    getWateringStatus(date),
    calculateStreak(date),
    getActiveGoals(),
    getAchievements(),
    getWeightEntry(date),
    getHabitLastUsed(),
    getUptimeProjects(),
    getUptimeDailyCheck(date),
  ]);

  // Fetch data for the calendar (current month + previous month for navigation)
  // This is much more efficient than loading 365 days
  const today = new Date();
  const endDate = format(today, 'yyyy-MM-dd');
  const startDate = format(subMonths(startOfMonth(today), 1), 'yyyy-MM-dd'); // Start from previous month
  const [calendarScores, calendarWatering] = await Promise.all([
    getDailyScores(startDate, endDate),
    getWateringStatuses(startDate, endDate),
  ]);

  // Fetch data for weekly chart (last 7 days anchored to selected date)
  const weeklyEnd = format(selectedDate, 'yyyy-MM-dd');
  const weeklyStart = format(subDays(selectedDate, 6), 'yyyy-MM-dd');
  const weeklyScores = await getDailyScores(weeklyStart, weeklyEnd);

  // Fetch data for weight trend (last 30 days anchored to selected date)
  const weightStart = format(subDays(selectedDate, 29), 'yyyy-MM-dd');
  const weightEntries = await getWeightEntries(weightStart, weeklyEnd);

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

      <div className="flex-1 overflow-y-auto pb-8">
        <TodayFocusCard
          pendingTodos={todos.filter((todo) => todo.status === 'pending').length}
          overdueTodos={overdueTodos.length}
          dailyScore={dailyScore}
          hasWeightEntry={Boolean(weightEntry)}
        />

        <TodoList date={date} todos={todos} overdueTodos={overdueTodos} />

        <ScoreGrid scores={calendarScores} wateringStatuses={calendarWatering} currentDate={date} />

        <HabitTracker
          date={date}
          definitions={habitDefinitions}
          events={habitEvents}
          dailyScore={dailyScore}
          habitLastUsed={habitLastUsed}
        />

        <WateringTracker date={date} wateringStatus={wateringStatus} />

        <WeeklyChart scores={weeklyScores} referenceDate={date} />

        <WeightTracker date={date} entry={weightEntry} entries={weightEntries} />

        <div className="px-4 py-3">
          <GoalsSection
            goals={goals}
            goalsProgress={goalsProgress}
            currentDate={date}
          />
        </div>

        <UptimeStatusCard
          projects={uptimeProjects}
          dailyCheck={uptimeDailyCheck}
          currentDate={date}
        />

        <DailyNotes key={date} date={date} note={dailyNote} />
      </div>

      <MobileQuickBar />
    </div>
  );
}
