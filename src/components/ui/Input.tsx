import * as React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", type = "text", value, onChange, ...props }, ref) => {
    const isControlled = value !== undefined;
    const valueProp = isControlled ? { value: value ?? "" } : {};

    return (
      <input
        ref={ref}
        type={type}
        {...valueProp}
        onChange={onChange}
        className={`
          w-full rounded-xl border border-slate-200 bg-white
          px-3.5 py-2.5
          text-xs font-semibold text-slate-800
          placeholder:text-slate-400
          shadow-2xs
          focus:border-indigo-600
          focus:ring-2
          focus:ring-indigo-500/20
          outline-hidden
          transition-all
          ${className}
        `}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;