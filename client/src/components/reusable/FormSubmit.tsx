import { useNavigate } from "react-router-dom";

type props = {
  isLogin: boolean;
  disabled: boolean;
};

export const FormSubmit = ({ isLogin, disabled }: props) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    if (isLogin) navigate("/register");
    else navigate("/login");
  };

  return (
    <div>
      <button
        type="submit"
        disabled={disabled}
        className="w-full py-3 bg-linear-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-violet-200 hover:opacity-90 hover:-translate-y-0.5 transition-all duration-300 mt-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
      >
        {disabled
          ? isLogin
            ? "Logging in…"
            : "Registering…"
          : `${isLogin ? "Login" : "Register"} to Eduvia →`}
      </button>
      <p className="text-center text-gray-500 text-sm mt-3">
        {isLogin ? "Don't" : "Already"} have an account?{" "}
        <span
          onClick={handleNavigate}
          className="text-violet-600 font-semibold hover:underline cursor-pointer"
        >
          {isLogin ? "Sign up" : "Login"}
        </span>
      </p>
    </div>
  );
};
