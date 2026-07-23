import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[96px] w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-cyan-400/40",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
