import { useEffect, useState } from "react";
import { FiZap } from "react-icons/fi";

const MESSAGES = [
  "Eduvia AI is crafting your study plan...",
  "Analyzing your subjects and topics...",
  "Mapping tasks across your deadline...",
  "Balancing your daily study hours...",
  "Almost there, hang tight!",
];

export const GeneratingModal = ({ isOpen }: { isOpen: boolean }) => {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % MESSAGES.length);
        setFade(true);
      }, 350);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes gradientRotate {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes floatUp {
          0%   { opacity: 0; transform: translateY(16px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0px) scale(1); }
        }
        @keyframes orb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(12px, -10px) scale(1.08); }
        }
        @keyframes orb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(-10px, 8px) scale(1.06); }
        }
        @keyframes pulseRing {
          0%   { transform: scale(0.85); opacity: 0.6; }
          70%  { transform: scale(1.3);  opacity: 0; }
          100% { transform: scale(0.85); opacity: 0; }
        }
        @keyframes spinnerRotate {
          to { transform: rotate(360deg); }
        }
        .modal-card {
          animation: floatUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .spinner-ring {
          animation: spinnerRotate 0.9s linear infinite;
        }
        .pulse-ring {
          animation: pulseRing 1.8s ease-out infinite;
        }
        .orb-1 { animation: orb1 4s ease-in-out infinite; }
        .orb-2 { animation: orb2 5s ease-in-out infinite; }
      `}</style>

      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center px-5"
        style={{
          backgroundColor: "rgba(15, 10, 30, 0.55)",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* Card */}
        <div
          className="modal-card relative w-full max-w-[320px] rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #1e1530 0%, #16112a 100%)",
            boxShadow:
              "0 32px 80px rgba(109, 40, 217, 0.35), 0 0 0 1px rgba(139,92,246,0.2)",
          }}
        >
          {/* Ambient glow orbs */}
          <div
            className="orb-1 absolute -top-10 -left-10 w-40 h-40 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)",
            }}
          />
          <div
            className="orb-2 absolute -bottom-10 -right-10 w-36 h-36 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)",
            }}
          />

          {/* Thin top border glow */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(167,139,250,0.6), transparent)",
            }}
          />

          {/* Content */}
          <div className="relative flex flex-col items-center gap-6 px-8 py-10">
            {/* Spinner with pulse ring */}
            <div className="relative flex items-center justify-center w-16 h-16">
              {/* Pulse ring */}
              <span
                className="pulse-ring absolute w-16 h-16 rounded-full"
                style={{ border: "2px solid rgba(139,92,246,0.5)" }}
              />
              {/* Spinner track */}
              <svg
                className="spinner-ring absolute w-16 h-16"
                viewBox="0 0 64 64"
                fill="none"
              >
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="rgba(139,92,246,0.15)"
                  strokeWidth="3"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="url(#spinGrad)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="60 116"
                />
                <defs>
                  <linearGradient
                    id="spinGrad"
                    x1="0"
                    y1="0"
                    x2="64"
                    y2="64"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Center icon */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                }}
              >
                <FiZap className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Label + Message */}
            <div className="flex flex-col items-center gap-1.5 text-center">
              <span
                className="text-[10px] font-bold tracking-[0.2em] uppercase"
                style={{ color: "rgba(167,139,250,0.7)" }}
              >
                Eduvia AI
              </span>
              <p
                className="text-sm font-medium leading-snug transition-all duration-300"
                style={{
                  color: "rgba(237,233,254,0.9)",
                  opacity: fade ? 1 : 0,
                  transform: fade ? "translateY(0)" : "translateY(6px)",
                }}
              >
                {MESSAGES[index]}
              </p>
            </div>

            {/* Progress dots */}
            <div className="flex gap-1.5">
              {MESSAGES.map((_, i) => (
                <span
                  key={i}
                  className="rounded-full transition-all duration-500"
                  style={{
                    width: i === index ? "20px" : "6px",
                    height: "6px",
                    background:
                      i === index
                        ? "linear-gradient(90deg, #8b5cf6, #6366f1)"
                        : "rgba(139,92,246,0.25)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
