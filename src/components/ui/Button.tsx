import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-valex text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-zinc-900 dark:focus-visible:ring-indigo-600",
                    {
                        "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm": variant === "default",
                        "bg-rose-500 text-white hover:bg-rose-600": variant === "destructive",
                        "border border-zinc-200 bg-white hover:bg-indigo-600/5 hover:border-indigo-600/30 hover:text-indigo-600 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50": variant === "outline",
                        "bg-indigo-600/10 text-indigo-600 hover:bg-indigo-600/20 dark:bg-indigo-600/20 dark:text-indigo-600 dark:hover:bg-indigo-600/30": variant === "secondary",
                        "hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50": variant === "ghost",
                        "text-indigo-600 underline-offset-4 hover:underline": variant === "link",
                        "h-10 px-4 py-2": size === "default",
                        "h-9 rounded-md px-3": size === "sm",
                        "h-11 rounded-md px-8": size === "lg",
                        "h-10 w-10": size === "icon",
                    },
                    className
                )}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
