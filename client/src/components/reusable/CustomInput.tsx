import type { IconType } from "react-icons";

type Props = {
  label: string;
  Icon: IconType;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
};

export const CustomInput = ({
  label,
  Icon,
  type,
  placeholder,
  value,
  onChange,
  name,
}: Props) => {
  return (
    <div>
      <label className="text-gray-700 text-sm font-semibold mb-1.5 block">
        {label}
      </label>

      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4">
          {<Icon />}
        </span>

        <input
          type={type}
          placeholder={placeholder}
          value={value}
          name={name}
          required
          onChange={onChange}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
        />
      </div>
    </div>
  );
};
