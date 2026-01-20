import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-gray-200 h-10 w-full min-w-0 rounded-xl border bg-white/80 backdrop-blur-sm px-3 text-base shadow-sm transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "hover:border-gray-300 hover:shadow-md",
        "focus-visible:border-gray-400 focus-visible:ring-gray-100 focus-visible:ring-2 focus-visible:shadow-md focus-visible:bg-white",
        "aria-invalid:ring-red-100 dark:aria-invalid:ring-destructive/40 aria-invalid:border-red-400",
        className
      )}
      {...props}
    />
  )
}

export { Input }
