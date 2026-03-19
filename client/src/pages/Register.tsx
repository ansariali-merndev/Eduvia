import React, { useState } from "react";
import { FiMail, FiUser, FiUserPlus, FiShield } from "react-icons/fi";
import { Navigate } from "react-router-dom";
import { AxiosError } from "axios";
import { CustomInput } from "../components/reusable/CustomInput";
import { PasswordInput } from "../components/reusable/PasswordInput";
import { FormSubmit } from "../components/reusable/FormSubmit";
import { useAuthContext } from "../context/AuthContext";
import { api } from "../lib/axios";
import { handleAlert } from "../lib/swal";
import { OtpModal } from "../components/reusable/Otpmodal";
import {
  registerCardOrbit,
  registerIconBubbles,
  registerSmallCircles,
} from "../lib/lib";

const initialValue = {
  firstname: "",
  lastname: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export const Register = () => {
  const [formdata, setFormdata] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [regEmail, setRegEmail] = useState("");
  const { userData } = useAuthContext();

  if (userData) return <Navigate to="/dashboard" />;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;
    setFormdata((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post("/auth/register", formdata);

      if (!res.data.success) {
        handleAlert(res.data.message, "info");
        return;
      }

      handleAlert(res.data.message, "success");
      setRegEmail(formdata.email);
      setShowOtp(true);
    } catch (err) {
      if (err instanceof AxiosError) {
        handleAlert(
          err.response?.data?.message || "Registration failed.",
          "error",
        );
      } else {
        handleAlert("Something went wrong.", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {showOtp && (
        <OtpModal email={regEmail} onClose={() => setShowOtp(false)} />
      )}

      <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12 relative overflow-hidden">
        <div
          className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-emerald-200/40 blur-3xl pointer-events-none"
          style={{ animation: "blob1 8s ease-in-out infinite" }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-violet-200/45 blur-3xl pointer-events-none"
          style={{ animation: "blob1 7s ease-in-out infinite reverse" }}
        />
        <div
          className="absolute top-1/3 right-0 w-56 h-56 rounded-full bg-sky-100/50 blur-2xl pointer-events-none"
          style={{ animation: "blob1 9s ease-in-out infinite 1s" }}
        />
        <div
          className="absolute bottom-1/3 left-0 w-48 h-48 rounded-full bg-fuchsia-100/40 blur-2xl pointer-events-none"
          style={{ animation: "blob1 6s ease-in-out infinite 2s" }}
        />

        {registerSmallCircles.map((c, i) => (
          <div
            key={i}
            className={`absolute ${c.size} ${c.pos} ${c.color} rounded-full pointer-events-none hidden sm:block`}
            style={{
              animation: `floatY ${c.dur} ease-in-out infinite`,
              animationDelay: c.delay,
            }}
          />
        ))}

        {registerIconBubbles.map(
          ({ Icon, color, bg, size, box, pos, delay, dur }, i) => (
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
          ),
        )}

        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, #10b981 1.5px, transparent 1.5px)",
            backgroundSize: "30px 30px",
          }}
        />

        <div className="relative z-10 w-full max-w-md">
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background:
                "conic-gradient(from 0deg, #10b98122, #6366f144, #a855f722, #10b98122)",
              animation: "spinRing 10s linear infinite",
              filter: "blur(18px)",
              transform: "scale(1.08)",
            }}
          />
          <div
            className="absolute inset-0 rounded-2xl bg-emerald-400/8 pointer-events-none"
            style={{ animation: "pulseGlow 3.5s ease-in-out infinite" }}
          />

          {registerCardOrbit.map(({ Icon, color, bg, pos, delay, dur }, i) => (
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

          <div
            className="absolute -left-8 top-1/3 w-2.5 h-2.5 rounded-full bg-emerald-400/50 pointer-events-none"
            style={{ animation: "floatY 3s ease-in-out infinite" }}
          />
          <div
            className="absolute -left-5 top-2/3 w-1.5 h-1.5 rounded-full bg-violet-400/40 pointer-events-none"
            style={{ animation: "floatY 4s ease-in-out infinite 0.6s" }}
          />
          <div
            className="absolute -right-8 top-1/4 w-2.5 h-2.5 rounded-full bg-sky-400/50 pointer-events-none"
            style={{ animation: "floatY 3.5s ease-in-out infinite 0.3s" }}
          />
          <div
            className="absolute -right-5 top-3/4 w-1.5 h-1.5 rounded-full bg-fuchsia-400/40 pointer-events-none"
            style={{ animation: "floatY 5s ease-in-out infinite 1s" }}
          />
          <div
            className="absolute left-1/4 -top-8 w-2 h-2 rounded-full bg-emerald-300/60 pointer-events-none"
            style={{ animation: "floatX 4s ease-in-out infinite" }}
          />
          <div
            className="absolute left-3/4 -top-6 w-1.5 h-1.5 rounded-full bg-indigo-300/50 pointer-events-none"
            style={{ animation: "floatX 3s ease-in-out infinite 0.8s" }}
          />
          <div
            className="absolute left-1/3 -bottom-8 w-2 h-2 rounded-full bg-violet-300/60 pointer-events-none"
            style={{ animation: "floatX 5s ease-in-out infinite 0.4s" }}
          />
          <div
            className="absolute left-2/3 -bottom-6 w-1.5 h-1.5 rounded-full bg-sky-300/50 pointer-events-none"
            style={{ animation: "floatX 4.5s ease-in-out infinite 1.2s" }}
          />

          <div className="relative bg-white rounded-2xl shadow-md border border-gray-100 p-8">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-black text-gray-900">
                Create account
              </h1>
              <FiUserPlus className="w-6 h-6 text-violet-500 shrink-0" />
            </div>
            <div className="flex items-center gap-1.5 mb-6">
              <FiShield className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <p className="text-gray-500 text-sm">
                Join 50,000+ students studying smarter.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <CustomInput
                  label="First Name"
                  value={formdata.firstname}
                  onChange={handleChange}
                  name="firstname"
                  placeholder="John"
                  Icon={FiUser}
                  type="text"
                />
                <CustomInput
                  label="Last Name"
                  value={formdata.lastname}
                  onChange={handleChange}
                  name="lastname"
                  placeholder="Doe"
                  Icon={FiUser}
                  type="text"
                />
              </div>
              <CustomInput
                label="Email Address"
                value={formdata.email}
                onChange={handleChange}
                name="email"
                placeholder="you@example.com"
                Icon={FiMail}
                type="email"
              />
              <PasswordInput
                value={formdata.password}
                onChange={handleChange}
              />
              <PasswordInput
                label="Confirm Password"
                name="confirmPassword"
                placeholder="Re-enter password"
                value={formdata.confirmPassword}
                onChange={handleChange}
              />
              <FormSubmit isLogin={false} disabled={isLoading} />
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
