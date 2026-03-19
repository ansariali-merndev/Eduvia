import { useEffect, useRef } from "react";
import { TypeAnimation } from "react-type-animation";
import hero from "../../assets/hero.jpg";
import { useAuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { userData } = useAuthContext();

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(24px)";
    requestAnimationFrame(() => {
      el.style.transition = "opacity 0.8s ease, transform 0.8s ease";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
  }, []);

  return (
    <section className="relative bg-white overflow-hidden flex items-center">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-50 -left-50 w-150 h-150 rounded-full bg-violet-100/50 blur-[120px]" />
        <div className="absolute -bottom-37.5 -right-25 w-125 h-125 rounded-full bg-indigo-100/40 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div
        ref={heroRef}
        className="relative pt-10 pb-20 grid lg:grid-cols-2 gap-16 items-center"
      >
        {/* ── LEFT CONTENT ── */}
        <div className="flex flex-col gap-7">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-full px-4 py-1.5 w-fit">
            <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
            <span className="text-violet-700 text-sm font-medium tracking-wide">
              AI-Powered Study Planner
            </span>
          </div>

          {/* Headline with Typewriter */}
          <h1 className="text-5xl lg:text-[64px] font-black leading-[1.05] tracking-tight text-gray-900">
            <TypeAnimation
              sequence={[
                "Study Smarter, Not Harder",
                2000,
                "Study Faster with AI Mentor",
                2000,
                "Study Better, Achieve More",
                2000,
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
              className="text-violet-600"
            />
          </h1>

          {/* Subtext */}
          <p className="text-gray-600 text-lg leading-relaxed max-w-md">
            AI-powered study planner that creates and adapts your personalized
            learning schedule, helping you stay on track and improve faster.
          </p>

          {/* CTA Button */}
          <div className="flex flex-wrap gap-4 mt-1">
            <button
              onClick={() => {
                navigate(userData ? "/dashboard" : "/login");
              }}
              className="group relative px-8 py-4 cursor-pointer bg-linear-to-r from-violet-600 to-indigo-600 rounded-xl text-white font-semibold text-base shadow-lg shadow-violet-200 hover:shadow-violet-300 transition-all duration-300 hover:-translate-y-0.5"
            >
              Get Started Free →
            </button>
          </div>
        </div>

        {/* ── RIGHT VISUAL ── */}
        <img className="rounded-md" src={hero} alt="hero" />
      </div>
    </section>
  );
};
