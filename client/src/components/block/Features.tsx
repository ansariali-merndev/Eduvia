import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper/modules";
import {
  FiCpu,
  FiBarChart2,
  FiCheckCircle,
  FiFileText,
  FiRepeat,
} from "react-icons/fi";

const features = [
  {
    icon: <FiCpu className="w-8 h-8 text-violet-500" />,
    title: "AI Study Planner",
    description:
      "Enter your exam date and syllabus — AI instantly builds a day-by-day personalized study schedule that adapts as you progress.",
    tag: "Most Popular",
    tagColor: "bg-violet-100 text-violet-700",
    border: "hover:border-violet-300",
    glow: "hover:shadow-violet-100",
  },
  {
    icon: <FiBarChart2 className="w-8 h-8 text-blue-500" />,
    title: "Progress Tracking",
    description:
      "Visual dashboards show your daily study hours, subject-wise coverage, and streak data so you always know where you stand.",
    tag: "Insights",
    tagColor: "bg-blue-100 text-blue-700",
    border: "hover:border-blue-300",
    glow: "hover:shadow-blue-100",
  },
  {
    icon: <FiCheckCircle className="w-8 h-8 text-emerald-500" />,
    title: "Smart Task Manager",
    description:
      "Auto-prioritize tasks by deadline and difficulty. Built-in Pomodoro timer keeps you focused and productive every session.",
    tag: "Productivity",
    tagColor: "bg-emerald-100 text-emerald-700",
    border: "hover:border-emerald-300",
    glow: "hover:shadow-emerald-100",
  },
  {
    icon: <FiFileText className="w-8 h-8 text-amber-500" />,
    title: "AI-Powered Notes",
    description:
      "Write notes with a rich editor, organize by subject, and hit 'AI Summarize' to get crisp revision-ready summaries instantly.",
    tag: "Smart",
    tagColor: "bg-amber-100 text-amber-700",
    border: "hover:border-amber-300",
    glow: "hover:shadow-amber-100",
  },
  {
    icon: <FiRepeat className="w-8 h-8 text-rose-500" />,
    title: "Auto Rescheduling",
    description:
      "Miss a session? No stress. Eduvia automatically shifts your plan and redistributes missed topics without losing your goal.",
    tag: "Adaptive",
    tagColor: "bg-rose-100 text-rose-700",
    border: "hover:border-rose-300",
    glow: "hover:shadow-rose-100",
  },
];

export const Features = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

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
    <section ref={sectionRef} className="bg-white py-24 px-4 overflow-hidden">
      {/* Section Header */}
      <div
        className={`text-center mb-16 transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <h2 className="text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
          Everything you need to{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-600 to-indigo-500">
            study smarter
          </span>
        </h2>
        <p className="text-gray-500 text-lg mt-4 max-w-xl mx-auto leading-relaxed">
          Eduvia combines AI planning, smart tracking, and focused tools — all
          in one place built for serious students.
        </p>
      </div>

      {/* Features Slider with Autoplay */}
      <Swiper
        modules={[Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        breakpoints={{
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop={true}
      >
        {features.map((f, i) => (
          <SwiperSlide key={f.title}>
            <div
              className={`group relative bg-white border border-gray-100 rounded-2xl p-6 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-lg ${f.border} ${f.glow} ${
                visible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl w-12 h-12 flex items-center justify-center bg-gray-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  {f.icon}
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${f.tagColor}`}
                >
                  {f.tag}
                </span>
              </div>
              <h3 className="text-gray-900 font-bold text-lg mb-2">
                {f.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {f.description}
              </p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};
