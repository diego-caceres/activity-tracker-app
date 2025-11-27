import { getTodos, getHabitDefinitions, getHabitEvents, getDailyScore, getDailyScores, getDailyNote, calculateStreak } from '@/lib/data';
import TodoList from '@/components/TodoList';
import DailyNotes from '@/components/DailyNotes';
import HabitTracker from '@/components/HabitTracker';
import WeeklyChart from '@/components/WeeklyChart';
import ScoreGrid from '@/components/ScoreGrid';
import DateNavigation from '@/components/DateNavigation';
import StreakCounter from '@/components/StreakCounter';
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
  const [todos, habitDefinitions, habitEvents, dailyScore, dailyNote, streak] = await Promise.all([
    getTodos(date),
    getHabitDefinitions(),
    getHabitEvents(date),
    getDailyScore(date),
    getDailyNote(date),
    calculateStreak(date),
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

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 sticky top-0 z-10">
        <DateNavigation />
        <StreakCounter currentStreak={streak} />
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        <ScoreGrid scores={calendarScores} currentDate={date} />

        <TodoList date={date} todos={todos} />

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
