import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "../../lib/utils"

const Progress = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { value: number; indicatorColor?: string }
>(({ className, value, indicatorColor, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "relative h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-white/5",
            className
        )}
        {...props}
    >
        <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${value || 0}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={cn("h-full rounded-full flex-1", indicatorColor || "bg-primary")}
        />
    </div>
))
Progress.displayName = "Progress"

export { Progress }
