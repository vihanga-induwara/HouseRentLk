import { twMerge } from "tailwind-merge";
import { forwardRef } from "react";
import { Check, X } from "lucide-react";

const Input = forwardRef(({
    label,
    error,
    success,
    className,
    id,
    type = "text",
    ...props
}, ref) => {
    return (
        <div className="w-full relative">
            {label && (
                <label htmlFor={id} className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    ref={ref}
                    id={id}
                    type={type}
                    className={twMerge(
                        "block w-full rounded-xl border-slate-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-4 py-3 border transition-all text-slate-800 placeholder:text-slate-400 bg-white hover:border-slate-300",
                        error && "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500",
                        success && !error && "border-green-300 focus:border-green-500 focus:ring-green-500",
                        (error || success) && "pr-10",
                        className
                    )}
                    {...props}
                />
                {error && <X className="absolute right-3 top-[50%] -translate-y-[50%] h-5 w-5 text-red-500 pointer-events-none" />}
                {success && !error && <Check className="absolute right-3 top-[50%] -translate-y-[50%] h-5 w-5 text-green-500 pointer-events-none" />}
            </div>
            {error && <p className="mt-1.5 text-sm text-red-600 ml-1">{error}</p>}
        </div>
    );
});

Input.displayName = "Input";

export default Input;
