import { useEffect, useState, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  FiBook,
  FiTarget,
  FiRefreshCw,
  FiFileText,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiCalendar,
  FiChevronDown,
  FiZap,
  FiInbox,
  FiRotateCcw,
} from "react-icons/fi";
import { useAuthContext } from "../context/AuthContext";
import { api } from "../lib/axios";

type TaskStatus = "pending" | "completed" | "skipped";
type TaskType = "study" | "practice" | "revision" | "mock_test";
type Priority = "high" | "medium" | "low";
type FilterType = "all" | "today" | "pending" | "completed";

interface Task {
  id: number;
  plan_id: number;
  subject: string;
  topic: string;
  task_type: TaskType;
  priority: Priority;
  duration_minutes: number;
  description?: string;
  scheduled_date: string;
  day_number: number;
  week_number: number;
  status: TaskStatus;
}
interface DayGroup {
  date: string;
  day_number: number;
  week_number: number;
  tasks: Task[];
}
interface Plan {
  plan_id: number;
  plan_title: string;
  deadline: string;
  subjects: string[];
  stats: { total: number; completed: number; missed: number };
}
interface SubjectTasksMeta {
  total_days: number;
  page: number;
  has_more: boolean;
}
interface LocationState {
  planId?: number;
  tasksCreated?: number;
  strategy?: string;
  totalDays?: number;
}

const TYPE_CONFIG: Record<
  TaskType,
  {
    icon: React.ReactNode;
    label: string;
    color: string;
    descBg: string;
    descBorder: string;
    iconBg: string;
  }
> = {
  study: {
    icon: <FiBook className="w-3 h-3" />,
    label: "Study",
    color: "bg-blue-50 text-blue-600 border-blue-100",
    descBg: "bg-blue-50/50",
    descBorder: "border-blue-100",
    iconBg: "bg-blue-500",
  },
  practice: {
    icon: <FiTarget className="w-3 h-3" />,
    label: "Practice",
    color: "bg-violet-50 text-violet-600 border-violet-100",
    descBg: "bg-violet-50/50",
    descBorder: "border-violet-100",
    iconBg: "bg-violet-500",
  },
  revision: {
    icon: <FiRefreshCw className="w-3 h-3" />,
    label: "Revision",
    color: "bg-amber-50 text-amber-600 border-amber-100",
    descBg: "bg-amber-50/50",
    descBorder: "border-amber-100",
    iconBg: "bg-amber-500",
  },
  mock_test: {
    icon: <FiFileText className="w-3 h-3" />,
    label: "Mock Test",
    color: "bg-rose-50 text-rose-600 border-rose-100",
    descBg: "bg-rose-50/50",
    descBorder: "border-rose-100",
    iconBg: "bg-rose-500",
  },
};

const PRIORITY_DOT: Record<Priority, string> = {
  high: "bg-rose-500",
  medium: "bg-amber-400",
  low: "bg-emerald-400",
};

const SUBJECT_COLORS: Record<string, string> = {
  physics: "bg-blue-100 text-blue-700 border-blue-200",
  chemistry: "bg-emerald-100 text-emerald-700 border-emerald-200",
  mathematics: "bg-violet-100 text-violet-700 border-violet-200",
  maths: "bg-violet-100 text-violet-700 border-violet-200",
  biology: "bg-teal-100 text-teal-700 border-teal-200",
  history: "bg-amber-100 text-amber-700 border-amber-200",
  english: "bg-pink-100 text-pink-700 border-pink-200",
};

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "pending", label: "Pending" },
  { key: "completed", label: "Completed" },
];

const ALL_PLANS = 0;

