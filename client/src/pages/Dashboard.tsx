import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FiCheckCircle,
  FiAlertCircle,
  FiSkipForward,
  FiZap,
  FiTarget,
  FiTrendingUp,
  FiCalendar,
  FiClock,
  FiAward,
  FiBarChart2,
  FiArrowUp,
  FiArrowDown,
  FiMinus,
} from "react-icons/fi";
import { useAuthContext } from "../context/AuthContext";
import { api } from "../lib/axios";

/* ── Types ── */
interface Overview {
  total: number;
  completed: number;
  backlog: number;
  skipped: number;
  completion_pct: number;
  plans_count: number;
}
interface Streak {
  current: number;
  longest: number;
}
interface TodayTask {
  id: number;
  subject: string;
  topic: string;
  task_type: string;
  priority: string;
  duration_minutes: number;
  status: string;
}
interface TodayData {
  tasks: TodayTask[];
  completed: number;
  total: number;
}
interface UpcomingDay {
  date: string;
  count: number;
  subjects: string[];
  total_minutes: number;
}
interface DayActivity {
  date: string;
  day: string;
  completed: number;
  total: number;
  pct: number;
}
interface SubjectProgress {
  subject: string;
  total: number;
  completed: number;
  pct: number;
  hours_studied: number;
}
interface WeeklyComparison {
  this_week: number;
  last_week: number;
}
interface DashboardData {
  overview: Overview;
  streak: Streak;
  today: TodayData;
  upcoming: UpcomingDay[];
  last_14_days: DayActivity[];
  subject_progress: SubjectProgress[];
  weekly_comparison: WeeklyComparison;
}

/* ── Helpers ── */
function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (d.getTime() === today.getTime()) return "Today";
  if (d.getTime() === tomorrow.getTime()) return "Tomorrow";
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatMins(mins: number) {
  const h = Math.floor(mins / 60),
    m = mins % 60;
  if (!h) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

const SUBJECT_COLORS: Record<string, string> = {
  physics: "bg-sky-500",
  chemistry: "bg-emerald-500",
  mathematics: "bg-violet-500",
  maths: "bg-violet-500",
  biology: "bg-teal-500",
  history: "bg-amber-500",
  english: "bg-pink-500",
};
const SUBJECT_LIGHT: Record<string, string> = {
  physics: "bg-sky-100 text-sky-700",
  chemistry: "bg-emerald-100 text-emerald-700",
  mathematics: "bg-violet-100 text-violet-700",
  maths: "bg-violet-100 text-violet-700",
  biology: "bg-teal-100 text-teal-700",
  history: "bg-amber-100 text-amber-700",
  english: "bg-pink-100 text-pink-700",
};
function subjectBar(s: string) {
  return SUBJECT_COLORS[s.toLowerCase()] ?? "bg-gray-400";
}
function subjectBadge(s: string) {
  return SUBJECT_LIGHT[s.toLowerCase()] ?? "bg-gray-100 text-gray-600";
}

const PRIORITY_DOT: Record<string, string> = {
  high: "bg-rose-500",
  medium: "bg-amber-400",
  low: "bg-emerald-400",
};

/* ── Activity Bar ── */
const ActivityBar = ({ day }: { day: DayActivity }) => {
  const isToday = day.date === new Date().toISOString().slice(0, 10);
  const heightPct = day.total > 0 ? Math.max(20, day.pct) : 4;
  const color =
    day.total === 0
      ? "bg-gray-100"
      : day.pct === 100
        ? "bg-emerald-400"
        : day.pct >= 50
          ? "bg-violet-400"
          : "bg-rose-300";

  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <div className="w-full flex items-end justify-center h-14">
        <div
          className={`w-full rounded-t-sm transition-all duration-500 ${color} ${isToday ? "ring-2 ring-violet-400 ring-offset-1" : ""}`}
          style={{ height: `${heightPct}%` }}
          title={
            day.total > 0 ? `${day.completed}/${day.total} done` : "No tasks"
          }
        />
      </div>
      <span
        className={`text-[10px] font-semibold ${isToday ? "text-violet-600" : "text-gray-400"}`}
      >
        {day.day}
      </span>
    </div>
  );
};

