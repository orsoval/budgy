import * as React from "react"
import { motion, type HTMLMotionProps } from "framer-motion"
import { cn } from "../../lib/utils"

export interface ButtonProps
    extends Omit<HTMLMotionProps<"button">, "ref"> {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", children, ...props }, ref) => {
        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                    "relative overflow-hidden inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background group",
                    {
                        "bg-primary text-white hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 shadow-md border-0": variant === "default",
                        "bg-danger text-white hover:bg-danger/90 hover:shadow-[0_8px_20px_rgba(255,107,107,0.3)] shadow-md": variant === "destructive",
                        "border border-zinc-200 dark:border-white/10 bg-transparent hover:bg-zinc-100 dark:hover:bg-white/5": variant === "outline",
                        "bg-primary/10 text-primary hover:bg-primary/20 hover:shadow-[0_4px_12px_rgba(108,92,231,0.1)]": variant === "secondary",
                        "hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-300": variant === "ghost",
                        "text-primary underline-offset-4 hover:underline": variant === "link",
                        "h-11 px-5 py-2 rounded-xl": size === "default",
                        "h-9 px-3 rounded-lg": size === "sm",
                        "h-12 px-8 rounded-xl": size === "lg",
                        "h-11 w-11 rounded-xl": size === "icon",
                    },
                    className
                )}
                {...props}
            >
                {variant === "default" && (
                    <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-shimmer pointer-events-none" />
                )}
                <span className="relative z-10 flex items-center justify-center gap-2 w-full h-full">
                    {children as React.ReactNode}
                </span>
            </motion.button>
        )
    }
)
Button.displayName = "Button"

export { Button }