function getSubjectColor(subject: string) {
  return (
    SUBJECT_COLORS[subject.toLowerCase()] ??
    "bg-gray-100 text-gray-700 border-gray-200"
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatDuration(mins: number) {
  const h = Math.floor(mins / 60),
    m = mins % 60;
  if (!h) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function isPastOrToday(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d.getTime() <= today.getTime();
}

/* ── TaskCard ── */
const TaskCard = ({
  task,
  onStatusChange,
}: {
  task: Task;
  onStatusChange: (id: number, s: TaskStatus) => void;
}) => {
  const [descExpanded, setDescExpanded] = useState(false);
  const [notesToast, setNotesToast] = useState(false);

  const typeConf = TYPE_CONFIG[task.task_type] ?? TYPE_CONFIG.study;
  const isDone = task.status === "completed";
  const isSkipped = task.status === "skipped";
  const canAct = isPastOrToday(task.scheduled_date);

  const handleNotes = () => {
    setNotesToast(true);
    setTimeout(() => setNotesToast(false), 2000);
  };

  return (
    <div
      className={`rounded-xl border transition-all duration-200 ${
        isDone
          ? "bg-gray-50 border-gray-100 opacity-60"
          : isSkipped
            ? "bg-gray-50 border-dashed border-gray-200 opacity-60"
            : "bg-white border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5"
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getSubjectColor(task.subject)}`}
              >
                {task.subject}
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${typeConf.color}`}
              >
                {typeConf.icon} {typeConf.label}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[task.priority]}`}
                />
                {task.priority}
              </span>
            </div>

            {/* Topic */}
            <p
              className={`text-sm font-semibold text-gray-900 leading-snug mb-2 ${isDone ? "line-through text-gray-400" : ""}`}
            >
              {task.topic}
            </p>

            {/* Duration & Day */}
            <div className="flex items-center gap-1 text-gray-400 mb-3">
              <FiClock className="w-3.5 h-3.5" />
              <span className="text-xs">
                {formatDuration(task.duration_minutes)}
              </span>
              <span className="text-xs text-gray-300 mx-1">·</span>
              <span className="text-xs">Day {task.day_number}</span>
            </div>

            {/* AI Description — collapsible */}
            {task.description && (
              <div
                className={`mb-3 rounded-lg border ${typeConf.descBorder} ${typeConf.descBg}`}
              >
                <div className="px-3 py-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 ${typeConf.iconBg}`}
                    >
                      <FiZap className="w-2 h-2 text-white" />
                    </span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      AI Study Guide
                    </span>
                  </div>
                  <p
                    className={`text-xs text-gray-600 leading-relaxed ${descExpanded ? "" : "line-clamp-3"}`}
                  >
                    {task.description}
                  </p>
                  <button
                    type="button"
                    onClick={() => setDescExpanded((p) => !p)}
                    className="cursor-pointer mt-1 text-[11px] font-semibold text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {descExpanded ? "Show less ↑" : "Read more ↓"}
                  </button>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleNotes}
                type="button"
                className={`cursor-pointer text-xs px-3 py-1.5 rounded-lg border flex items-center gap-1.5 font-semibold transition-all ${
                  notesToast
                    ? "bg-violet-600 text-white border-violet-600"
                    : "bg-violet-50 text-violet-600 border-violet-200 hover:bg-violet-100"
                }`}
              >
                <FiFileText className="w-3 h-3" />
                {notesToast ? "Coming soon! 🚀" : "Generate Notes"}
              </button>

              <button
                onClick={() =>
                  canAct &&
                  onStatusChange(task.id, isDone ? "pending" : "completed")
                }
                type="button"
                disabled={!canAct}
                className={`text-xs px-3 py-1.5 rounded-lg border flex items-center gap-1.5 font-semibold transition-all ${
                  !canAct
                    ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                    : isDone
                      ? "cursor-pointer bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"
                      : "cursor-pointer bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                }`}
              >
                <FiCheckCircle className="w-3 h-3" />
                {isDone ? "Completed" : "Mark Complete"}
              </button>

              <button
                onClick={() =>
                  canAct &&
                  onStatusChange(task.id, isSkipped ? "pending" : "skipped")
                }
                type="button"
                disabled={!canAct}
                className={`text-xs px-3 py-1.5 rounded-lg border flex items-center gap-1.5 font-semibold transition-all ${
                  !canAct
                    ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                    : isSkipped
                      ? "cursor-pointer bg-amber-500 text-white border-amber-500 hover:bg-amber-600"
                      : "cursor-pointer bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <FiRotateCcw className="w-3 h-3" />
                {isSkipped ? "Undo Skip" : "Skip"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Skeleton ── */
const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
    <div className="flex gap-3">
      <div className="flex-1">
        <div className="flex gap-2 mb-2">
          <div className="h-5 w-16 rounded-full bg-gray-200" />
          <div className="h-5 w-14 rounded-full bg-gray-200" />
        </div>
        <div className="h-4 w-3/4 rounded bg-gray-200 mb-2" />
        <div className="h-3 w-20 rounded bg-gray-100 mb-3" />
        <div className="h-14 w-full rounded-lg bg-gray-100 mb-3" />
        <div className="flex gap-2">
          <div className="h-7 w-28 rounded-lg bg-gray-200" />
          <div className="h-7 w-28 rounded-lg bg-gray-200" />
        </div>
      </div>
    </div>
  </div>
);

/* ── Main Page ── */
export const Tasks = () => {
  const { userData } = useAuthContext();
  const location = useLocation();
  const successState = (location.state as LocationState) ?? null;

  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number>(ALL_PLANS);
  const [filter, setFilter] = useState<FilterType>("all");
  const [allDays, setAllDays] = useState<DayGroup[]>([]);
  const [taskMeta, setTaskMeta] = useState<SubjectTasksMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [showBanner, setShowBanner] = useState(!!successState?.planId);

  const fetchPlans = useCallback(async () => {
    if (!userData?.id) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/api/tasks", { user_id: userData.id });
      if (res.data.success) {
        setPlans(res.data.data as Plan[]);
      } else {
        setError(res.data.message || "Failed to load plans");
      }
    } catch {
      setError("Network error. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, [userData?.id]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const fetchTasks = useCallback(
    async (page = 1, append = false) => {
      if (!userData?.id) return;
      if (append) {
        setLoadingMore(true);
      } else {
        setTasksLoading(true);
      }
      try {
        const body: Record<string, unknown> = {
          user_id: userData.id,
          page,
          filter,
        };
        if (selectedPlanId !== ALL_PLANS) body.plan_id = selectedPlanId;
        const res = await api.post("/api/tasks/subject", body);
        if (res.data.success) {
          const { days, ...meta }: { days: DayGroup[] } & SubjectTasksMeta =
            res.data.data;
          setTaskMeta(meta);
          setAllDays((prev) => (append ? [...prev, ...days] : days));
        }
      } catch {
        /* silent */
      } finally {
        setTasksLoading(false);
        setLoadingMore(false);
      }
    },
    [userData?.id, selectedPlanId, filter],
  );

  useEffect(() => {
    setAllDays([]);
    setTaskMeta(null);
    fetchTasks(1, false);
  }, [fetchTasks]);

  const handleStatusChange = async (taskId: number, status: TaskStatus) => {
    setAllDays((prev) =>
      prev.map((day) => ({
        ...day,
        tasks: day.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
      })),
    );
    try {
      await api.patch(`/api/tasks/${taskId}/status`, {
        status,
        user_id: userData?.id,
      });
    } catch {
      fetchTasks(1, false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/60 py-8">
        <div className="container mx-auto px-4">
          <div className="h-9 w-48 bg-gray-200 rounded-xl animate-pulse mb-3" />
          <div className="h-4 w-64 bg-gray-100 rounded animate-pulse mb-8" />
          <div className="h-11 w-64 bg-gray-200 rounded-xl animate-pulse mb-5" />
          <div className="flex gap-2 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-9 w-24 rounded-full bg-gray-200 animate-pulse"
              />
            ))}
          </div>
          <div className="flex flex-col gap-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/60 flex items-center justify-center p-5">
        <div className="bg-white rounded-2xl border border-red-100 p-8 text-center max-w-sm w-full">
          <FiAlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <p className="text-gray-700 font-bold text-base mb-1">
            Failed to load
          </p>
          <p className="text-gray-400 text-sm mb-5">{error}</p>
          <button
            onClick={fetchPlans}
            className="px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/60 py-8">
      <div className="container mx-auto px-4">
        {/* Success Banner */}
        {showBanner && successState && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 mb-6 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <FiZap className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-emerald-800 font-bold text-sm">
                  Study Plan Generated! 🎉
                </p>
                <p className="text-emerald-600 text-xs mt-0.5">
                  <strong>{successState.tasksCreated}</strong> tasks ·{" "}
                  <strong>{successState.strategy}</strong> strategy ·{" "}
                  <strong>{successState.totalDays}</strong> days
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowBanner(false)}
              className="text-emerald-400 hover:text-emerald-600 text-xl font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
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
            <h1 className="text-3xl font-black text-gray-900">My Tasks</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Stay consistent. One day at a time. 💪
            </p>
          </div>
        </div>

        {plans.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <FiInbox className="w-14 h-14 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-700 font-bold text-lg">
              No study plans yet!
            </p>
            <p className="text-gray-400 text-sm mt-1 mb-6">
              Generate a study plan to get your personalized schedule.
            </p>
            <Link
              to="/ai-planner"
              className="inline-flex items-center gap-2 bg-linear-to-r from-violet-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity shadow-lg shadow-violet-200"
            >
              <FiZap className="w-4 h-4" /> Create Study Plan
            </Link>
          </div>
        ) : (
          <>
            {/* Plan selector */}
            <div className="mb-5">
              <div className="relative w-full sm:w-80">
                <select
                  value={selectedPlanId}
                  onChange={(e) => {
                    setSelectedPlanId(Number(e.target.value));
                    setFilter("all");
                  }}
                  className="cursor-pointer w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-semibold text-gray-800 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all shadow-sm"
                >
                  <option value={ALL_PLANS}>All Plans</option>
                  {plans.map((plan) => (
                    <option key={plan.plan_id} value={plan.plan_id}>
                      {plan.plan_title}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Filter tabs — original */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={`cursor-pointer px-4 py-2.5 text-sm font-bold border-b-2 transition-all whitespace-nowrap -mb-px ${
                    filter === f.key
                      ? "border-violet-600 text-violet-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {tasksLoading ? (
              <div className="flex flex-col gap-3">
                {[0, 1, 2, 3, 4].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : allDays.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <FiInbox className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-semibold text-sm">
                  No tasks found
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  {filter === "pending"
                    ? "No missed tasks — you're on track! 🎉"
                    : filter === "completed"
                      ? "No completed tasks yet"
                      : filter === "today"
                        ? "No tasks scheduled for today"
                        : "Create a study plan to get started"}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                {allDays.map((day) => {
                  const done = day.tasks.filter(
                    (t) => t.status === "completed",
                  ).length;
                  const total = day.tasks.length;
                  return (
                    <div key={day.date}>
                      {/* Day header — original */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                          <FiCalendar className="w-3.5 h-3.5 text-violet-500" />
                        </div>
                        <span className="text-sm font-bold text-gray-800">
                          {formatDate(day.date)}
                        </span>
                        <span className="text-xs text-gray-400">
                          · Day {day.day_number} · Wk {day.week_number}
                        </span>
                        <span className="ml-auto text-xs font-semibold text-violet-600 bg-violet-50 border border-violet-100 px-2.5 py-0.5 rounded-full shrink-0">
                          {done}/{total} done
                        </span>
                      </div>

                      <div className="flex flex-col gap-2.5 pl-4 border-l-2 border-violet-100 ml-3">
                        {day.tasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onStatusChange={handleStatusChange}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}

                {taskMeta?.has_more && (
                  <button
                    type="button"
                    onClick={() => fetchTasks((taskMeta.page ?? 1) + 1, true)}
                    disabled={loadingMore}
                    className="cursor-pointer w-full py-3.5 bg-white border border-violet-200 text-violet-600 font-bold rounded-2xl text-sm hover:bg-violet-50 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loadingMore ? (
                      <>
                        <FiRefreshCw className="w-4 h-4 animate-spin" />{" "}
                        Loading...
                      </>
                    ) : (
                      <>
                        <FiChevronDown className="w-4 h-4" /> See More
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
