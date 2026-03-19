import { useEffect, useRef, useState } from "react";
import Marquee from "react-fast-marquee";

const testimonials = [
  {
    name: "Aarav Sharma",
    role: "JEE Aspirant, Class 12",
    avatar: "AS",
    color: "bg-violet-500",
    rating: 5,
    text: "Eduvia's AI planner organized my entire JEE preparation schedule. Earlier everything felt scattered, but now my daily study plan is crystal clear.",
  },
  {
    name: "Priya Mehta",
    role: "NEET Student, Delhi",
    avatar: "PM",
    color: "bg-pink-500",
    rating: 5,
    text: "The AI notes summarization feature is my favorite. It's perfect for revision — turning 10 pages of notes into a short and clear summary.",
  },
  {
    name: "Rohan Verma",
    role: "B.Tech 2nd Year, VIT",
    avatar: "RV",
    color: "bg-blue-500",
    rating: 5,
    text: "The task manager combined with the Pomodoro timer is amazing. My productivity has literally doubled compared to before.",
  },
  {
    name: "Sneha Kapoor",
    role: "CA Foundation Student",
    avatar: "SK",
    color: "bg-emerald-500",
    rating: 5,
    text: "The auto-rescheduling feature is the best. If I miss a day, Eduvia automatically adjusts my schedule — completely stress free.",
  },
  {
    name: "Karan Patel",
    role: "UPSC Aspirant, Pune",
    avatar: "KP",
    color: "bg-amber-500",
    rating: 5,
    text: "UPSC syllabus is huge, but Eduvia breaks it down subject-wise and makes it much more manageable. It's a real game changer.",
  },
  {
    name: "Ananya Singh",
    role: "Class 10, CBSE Board",
    avatar: "AN",
    color: "bg-rose-500",
    rating: 4,
    text: "I used to feel anxious before board exams, but Eduvia's streak system and progress tracking boosted my confidence a lot.",
  },
  {
    name: "Vikram Nair",
    role: "MBA Entrance Prep",
    avatar: "VN",
    color: "bg-indigo-500",
    rating: 5,
    text: "For CAT preparation, Eduvia identified my weak areas and created a targeted study plan. My score improved significantly.",
  },
  {
    name: "Riya Joshi",
    role: "12th Science, Mumbai",
    avatar: "RJ",
    color: "bg-teal-500",
    rating: 5,
    text: "Even my mom is impressed because now I study on my own without constant reminders. Eduvia is awesome!",
  },
];

const StarRating = ({ count }: { count: number }) => (
  <div className="flex gap-0.5">
    {[...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < count ? "text-amber-400" : "text-gray-200"}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const TestimonialCard = ({ t }: { t: (typeof testimonials)[0] }) => (
  <div className="w-75 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mx-3">
    <StarRating count={t.rating} />
    <p className="text-gray-600 text-sm leading-relaxed mt-3 mb-4">
      "{t.text}"
    </p>

    <div className="flex items-center gap-3">
      <div
        className={`w-9 h-9 rounded-full ${t.color} text-white text-xs font-bold flex items-center justify-center`}
      >
        {t.avatar}
      </div>

      <div>
        <p className="text-gray-900 font-semibold text-sm">{t.name}</p>
        <p className="text-gray-400 text-xs">{t.role}</p>
      </div>
    </div>
  </div>
);

export const Testimonials = () => {
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

  const row1 = testimonials.slice(0, 4);
  const row2 = testimonials.slice(4, 8);

  return (
    <section ref={sectionRef} className="bg-white py-24 overflow-hidden">
      {/* Header */}

      <div
        className={`text-center px-4 mb-14 transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <h2 className="text-4xl lg:text-5xl font-black text-gray-900">
          Trusted by{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-600 to-indigo-500">
            50,000+ students
          </span>
        </h2>

        <p className="text-gray-500 text-lg mt-4 max-w-lg mx-auto">
          Real students, real results. Here's what they say about Eduvia.
        </p>
      </div>

      {/* Row 1 Left */}

      <Marquee
        speed={40}
        pauseOnHover
        gradient={true}
        gradientWidth={100}
        className="mb-6"
      >
        {row1.map((t, i) => (
          <TestimonialCard key={i} t={t} />
        ))}
      </Marquee>

      {/* Row 2 Right */}

      <Marquee
        speed={40}
        direction="right"
        pauseOnHover
        gradient={true}
        gradientWidth={100}
      >
        {row2.map((t, i) => (
          <TestimonialCard key={i} t={t} />
        ))}
      </Marquee>
    </section>
  );
};
