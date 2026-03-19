import React, { useState } from "react";
import {
  FiMail,
  FiBookOpen,
  FiTarget,
  FiArrowLeft,
  FiHash,
} from "react-icons/fi";
import { Navigate, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { CustomInput } from "../components/reusable/CustomInput";
import { PasswordInput } from "../components/reusable/PasswordInput";
import { FormSubmit } from "../components/reusable/FormSubmit";
import { useAuthContext } from "../context/AuthContext";
import { api } from "../lib/axios";
import { handleAlert } from "../lib/swal";
import { cardOrbit, iconBubbles } from "../lib/lib";

type View = "login" | "forgot" | "verify_otp" | "reset_password";

const initLogin = { email: "", password: "" };
const initForgot = { email: "" };
const initVerifyOtp = { otp: "" };
const initResetPass = { new_password: "", confirm_password: "" };

export const Login = () => {
  const [view, setView] = useState<View>("login");
  const [isLoading, setIsLoading] = useState(false);

  const [loginData, setLoginData] = useState(initLogin);
  const [forgotData, setForgotData] = useState(initForgot);
  const [verifyData, setVerifyData] = useState(initVerifyOtp);
  const [resetData, setResetData] = useState(initResetPass);

  const [forgotEmail, setForgotEmail] = useState("");
  const [resetToken, setResetToken] = useState("");

  const { setUserData, userData } = useAuthContext();
  const navigate = useNavigate();

  if (userData) return <Navigate to="/dashboard" />;

  // ─── Change handlers ────────────────────────────────────────────────────────
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setLoginData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleForgotChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForgotData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleVerifyChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setVerifyData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleResetChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setResetData((p) => ({ ...p, [e.target.name]: e.target.value }));

  // ─── Submit handlers ────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    try {
      const res = await api.post("/auth/login", loginData);
      if (!res.data.success) {
        handleAlert(res.data.message, "info");
        return;
      }
      setUserData(res.data.user);
      handleAlert(res.data.message, "success");
      navigate("/dashboard");
    } catch (err) {
      handleAlert(
        err instanceof AxiosError
          ? err.response?.data?.message || "Login failed."
          : "",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    try {
      const res = await api.patch("/auth/forgot-password", forgotData);
      handleAlert(res.data.message, res.data.success ? "success" : "info");
      if (res.data.success) {
        setForgotEmail(forgotData.email);
        setView("verify_otp");
      }
    } catch (err) {
      handleAlert(
        err instanceof AxiosError
          ? err.response?.data?.message || "Something went wrong."
          : "",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    try {
      const res = await api.patch("/auth/verify-forgot-otp", {
        email: forgotEmail,
        otp: verifyData.otp,
      });
      handleAlert(res.data.message, res.data.success ? "success" : "info");
      if (res.data.success) {
        setResetToken(res.data.reset_token);
        setView("reset_password");
      }
    } catch (err) {
      handleAlert(
        err instanceof AxiosError
          ? err.response?.data?.message || "Invalid OTP."
          : "",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    try {
      const res = await api.patch("/auth/reset-password", {
        reset_token: resetToken,
        new_password: resetData.new_password,
        confirm_password: resetData.confirm_password,
      });
      handleAlert(res.data.message, res.data.success ? "success" : "info");
      if (res.data.success) {
        setForgotData(initForgot);
        setVerifyData(initVerifyOtp);
        setResetData(initResetPass);
        setForgotEmail("");
        setResetToken("");
        setView("login");
      }
    } catch (err) {
      handleAlert(
        err instanceof AxiosError
          ? err.response?.data?.message || "Reset failed."
          : "",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Step meta ──────────────────────────────────────────────────────────────
  const stepMeta: Record<View, { title: string; sub: string; back?: View }> = {
    login: {
      title: "Welcome back",
      sub: "Login to continue your study journey.",
    },
    forgot: {
      title: "Forgot password?",
      sub: "Enter your email and we'll send you an OTP.",
      back: "login",
    },
    verify_otp: {
      title: "Verify OTP",
      sub: `Enter the 6-digit code sent to ${forgotEmail}`,
      back: "forgot",
    },
    reset_password: {
      title: "Reset password",
      sub: "Choose a strong new password.",
      back: "verify_otp",
    },
  };

  const meta = stepMeta[view];

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Blobs */}
      <div
        className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-violet-200/50 blur-3xl pointer-events-none"
        style={{ animation: "blob1 7s ease-in-out infinite" }}
      />
      <div
        className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-indigo-200/50 blur-3xl pointer-events-none"
        style={{ animation: "blob1 8s ease-in-out infinite reverse" }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-fuchsia-100/40 blur-3xl pointer-events-none"
        style={{ animation: "blob1 10s ease-in-out infinite 2s" }}
      />
      <div
        className="absolute top-10 right-1/3 w-48 h-48 rounded-full bg-sky-100/50 blur-2xl pointer-events-none"
        style={{ animation: "blob1 6s ease-in-out infinite 1s" }}
      />

      {/* Floating dots */}
      {[
        {
          size: "w-3 h-3",
          pos: "top-[15%] left-[20%]",
          color: "bg-violet-300/50",
          delay: "0s",
          dur: "4s",
        },
        {
          size: "w-4 h-4",
          pos: "top-[30%] left-[15%]",
          color: "bg-indigo-300/40",
          delay: "1s",
          dur: "5s",
        },
        {
          size: "w-2 h-2",
          pos: "top-[55%] left-[18%]",
          color: "bg-fuchsia-400/40",
          delay: "0.5s",
          dur: "3.5s",
        },
        {
          size: "w-5 h-5",
          pos: "top-[75%] left-[22%]",
          color: "bg-sky-300/40",
          delay: "1.5s",
          dur: "6s",
        },
        {
          size: "w-3 h-3",
          pos: "top-[12%] right-[22%]",
          color: "bg-emerald-300/50",
          delay: "0.3s",
          dur: "4.5s",
        },
        {
          size: "w-4 h-4",
          pos: "top-[48%] right-[18%]",
          color: "bg-pink-300/40",
          delay: "0.9s",
          dur: "5.5s",
        },
        {
          size: "w-2 h-2",
          pos: "top-[70%] right-[25%]",
          color: "bg-amber-300/50",
          delay: "0.7s",
          dur: "3s",
        },
        {
          size: "w-6 h-6",
          pos: "top-[85%] right-[20%]",
          color: "bg-violet-200/50",
          delay: "1.2s",
          dur: "7s",
        },
      ].map((c, i) => (
        <div
          key={i}
          className={`absolute ${c.size} ${c.pos} ${c.color} rounded-full pointer-events-none hidden sm:block`}
          style={{
            animation: `floatY ${c.dur} ease-in-out infinite`,
            animationDelay: c.delay,
          }}
        />
      ))}

      {iconBubbles.map(({ Icon, color, bg, size, box, pos, delay, dur }, i) => (
        <div
          key={i}
          className={`absolute ${pos} ${box} ${bg} rounded-2xl items-center justify-center shadow-sm pointer-events-none hidden lg:flex`}
          style={{
            animation: `floatY ${dur} ease-in-out infinite`,
            animationDelay: delay,
          }}
        >
          <Icon className={`${size} ${color}`} />
        </div>
      ))}

      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #7c3aed 1.5px, transparent 1.5px)",
          backgroundSize: "30px 30px",
        }}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background:
              "conic-gradient(from 0deg, #7c3aed22, #6366f144, #a855f722, #7c3aed22)",
            animation: "spinRing 8s linear infinite",
            filter: "blur(18px)",
            transform: "scale(1.08)",
          }}
        />
        <div
          className="absolute inset-0 rounded-2xl bg-violet-400/10 pointer-events-none"
          style={{ animation: "pulseGlow 3s ease-in-out infinite" }}
        />

        {cardOrbit.map(({ Icon, color, bg, pos, delay, dur }, i) => (
          <div
            key={i}
            className={`absolute ${pos} w-9 h-9 ${bg} border border-white rounded-xl flex items-center justify-center shadow-md pointer-events-none z-20`}
            style={{
              animation: `floatY ${dur} ease-in-out infinite`,
              animationDelay: delay,
            }}
          >
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
        ))}

        <div className="relative bg-white rounded-2xl shadow-md border border-gray-100 p-8">
          {/* Back button */}
          {meta.back && (
            <button
              type="button"
              onClick={() => !isLoading && setView(meta.back!)}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-600 transition-colors mb-4 cursor-pointer disabled:pointer-events-none"
            >
              <FiArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
          )}

          {/* Heading */}
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-gray-900">{meta.title}</h1>
            <FiBookOpen className="w-6 h-6 text-violet-500 shrink-0" />
          </div>
          <div className="flex items-center gap-1.5 mb-7">
            <FiTarget className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <p className="text-gray-500 text-sm">{meta.sub}</p>
          </div>

          {/* LOGIN */}
          {view === "login" && (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <CustomInput
                label="Email Address"
                value={loginData.email}
                onChange={handleLoginChange}
                name="email"
                placeholder="you@example.com"
                Icon={FiMail}
                type="email"
              />
              <div>
                <PasswordInput
                  value={loginData.password}
                  onChange={handleLoginChange}
                />
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setView("forgot")}
                  className="text-violet-600 text-xs font-semibold hover:underline text-end w-full cursor-pointer mt-1 disabled:pointer-events-none disabled:opacity-50"
                >
                  Forgot password?
                </button>
              </div>
              <FormSubmit isLogin={true} disabled={isLoading} />
            </form>
          )}

          {/* FORGOT PASSWORD */}
          {view === "forgot" && (
            <form onSubmit={handleForgot} className="flex flex-col gap-4">
              <CustomInput
                label="Email Address"
                value={forgotData.email}
                onChange={handleForgotChange}
                name="email"
                placeholder="you@example.com"
                Icon={FiMail}
                type="email"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer"
              >
                {isLoading ? "Sending OTP…" : "Send OTP"}
              </button>
            </form>
          )}

          {/* VERIFY OTP */}
          {view === "verify_otp" && (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
              <CustomInput
                label="6-digit OTP"
                value={verifyData.otp}
                onChange={handleVerifyChange}
                name="otp"
                placeholder="••••••"
                Icon={FiHash}
                type="text"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer"
              >
                {isLoading ? "Verifying…" : "Verify OTP"}
              </button>
            </form>
          )}

          {/* RESET PASSWORD */}
          {view === "reset_password" && (
            <form
              onSubmit={handleResetPassword}
              className="flex flex-col gap-4"
            >
              <PasswordInput
                value={resetData.new_password}
                onChange={handleResetChange}
                name="new_password"
                label="New Password"
                placeholder="Min. 8 characters"
              />
              <PasswordInput
                value={resetData.confirm_password}
                onChange={handleResetChange}
                name="confirm_password"
                label="Confirm Password"
                placeholder="Repeat new password"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer"
              >
                {isLoading ? "Resetting…" : "Reset Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
