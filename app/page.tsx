import { getTodos, getHabitDefinitions, getHabitEvents, getDailyScore, getDailyScores, getDailyNote } from '@/lib/data';
import DailyLog from '@/components/DailyLog';
import HabitTracker from '@/components/HabitTracker';
import ScoreGrid from '@/components/ScoreGrid';
import DateNavigation from '@/components/DateNavigation';
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
  const [todos, habitDefinitions, habitEvents, dailyScore, dailyNote] = await Promise.all([
    getTodos(date),
    getHabitDefinitions(),
    getHabitEvents(date),
    getDailyScore(date),
    getDailyNote(date),
  ]);

  // Fetch data for the calendar (current month + previous month for navigation)
  // This is much more efficient than loading 365 days
  const today = new Date();
  const endDate = format(today, 'yyyy-MM-dd');
  const startDate = format(subMonths(startOfMonth(today), 1), 'yyyy-MM-dd'); // Start from previous month
  const calendarScores = await getDailyScores(startDate, endDate);

  return (
    <div className="flex flex-col h-full">
      <DateNavigation />

      <div className="flex-1 overflow-y-auto pb-20">
        <ScoreGrid scores={calendarScores} />

        <DailyLog date={date} todos={todos} note={dailyNote} />

        <HabitTracker
          date={date}
          definitions={habitDefinitions}
          events={habitEvents}
          dailyScore={dailyScore}
        />
      </div>
    </div>
  );
}
