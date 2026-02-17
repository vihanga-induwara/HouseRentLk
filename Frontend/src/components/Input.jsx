import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { forwardRef } from "react";

const Input = forwardRef(({
    label,
    error,
    className,
    id,
    type = "text",
    ...props
}, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label htmlFor={id} className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
                    {label}
                </label>
            )}
            <input
                ref={ref}
                id={id}
                type={type}
                className={twMerge(
                    "block w-full rounded-xl border-slate-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-4 py-3 border transition-all text-slate-800 placeholder:text-slate-400 bg-white hover:border-slate-300",
                    error && "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500",
                    className
                )}
                {...props}
            />
            {error && <p className="mt-1.5 text-sm text-red-600 ml-1">{error}</p>}
        </div>
    );
});

Input.displayName = "Input";

export default Input;
