import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        custom: "bg-red-700 rounded-md text-white font-medium cursor-pointer",
        animated: "bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 text-white font-medium cursor-pointer border border-pink-200/30 shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:scale-105 active:scale-95 transition-all duration-200 ease-out backdrop-blur-sm",
        glassmorphic: "bg-white/20 text-white font-medium cursor-pointer border border-white/30 backdrop-blur-md shadow-lg hover:bg-white/30 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ease-out",
        neon: "bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold cursor-pointer border-2 border-cyan-300 shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/75 hover:shadow-xl hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-200 ease-out",
        bounce: "bg-purple-600 text-white font-medium cursor-pointer hover:bg-purple-700 hover:animate-bounce active:scale-95 transition-all duration-150",
        topbar: "bg-gradient-to-br from-pink-300 to-blue-300 text-white font-medium cursor-pointer border border-pink-200/30 rounded-2xl shadow-lg hover:from-blue-300 hover:to-pink-300 hover:-translate-y-0.5 hover:scale-105 hover:shadow-xl active:scale-95 transition-all duration-200 ease-out backdrop-blur-sm",
        auth: "bg-[#162938] text-white font-medium cursor-pointer border-none rounded-md hover:bg-[#270023] transition-all duration-300",
        // Pinterest-dreamy aesthetic variants
        dreamy: "bg-gradient-to-r from-rose-300 via-pink-200 to-rose-100 text-rose-900 font-medium cursor-pointer border-2 border-rose-200/60 rounded-full shadow-lg hover:shadow-rose-200/40 hover:shadow-xl hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-300 ease-out backdrop-blur-sm",
        soft: "bg-gradient-to-br from-purple-100 via-pink-50 to-blue-50 text-slate-700 font-medium cursor-pointer border border-purple-200/50 rounded-2xl shadow-md hover:shadow-purple-200/30 hover:shadow-lg hover:-translate-y-0.5 hover:from-purple-200 hover:via-pink-100 hover:to-blue-100 active:scale-95 transition-all duration-250 ease-out",
        cloud: "bg-white/80 text-slate-600 font-medium cursor-pointer border-2 border-slate-200/50 rounded-xl shadow-lg backdrop-blur-md hover:bg-white/90 hover:shadow-xl hover:-translate-y-1 hover:border-slate-300/60 active:scale-95 transition-all duration-200 ease-out",
        sunset: "bg-gradient-to-r from-orange-200 via-pink-200 to-purple-200 text-orange-900 font-medium cursor-pointer border border-orange-200/60 rounded-2xl shadow-lg hover:from-orange-300 hover:via-pink-300 hover:to-purple-300 hover:shadow-xl hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-300 ease-out",
        pastel: "bg-gradient-to-br from-green-100 via-blue-50 to-purple-100 text-green-800 font-medium cursor-pointer border-2 border-green-200/40 rounded-full shadow-md hover:from-green-200 hover:via-blue-100 hover:to-purple-200 hover:shadow-lg hover:-translate-y-0.5 hover:scale-105 active:scale-95 transition-all duration-250 ease-out",
        // Special purpose variants
        primary: "bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold cursor-pointer border-none rounded-xl shadow-lg hover:from-indigo-600 hover:to-purple-700 hover:shadow-xl hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-200 ease-out",
        danger: "bg-gradient-to-r from-rose-400 to-pink-500 text-white font-medium cursor-pointer border-none rounded-xl shadow-lg hover:from-rose-500 hover:to-pink-600 hover:shadow-xl hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-200 ease-out",
        success: "bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-medium cursor-pointer border-none rounded-xl shadow-lg hover:from-emerald-500 hover:to-teal-600 hover:shadow-xl hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-200 ease-out"
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        custom: "w-full h-12",
        // Sizes matching your existing CSS patterns
        login: "w-full h-11 px-4 py-3 text-base font-medium",
        topbar: "h-9 px-6 py-2 text-base font-medium",
        pill: "h-7 px-3 py-1 text-sm",
        action: "h-10 px-6 py-2.5 text-base",
        compact: "h-8 px-4 py-1.5 text-sm",
        // Exact matches to your CSS patterns
        "topbar-exact": "px-6 py-2 text-base font-medium", // padding: 7px 22px from your CSS
        "pill-exact": "px-3 py-1 text-sm", // padding: 4px 10px from your CSS  
        "action-exact": "px-6 py-2.5 text-base", // padding: 8px 22px / 10px 24px patterns
        auth: "w-full h-11 text-base font-medium", // width: 100%, height: 45px, font-size: 1em, font-weight: 500
        // Dreamy aesthetic sizes
        dreamy: "h-12 px-8 py-3 text-base font-medium",
        soft: "h-10 px-6 py-2.5 text-sm font-medium",
        cloud: "h-11 px-7 py-3 text-base font-medium",
        cozy: "h-9 px-5 py-2 text-sm font-medium",
        elegant: "h-12 px-10 py-3 text-base font-semibold"
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
