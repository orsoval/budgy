import * as React from "react"
import { cn } from "../../lib/utils"

interface DialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 flex items-center justify-center">
            <div
                className="fixed inset-0"
                onClick={() => onOpenChange?.(false)}
            />
            <div className="relative z-50 grid w-full max-w-lg gap-4 border border-zinc-200 bg-white p-6 shadow-lg duration-200 sm:rounded-lg dark:border-zinc-800 dark:bg-zinc-950 sm:max-w-[425px]">
                {children}
            </div>
        </div>
    );
}

export function DialogHeader({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "flex flex-col space-y-1.5 text-center sm:text-left",
                className
            )}
            {...props}
        />
    )
}

export function DialogTitle({
    className,
    ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h2
            className={cn(
                "text-lg font-semibold leading-none tracking-tight",
                className
            )}
            {...props}
        />
    )
}
