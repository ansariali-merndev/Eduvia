import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiCalendar,
  FiClock,
  FiBook,
  FiPlus,
  FiTrash2,
  FiZap,
  FiRefreshCw,
  FiTarget,
  FiFileText,
  FiAlertCircle,
} from "react-icons/fi";
import { useAuthContext } from "../context/AuthContext";
import { api } from "../lib/axios";
import { AxiosError } from "axios";
import { handleAlert } from "../lib/swal";
import { GeneratingModal } from "../components/block/Generatingmodal";

type Subject = {
  id: number;
  name: string;
  topics: string;
  description: string;
};

const DIFFICULTIES = [
  {
    label: "Easy",
    value: "easy",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  {
    label: "Medium",
    value: "medium",
    color: "bg-amber-100 text-amber-700 border-amber-200",
  },
  {
    label: "Hard",
    value: "hard",
    color: "bg-rose-100 text-rose-700 border-rose-200",
  },
];

const BOARDS = ["CBSE", "ICSE", "State Board", "Other University"];
const STREAMS = [
  "Science (PCM)",
  "Science (PCB)",
  "Commerce",
  "Arts",
  "Engineering",
  "Medical",
  "Other",
];
const CLASSES = [
  "9th",
  "10th",
  "11th",
  "12th",
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "Other",
];
const MIN_HOURS = ["1", "2", "3"];
const MAX_HOURS = ["3", "4", "5", "6", "7", "8", "9", "10"];

// ── Select Field ─────────────────────────────────────────
const SelectField = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  error?: string;
}) => (
  <div>
    <label className="text-gray-700 text-sm font-semibold mb-1.5 block">
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-3.5 py-2.5 border rounded-xl text-sm text-gray-900 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-white appearance-none ${
        error ? "border-red-400 ring-2 ring-red-100" : "border-gray-200"
      }`}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
    {error && (
      <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
        <FiAlertCircle className="w-3 h-3" /> {error}
      </p>
    )}
  </div>
);

const initialSubjects: Subject[] = [
  { id: 1, name: "", topics: "", description: "" },
];

// ── Main Component ────────────────────────────────────────
export const AIPlanner = () => {
  const navigate = useNavigate();
  const { userData } = useAuthContext();

  const [planTitle, setPlanTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [classVal, setClassVal] = useState("");
  const [stream, setStream] = useState("");
  const [board, setBoard] = useState("");
  const [minHours, setMinHours] = useState("1");
  const [maxHours, setMaxHours] = useState("5");
  const [difficulty, setDifficulty] = useState("medium");
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = (key: string) =>
    setErrors((prev) => {
      const n = { ...prev };
      delete n[key];
      return n;
    });

  const addSubject = () =>
    setSubjects((p) => [
      ...p,
      { id: Date.now(), name: "", topics: "", description: "" },
    ]);

  const removeSubject = (id: number) =>
    setSubjects((p) => p.filter((s) => s.id !== id));

  const updateSubject = (
    id: number,
    field: keyof Omit<Subject, "id">,
    val: string,
  ) => {
    setSubjects((p) =>
      p.map((s) => (s.id === id ? { ...s, [field]: val } : s)),
    );
    clearError(`subj-${id}-${field}`);
  };

  const resetForm = () => {
    setPlanTitle("");
    setDeadline("");
    setClassVal("");
    setStream("");
    setBoard("");
    setMinHours("1");
    setMaxHours("5");
    setDifficulty("medium");
    setSubjects(initialSubjects);
    setErrors({});
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  const handleGenerate = async () => {
    const newErrors: Record<string, string> = {};

    if (!planTitle.trim()) newErrors.planTitle = "Please fill in Plan Title";
    if (!deadline) newErrors.deadline = "Please select a deadline";
    if (!classVal) newErrors.classVal = "Please select Class / Year";
    if (!stream) newErrors.stream = "Please select Stream";
    if (!board) newErrors.board = "Please select Board / University";
    if (parseInt(minHours) >= parseInt(maxHours))
      newErrors.maxHours = "Max hours must be greater than Min hours";

    subjects.forEach((s) => {
      if (!s.name.trim())
        newErrors[`subj-${s.id}-name`] = "Please fill Subject name";
      if (!s.topics.trim())
        newErrors[`subj-${s.id}-topics`] = "Please fill Topics";
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    try {
      const res = await api.post("/api/generate-plan", {
        planTitle,
        deadline,
        classVal,
        stream,
        board,
        minHours,
        maxHours,
        difficulty,
        subjects,
        user_id: userData?.id,
      });

      const data = res.data;

      if (data.success) {
        resetForm();
        navigate("/tasks", {
          state: {
            planId: data.data.plan_id,
            tasksCreated: data.data.tasks_created,
            strategy: data.data.strategy,
            totalDays: data.data.total_days,
          },
        });
      } else {
        setErrors({
          api: data.message || "Something went wrong. Please try again.",
        });
      }
    } catch (err) {
      if (err instanceof AxiosError)
        handleAlert(err.response?.data.message, "error");
      else handleAlert("", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/60 py-8">
      <div className="container mx-auto px-5">
        <GeneratingModal isOpen={isLoading} />
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-full px-3 py-1 mb-3">
            <FiZap className="w-3.5 h-3.5 text-violet-500" />
            <span className="text-violet-700 text-xs font-semibold">
              AI Study Planner
            </span>
          </div>
          <h1 className="text-3xl font-black text-gray-900">
            Build your preparation plan
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Fill in your details and Eduvia AI will create a smart day-by-day
            study schedule.
          </p>
        </div>

        <div className="flex flex-col gap-5 w-full">
          {/* Plan Details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
                <FiTarget className="w-4 h-4 text-violet-500" />
              </div>
              <h2 className="text-gray-900 font-bold text-base">
                Plan Details
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-700 text-sm font-semibold mb-1.5 block">
                  Plan Title
                </label>
                <input
                  value={planTitle}
                  onChange={(e) => {
                    setPlanTitle(e.target.value);
                    clearError("planTitle");
                  }}
                  placeholder="e.g. JEE 2025 Preparation"
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all ${
                    errors.planTitle
                      ? "border-red-400 ring-2 ring-red-100"
                      : "border-gray-200"
                  }`}
                />
                {errors.planTitle && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <FiAlertCircle className="w-3 h-3" /> {errors.planTitle}
                  </p>
                )}
              </div>
              <div>
                <label className="text-gray-700 text-sm font-semibold mb-1.5 block">
                  Preparation Deadline
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => {
                      setDeadline(e.target.value);
                      clearError("deadline");
                    }}
                    min={minDate}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm text-gray-900 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all ${
                      errors.deadline
                        ? "border-red-400 ring-2 ring-red-100"
                        : "border-gray-200"
                    }`}
                  />
                </div>
                {errors.deadline && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <FiAlertCircle className="w-3 h-3" /> {errors.deadline}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Academic Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center">
                <FiFileText className="w-4 h-4 text-sky-500" />
              </div>
              <h2 className="text-gray-900 font-bold text-base">
                Academic Info
              </h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <SelectField
                label="Class / Year"
                value={classVal}
                onChange={(v) => {
                  setClassVal(v);
                  clearError("classVal");
                }}
                options={CLASSES}
                placeholder="Select class"
                error={errors.classVal}
              />
              <SelectField
                label="Stream"
                value={stream}
                onChange={(v) => {
                  setStream(v);
                  clearError("stream");
                }}
                options={STREAMS}
                placeholder="Select stream"
                error={errors.stream}
              />
              <SelectField
                label="Board / University"
                value={board}
                onChange={(v) => {
                  setBoard(v);
                  clearError("board");
                }}
                options={BOARDS}
                placeholder="Select board"
                error={errors.board}
              />
            </div>
          </div>

          {/* Study Preferences */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                <FiClock className="w-4 h-4 text-blue-500" />
              </div>
              <h2 className="text-gray-900 font-bold text-base">
                Study Preferences
              </h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {/* Min Hours */}
              <div>
                <label className="text-gray-700 text-sm font-semibold mb-2 block">
                  Min hours / day
                </label>
                <div className="flex flex-wrap gap-2">
                  {MIN_HOURS.map((h) => (
                    <button
                      key={h}
                      onClick={() => {
                        setMinHours(h);
                        clearError("maxHours");
                      }}
                      className={`w-10 h-10 rounded-xl text-sm font-bold border transition-all ${
                        minHours === h
                          ? "bg-violet-600 text-white border-violet-600 shadow"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:border-violet-300"
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
              {/* Max Hours */}
              <div>
                <label className="text-gray-700 text-sm font-semibold mb-2 block">
                  Max hours / day
                </label>
                <div className="flex flex-wrap gap-2">
                  {MAX_HOURS.map((h) => (
                    <button
                      key={h}
                      onClick={() => {
                        setMaxHours(h);
                        clearError("maxHours");
                      }}
                      className={`w-10 h-10 rounded-xl text-sm font-bold border transition-all ${
                        maxHours === h
                          ? "bg-violet-600 text-white border-violet-600 shadow"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:border-violet-300"
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
                {errors.maxHours && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <FiAlertCircle className="w-3 h-3" /> {errors.maxHours}
                  </p>
                )}
              </div>
              {/* Difficulty */}
              <div>
                <label className="text-gray-700 text-sm font-semibold mb-2 block">
                  Difficulty Level
                </label>
                <div className="flex flex-col gap-2">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDifficulty(d.value)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border text-left transition-all ${
                        difficulty === d.value
                          ? d.color + " shadow-sm"
                          : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Subjects */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <FiBook className="w-4 h-4 text-emerald-500" />
                </div>
                <h2 className="text-gray-900 font-bold text-base">
                  Subjects & Topics
                </h2>
              </div>
              <button
                onClick={addSubject}
                className="flex items-center gap-1.5 text-violet-600 text-sm font-semibold hover:bg-violet-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <FiPlus className="w-4 h-4" /> Add Subject
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {subjects.map((s, i) => (
                <div
                  key={s.id}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-2.5"
                >
                  <div className="grid sm:grid-cols-2 gap-2.5">
                    <div>
                      <input
                        value={s.name}
                        onChange={(e) =>
                          updateSubject(s.id, "name", e.target.value)
                        }
                        placeholder={`Subject ${i + 1} (e.g. Physics)`}
                        className={`w-full px-3.5 py-2 border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-white ${
                          errors[`subj-${s.id}-name`]
                            ? "border-red-400 ring-2 ring-red-100"
                            : "border-gray-200"
                        }`}
                      />
                      {errors[`subj-${s.id}-name`] && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <FiAlertCircle className="w-3 h-3" />{" "}
                          {errors[`subj-${s.id}-name`]}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        value={s.topics}
                        onChange={(e) =>
                          updateSubject(s.id, "topics", e.target.value)
                        }
                        placeholder="Topics (e.g. Kinematics, Optics)"
                        className={`w-full px-3.5 py-2 border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-white ${
                          errors[`subj-${s.id}-topics`]
                            ? "border-red-400 ring-2 ring-red-100"
                            : "border-gray-200"
                        }`}
                      />
                      {errors[`subj-${s.id}-topics`] && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <FiAlertCircle className="w-3 h-3" />{" "}
                          {errors[`subj-${s.id}-topics`]}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={s.description}
                      onChange={(e) =>
                        updateSubject(s.id, "description", e.target.value)
                      }
                      placeholder="Description (optional) — e.g. weak in integration, need more practice"
                      className="flex-1 px-3.5 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-white"
                    />
                    {subjects.length > 1 && (
                      <button
                        onClick={() => removeSubject(s.id)}
                        className="w-9 h-9 rounded-lg bg-rose-50 text-rose-400 hover:bg-rose-100 flex items-center justify-center transition-colors shrink-0"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* API Error */}
          {errors.api && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm flex items-center gap-2">
              <FiAlertCircle className="w-4 h-4 shrink-0" /> {errors.api}
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-3.5 bg-linear-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-2xl text-sm shadow-lg shadow-violet-200 hover:opacity-90 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <FiRefreshCw className="w-4 h-4 animate-spin" />
                Eduvia AI is building your plan...
              </>
            ) : (
              <>
                <FiZap className="w-4 h-4" />
                Generate My Study Plan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
