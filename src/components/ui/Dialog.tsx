import * as React from "react"
import { cn } from "../../lib/utils"

interface DialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
}

import { X } from 'lucide-react';

export function Dialog({ open, onOpenChange, children }: DialogProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex flex-col justify-end sm:justify-center items-center animate-in fade-in duration-200">
            <div
                className="fixed inset-0"
                onClick={() => onOpenChange?.(false)}
            />
            <div className="relative z-50 w-full max-w-lg sm:max-w-[425px] flex flex-col gap-4 border-t sm:border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 pb-8 sm:pb-6 shadow-2xl sm:rounded-2xl rounded-t-[1.5rem] animate-in slide-in-from-bottom-1/2 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
                {/* Drag Handle Indicator (Mobile only) */}
                <div className="mx-auto w-12 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 -mt-2 mb-2 sm:hidden" />
                
                <button
                    onClick={() => onOpenChange?.(false)}
                    className="absolute right-4 top-4 rounded-full w-8 h-8 flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Fermer</span>
                </button>
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
