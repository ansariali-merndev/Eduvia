import { useEffect, useRef, useState } from "react";

const plans = [
  {
    name: "Free",
    price: { monthly: 0, yearly: 0 },
    description: "Perfect to get started with smart studying.",
    color: "border-gray-200",
    badge: null,
    buttonStyle: "border border-violet-600 text-violet-600 hover:bg-violet-50",
    features: [
      { text: "AI Study Planner (3 plans/month)", included: true },
      { text: "Task Manager (up to 20 tasks)", included: true },
      { text: "Study Progress Dashboard", included: true },
      { text: "PDF Notes Upload (up to 5 files)", included: true },
      { text: "Basic AI Notes Generator", included: true },
      { text: "Daily Study Streak", included: true },
      { text: "AI Notes Summarization", included: false },
      { text: "Auto Rescheduling", included: false },
      { text: "Smart Revision Reminders", included: false },
      { text: "AI Doubt Solver", included: false },
      { text: "Google Calendar Sync", included: false },
      { text: "Priority Support", included: false },
    ],
  },
  {
    name: "Pro",
    price: { monthly: 299, yearly: 199 },
    description: "For serious students who want the full Eduvia experience.",
    color: "border-violet-500",
    badge: "Most Popular",
    buttonStyle:
      "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:opacity-90 shadow-lg shadow-violet-200",
    features: [
      { text: "Unlimited AI Study Plans", included: true },
      { text: "Unlimited Tasks", included: true },
      { text: "Advanced Progress Dashboard", included: true },
      { text: "Unlimited PDF Notes Upload", included: true },
      { text: "AI Notes Generator", included: true },
      { text: "AI Notes Summarization", included: true },
      { text: "Auto Rescheduling", included: true },
      { text: "Study Streak & Achievements", included: true },
      { text: "Smart Revision Reminders", included: true },
      { text: "AI Doubt Solver", included: false },
      { text: "Google Calendar Sync", included: false },
      { text: "Priority Support", included: false },
    ],
  },
  {
    name: "Elite",
    price: { monthly: 599, yearly: 399 },
    description: "For toppers who want every edge to crush their exams.",
    color: "border-amber-400",
    badge: "Best Value",
    buttonStyle:
      "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90 shadow-lg shadow-amber-200",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "AI Doubt Solver (Unlimited)", included: true },
      { text: "Custom Study Goals", included: true },
      { text: "Google Calendar Sync", included: true },
      { text: "Weekly Performance Reports", included: true },
      { text: "Advanced Analytics", included: true },
      { text: "Early Access to New Features", included: true },
      { text: "Study Streak & Achievements", included: true },
      { text: "Priority Support", included: true },
      { text: "Unlimited AI Notes Generation", included: true },
      { text: "Unlimited PDF Uploads", included: true },
      { text: "Smart Revision Reminders", included: true },
    ],
  },
];

const CheckIcon = ({ ok }: { ok: boolean }) =>
  ok ? (
    <svg
      className="w-4 h-4 text-violet-500 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ) : (
    <svg
      className="w-4 h-4 text-gray-300 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );

export const Pricing = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [yearly, setYearly] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 },
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-gray-50/60 py-24 px-4 overflow-hidden"
    >
      {/* Header */}

      <div
        className={`text-center mb-12 transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <h2 className="text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
          Invest in your{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-600 to-indigo-500">
            future
          </span>
        </h2>

        <p className="text-gray-500 text-lg mt-4">
          Start free, upgrade when you're ready. No hidden fees.
        </p>

        {/* Toggle */}

        <div className="inline-flex items-center gap-3 mt-7 bg-white border border-gray-200 rounded-full px-2 py-1.5 shadow-sm">
          <button
            onClick={() => setYearly(false)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
              !yearly
                ? "bg-violet-600 text-white shadow"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Monthly
          </button>

          <button
            onClick={() => setYearly(true)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
              yearly
                ? "bg-violet-600 text-white shadow"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Yearly
            <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-bold">
              Save 33%
            </span>
          </button>
        </div>
      </div>

      {/* Cards */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {plans.map((plan, i) => (
          <div
            key={plan.name}
            className={`relative bg-white rounded-2xl border-2 ${plan.color} p-7 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-lg ${
              plan.name === "Pro" ? "md:-mt-4 md:pb-11" : ""
            } ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            {plan.badge && (
              <div
                className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold shadow-sm ${
                  plan.name === "Pro"
                    ? "bg-violet-600 text-white"
                    : "bg-amber-400 text-white"
                }`}
              >
                {plan.badge}
              </div>
            )}

            <p className="text-gray-500 text-sm font-semibold mb-1">
              {plan.name}
            </p>

            <div className="flex items-end gap-1 mb-1">
              <span className="text-4xl font-black text-gray-900">
                {plan.price.monthly === 0
                  ? "Free"
                  : `₹${yearly ? plan.price.yearly : plan.price.monthly}`}
              </span>

              {plan.price.monthly !== 0 && (
                <span className="text-gray-400 text-sm mb-1">/mo</span>
              )}
            </div>

            {yearly && plan.price.monthly !== 0 && (
              <p className="text-emerald-600 text-xs font-semibold mb-1">
                Billed ₹{plan.price.yearly * 12}/year
              </p>
            )}

            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              {plan.description}
            </p>

            <button
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:-translate-y-0.5 mb-7 ${plan.buttonStyle}`}
            >
              {plan.price.monthly === 0
                ? "Get Started Free"
                : `Get ${plan.name}`}{" "}
              →
            </button>

            <div className="border-t border-gray-100 mb-5" />

            <ul className="flex flex-col gap-3">
              {plan.features.map((f) => (
                <li key={f.text} className="flex items-center gap-2.5">
                  <CheckIcon ok={f.included} />
                  <span
                    className={`text-sm ${
                      f.included ? "text-gray-700" : "text-gray-400"
                    }`}
                  >
                    {f.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};
