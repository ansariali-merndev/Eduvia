import React, { useState, useRef, useEffect } from "react";
import { FiX, FiShield, FiRefreshCw, FiMail } from "react-icons/fi";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { api } from "../../lib/axios";
import { handleAlert } from "../../lib/swal";

type Props = {
  email: string;
  onClose: () => void;
};

export const OtpModal = ({ email, onClose }: Props) => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { setUserData } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value.slice(-1);
    setOtp(updated);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const updated = [...otp];
    pasted.split("").forEach((char, i) => {
      updated[i] = char;
    });
    setOtp(updated);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      handleAlert("Please enter all 6 digits.", "info");
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.post("/auth/verify-otp", { email, otp: otpCode });

      if (!res.data.success) {
        handleAlert(res.data.message, "info");
        return;
      }

      setUserData(res.data.user);
      handleAlert(res.data.message, "success");
      navigate("/dashboard");
    } catch (err) {
      if (err instanceof AxiosError) {
        handleAlert(
          err.response?.data?.message || "Verification failed.",
          "error",
        );
      } else {
        handleAlert("Something went wrong.", "error");
      }
      setOtp(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      const res = await api.post("/auth/resend-otp", { email });

      if (!res.data.success) {
        handleAlert(res.data.message, "info");
        return;
      }

      handleAlert(res.data.message, "success");
      setCountdown(60);
      setOtp(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    } catch (err) {
      if (err instanceof AxiosError) {
        handleAlert(
          err.response?.data?.message || "Failed to resend OTP.",
          "error",
        );
      } else {
        handleAlert("", "error");
      }
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 w-full max-w-sm z-10"
        style={{ animation: "modalIn 0.25s ease-out" }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <FiX className="w-4 h-4 text-gray-500" />
        </button>

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center mx-auto mb-5">
          <FiShield className="w-7 h-7 text-violet-500" />
        </div>

        {/* Heading */}
        <h2 className="text-xl font-black text-gray-900 text-center mb-1">
          Verify your email
        </h2>
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <FiMail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <p className="text-gray-500 text-sm">OTP sent to</p>
        </div>
        <p className="text-violet-600 font-semibold text-sm text-center mb-6 truncate px-4">
          {email}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* OTP inputs */}
          <div className="flex gap-2 justify-center" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={`w-11 h-12 text-center text-xl font-black border rounded-xl outline-none transition-all duration-200
                  ${
                    digit
                      ? "border-violet-500 bg-violet-50 text-violet-700"
                      : "border-gray-200 text-gray-900"
                  }
                  focus:border-violet-500 focus:ring-2 focus:ring-violet-100`}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 cursor-pointer bg-linear-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-violet-200 hover:opacity-90 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Verifying..." : "Verify Email →"}
          </button>
        </form>

        {/* Resend */}
        <div className="flex items-center justify-center gap-1.5 mt-4">
          <p className="text-gray-500 text-sm">Didn't receive it?</p>
          {countdown > 0 ? (
            <span className="text-gray-400 text-sm font-semibold">
              Resend in {countdown}s
            </span>
          ) : (
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="text-violet-600 cursor-pointer text-sm font-semibold hover:underline flex items-center gap-1 disabled:opacity-50"
            >
              <FiRefreshCw
                className={`w-3.5 h-3.5 ${resendLoading ? "animate-spin" : ""}`}
              />
              Resend
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};