/* ── Skeleton ── */
const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

/* ── Main Dashboard ── */
export const Dashboard = () => {
  const { userData } = useAuthContext();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    if (!userData?.id) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/api/dashboard", { user_id: userData.id });
      if (res.data.success) setData(res.data.data);
      else setError(res.data.message || "Failed to load dashboard");
    } catch {
      setError("Network error. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, [userData?.id]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  /* ── Loading ── */
  if (loading)
    return (
      <div className="min-h-screen bg-gray-50/60 py-8">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-56 mb-2" />
          <Skeleton className="h-4 w-40 mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Skeleton className="h-48 md:col-span-2" />
            <Skeleton className="h-48" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );

  /* ── Error ── */
  if (error)
    return (
      <div className="min-h-screen bg-gray-50/60 flex items-center justify-center p-5">
        <div className="bg-white rounded-2xl border border-red-100 p-8 text-center max-w-sm w-full">
          <FiAlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <p className="text-gray-700 font-bold mb-1">Failed to load</p>
          <p className="text-gray-400 text-sm mb-5">{error}</p>
          <button
            onClick={fetchDashboard}
            className="px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  /* ── No plans yet ── */
  if (!data || data.overview.total === 0)
    return (
      <div className="min-h-screen bg-gray-50/60 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-black text-gray-900 mb-1">Dashboard</h1>
          <p className="text-gray-500 text-sm mb-8">Your study overview</p>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4">
              <FiBarChart2 className="w-8 h-8 text-violet-400" />
            </div>
            <p className="text-gray-700 font-bold text-lg">No data yet</p>
            <p className="text-gray-400 text-sm mt-1 mb-6">
              Create a study plan to start tracking your progress.
            </p>
            <Link
              to="/ai-planner"
              className="inline-flex items-center gap-2 bg-linear-to-r from-violet-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity shadow-lg shadow-violet-200"
            >
              <FiZap className="w-4 h-4" /> Create Study Plan
            </Link>
          </div>
        </div>
      </div>
    );

  const {
    overview,
    streak,
    today,
    upcoming,
    last_14_days,
    subject_progress,
    weekly_comparison,
  } = data;
  const weekDiff = weekly_comparison.this_week - weekly_comparison.last_week;
  const todayPct =
    today.total > 0 ? Math.round((today.completed / today.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50/60 py-8">
      <div className="container mx-auto px-4">
        {/* ── Header ── */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-full px-3 py-1 mb-2">
            <FiCalendar className="w-3.5 h-3.5 text-violet-500" />
            <span className="text-violet-700 text-xs font-semibold">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          <h1 className="text-3xl font-black text-gray-900">
            {greeting()}, {userData?.first_name?.split(" ")[0] ?? "Student"} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Here's your study overview
          </p>
        </div>

        {/* ── Overview Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Completion % */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
                <FiTarget className="w-4.5 h-4.5 text-violet-600" />
              </div>
              <span className="text-2xl font-black text-violet-600">
                {overview.completion_pct}%
              </span>
            </div>
            <p className="text-xs font-bold text-gray-700">Overall Progress</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {overview.completed}/{overview.total} tasks
            </p>
            <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-linear-to-r from-violet-500 to-indigo-500 transition-all duration-700"
                style={{ width: `${overview.completion_pct}%` }}
              />
            </div>
          </div>

          {/* Streak */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                <FiZap className="w-4.5 h-4.5 text-amber-500" />
              </div>
              <span className="text-2xl font-black text-amber-500">
                {streak.current}
              </span>
            </div>
            <p className="text-xs font-bold text-gray-700">Day Streak 🔥</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Best: {streak.longest} days
            </p>
            <div className="mt-2 flex gap-0.5">
              {Array.from({ length: 7 }).map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                const dStr = d.toISOString().slice(0, 10);
                const active = last_14_days.find((x) => x.date === dStr);
                return (
                  <div
                    key={i}
                    className={`flex-1 h-1.5 rounded-full ${active && active.completed > 0 ? "bg-amber-400" : "bg-gray-100"}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Backlog */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
                <FiAlertCircle className="w-4.5 h-4.5 text-rose-500" />
              </div>
              <span className="text-2xl font-black text-rose-500">
                {overview.backlog}
              </span>
            </div>
            <p className="text-xs font-bold text-gray-700">Backlog Tasks</p>
            <p className="text-xs text-gray-400 mt-0.5">Missed & pending</p>
            <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-rose-400 transition-all duration-700"
                style={{
                  width: overview.total
                    ? `${Math.min(100, Math.round((overview.backlog / overview.total) * 100))}%`
                    : "0%",
                }}
              />
            </div>
          </div>

          {/* Weekly comparison */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                <FiTrendingUp className="w-4.5 h-4.5 text-emerald-600" />
              </div>
              <div className="flex items-center gap-1">
                {weekDiff > 0 ? (
                  <FiArrowUp className="w-3.5 h-3.5 text-emerald-500" />
                ) : weekDiff < 0 ? (
                  <FiArrowDown className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <FiMinus className="w-3.5 h-3.5 text-gray-400" />
                )}
                <span
                  className={`text-2xl font-black ${weekDiff > 0 ? "text-emerald-600" : weekDiff < 0 ? "text-rose-500" : "text-gray-500"}`}
                >
                  {weekly_comparison.this_week}
                </span>
              </div>
            </div>
            <p className="text-xs font-bold text-gray-700">This Week</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Last week: {weekly_comparison.last_week}
              {weekDiff !== 0 && (
                <span
                  className={
                    weekDiff > 0 ? " text-emerald-500" : " text-rose-400"
                  }
                >
                  {" "}
                  {weekDiff > 0 ? `+${weekDiff}` : weekDiff}
                </span>
              )}
            </p>
            <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-700"
                style={{
                  width:
                    weekly_comparison.last_week > 0
                      ? `${Math.min(100, Math.round((weekly_comparison.this_week / weekly_comparison.last_week) * 100))}%`
                      : weekly_comparison.this_week > 0
                        ? "100%"
                        : "0%",
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Activity + Today ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* 14-day activity chart */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-black text-gray-800">
                  Activity — Last 14 Days
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Daily task completion
                </p>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-semibold text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />{" "}
                  100%
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-violet-400 inline-block" />{" "}
                  Partial
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-300 inline-block" />{" "}
                  {"<50%"}
                </span>
              </div>
            </div>
            <div className="flex items-end gap-1.5 h-20">
              {last_14_days.map((day) => (
                <ActivityBar key={day.date} day={day} />
              ))}
            </div>
          </div>

          {/* Today's summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-black text-gray-800">Today</h2>
              <span className="text-xs font-bold text-violet-600 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full">
                {today.completed}/{today.total} done
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-3">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "short",
              })}
            </p>

            {today.total === 0 ? (
              <div className="flex flex-col items-center justify-center h-24 text-center">
                <span className="text-2xl mb-1">🎉</span>
                <p className="text-xs font-semibold text-gray-500">
                  No tasks today
                </p>
              </div>
            ) : (
              <>
                {/* Progress ring — simple bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progress</span>
                    <span className="font-bold text-violet-600">
                      {todayPct}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-violet-500 to-indigo-500 transition-all duration-700"
                      style={{ width: `${todayPct}%` }}
                    />
                  </div>
                </div>

                {/* Today task list — max 4 */}
                <div className="flex flex-col gap-1.5">
                  {today.tasks.slice(0, 4).map((t) => (
                    <div
                      key={t.id}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs ${
                        t.status === "completed"
                          ? "bg-emerald-50 border-emerald-100"
                          : t.status === "skipped"
                            ? "bg-gray-50 border-gray-100 opacity-60"
                            : "bg-gray-50 border-gray-100"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${PRIORITY_DOT[t.priority] ?? "bg-gray-300"}`}
                      />
                      <span className="flex-1 truncate font-medium text-gray-700">
                        {t.topic}
                      </span>
                      {t.status === "completed" ? (
                        <FiCheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                      ) : t.status === "skipped" ? (
                        <FiSkipForward className="w-3 h-3 text-gray-400 shrink-0" />
                      ) : (
                        <FiClock className="w-3 h-3 text-gray-300 shrink-0" />
                      )}
                    </div>
                  ))}
                  {today.tasks.length > 4 && (
                    <p className="text-[10px] text-gray-400 text-center pt-0.5">
                      +{today.tasks.length - 4} more
                    </p>
                  )}
                </div>
              </>
            )}

            <Link
              to="/tasks"
              className="mt-3 flex items-center justify-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-800 transition-colors"
            >
              View all tasks →
            </Link>
          </div>
        </div>

        {/* ── Subject Progress + Upcoming ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Subject progress */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
                <FiBarChart2 className="w-4 h-4 text-violet-600" />
              </div>
              <div>
                <h2 className="text-sm font-black text-gray-800">
                  Subject Progress
                </h2>
                <p className="text-xs text-gray-400">Completion by subject</p>
              </div>
            </div>

            {subject_progress.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">
                No data yet
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {subject_progress.map((s) => (
                  <div key={s.subject}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${subjectBadge(s.subject)}`}
                        >
                          {s.subject}
                        </span>
                        <span className="text-xs text-gray-400">
                          {s.hours_studied}h studied
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                          {s.completed}/{s.total}
                        </span>
                        <span className="text-xs font-black text-gray-700 w-8 text-right">
                          {s.pct}%
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${subjectBar(s.subject)}`}
                        style={{ width: `${s.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming tasks */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                <FiCalendar className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-sm font-black text-gray-800">
                  Upcoming Tasks
                </h2>
                <p className="text-xs text-gray-400">Next 5 scheduled days</p>
              </div>
            </div>

            {upcoming.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FiCheckCircle className="w-8 h-8 text-emerald-300 mb-2" />
                <p className="text-xs font-semibold text-gray-500">
                  All caught up!
                </p>
                <p className="text-xs text-gray-400">
                  No upcoming tasks scheduled
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {upcoming.map((day) => (
                  <div
                    key={day.date}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                  >
                    <div className="shrink-0 text-center">
                      <p className="text-xs font-black text-gray-800">
                        {new Date(day.date + "T00:00:00").toLocaleDateString(
                          "en-IN",
                          { day: "numeric" },
                        )}
                      </p>
                      <p className="text-[10px] text-gray-400 uppercase">
                        {new Date(day.date + "T00:00:00").toLocaleDateString(
                          "en-IN",
                          { month: "short" },
                        )}
                      </p>
                    </div>
                    <div className="w-px h-8 bg-gray-200 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        {day.subjects.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${subjectBadge(s)}`}
                          >
                            {s}
                          </span>
                        ))}
                        {day.subjects.length > 3 && (
                          <span className="text-[10px] text-gray-400">
                            +{day.subjects.length - 3}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400">
                        <span>{day.count} tasks</span>
                        <span>·</span>
                        <span>{formatMins(day.total_minutes)}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-indigo-500 shrink-0">
                      {formatDate(day.date)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <Link
              to="/tasks"
              className="mt-3 flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              View full schedule →
            </Link>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <FiCheckCircle className="w-4.5 h-4.5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900">
                {overview.completed}
              </p>
              <p className="text-xs text-gray-400 font-semibold">Completed</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
              <FiSkipForward className="w-4.5 h-4.5 text-gray-500" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900">
                {overview.skipped}
              </p>
              <p className="text-xs text-gray-400 font-semibold">Skipped</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
              <FiAward className="w-4.5 h-4.5 text-violet-600" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900">
                {overview.plans_count}
              </p>
              <p className="text-xs text-gray-400 font-semibold">Study Plans</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
