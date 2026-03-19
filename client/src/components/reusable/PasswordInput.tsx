import { useState } from "react";
import { FiLock, FiEye, FiEyeOff } from "react-icons/fi";

type Props = {
  label?: string;
  placeholder?: string;
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export const PasswordInput = ({
  label = "Password",
  name = "password",
  placeholder = "********",
  value,
  onChange,
}: Props) => {
  const [showPass, setShowPass] = useState(false);

  return (
    <div>
      <label className="text-gray-700 text-sm font-semibold mb-1.5 block">
        {label}
      </label>

      <div className="relative">
        <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />

        <input
          type={showPass ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          name={name}
          onChange={onChange}
          className="w-full pl-10 pr-11 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
        />

        <button
          type="button"
          onClick={() => setShowPass(!showPass)}
          className="absolute cursor-pointer right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {showPass ? (
            <FiEyeOff className="w-4 h-4" />
          ) : (
            <FiEye className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};
