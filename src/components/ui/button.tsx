"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, useReducedMotion } from "framer-motion"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-full font-semibold ring-offset-background transition-all duration-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "btn-gradient-shift border border-transparent bg-[linear-gradient(110deg,#ff7a18_0%,#f6c453_52%,#ff9a3c_100%)] bg-[length:180%_180%] text-white shadow-[0_14px_30px_-16px_rgba(245,158,11,0.62)] hover:brightness-110 hover:shadow-[0_0_34px_rgba(245,158,11,0.5)] dark:bg-[linear-gradient(110deg,#4ade80_0%,#14b8a6_55%,#34d399_100%)] dark:backdrop-blur-[2px] dark:shadow-[0_0_26px_rgba(74,222,128,0.4)] dark:hover:translate-y-[-1px] dark:hover:shadow-[0_0_36px_rgba(20,184,166,0.5)]",
        secondary:
          "border border-[#1f3b2f]/35 bg-transparent text-[#1f3b2f] shadow-[0_8px_20px_-18px_rgba(15,23,42,0.38)] hover:bg-[#1f3b2f]/8 hover:shadow-[0_0_0_1px_rgba(31,59,47,0.2),0_10px_22px_-18px_rgba(15,23,42,0.45)] dark:border-white/20 dark:bg-white/5 dark:text-white dark:backdrop-blur-sm dark:hover:bg-white/12 dark:hover:shadow-[0_0_0_1px_rgba(255,255,255,0.24),0_12px_24px_-18px_rgba(74,222,128,0.35)]",
        ghost:
          "bg-transparent text-foreground shadow-none hover:bg-foreground/10 dark:hover:bg-white/10",
        glass:
          "border border-white/35 bg-white/20 text-foreground shadow-[0_8px_22px_-14px_rgba(17,24,39,0.45)] backdrop-blur-md hover:bg-white/35 dark:border-white/20 dark:bg-white/10 dark:text-foreground dark:hover:bg-white/15",
        default:
          "bg-gradient-to-r from-primary to-accent text-white shadow-[0_10px_28px_-12px_hsla(var(--accent)/0.7)] hover:shadow-[0_0_28px_hsla(var(--accent)/0.55)] dark:shadow-[0_0_22px_hsla(var(--primary)/0.35)]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-[#1f3b2f]/35 bg-transparent text-[#1f3b2f] shadow-[0_8px_20px_-18px_rgba(15,23,42,0.38)] hover:bg-[#1f3b2f]/8 hover:shadow-[0_0_0_1px_rgba(31,59,47,0.2),0_10px_22px_-18px_rgba(15,23,42,0.45)] dark:border-white/20 dark:bg-white/5 dark:text-white dark:backdrop-blur-sm dark:hover:bg-white/12 dark:hover:shadow-[0_0_0_1px_rgba(255,255,255,0.24),0_12px_24px_-18px_rgba(74,222,128,0.35)]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-4 py-2 text-sm",
        md: "h-11 px-7 py-3 text-sm",
        lg: "h-12 px-8 py-3.5 text-base",
        icon: "h-11 w-11 p-0",
        default: "h-11 px-7 py-3 text-sm",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  }
)

type Ripple = {
  id: number
  x: number
  y: number
  size: number
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  isLoading?: boolean
  loadingText?: string
  ripple?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      leftIcon,
      rightIcon,
      isLoading = false,
      loadingText,
      ripple = true,
      children,
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    const shouldReduceMotion = useReducedMotion()
    const [ripples, setRipples] = React.useState<Ripple[]>([])

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple && !disabled && !isLoading) {
        const target = event.currentTarget
        const rect = target.getBoundingClientRect()
        const diameter = Math.max(rect.width, rect.height) * 1.35
        setRipples((previous) => [
          ...previous,
          {
            id: Date.now() + Math.random(),
            x: event.clientX - rect.left - diameter / 2,
            y: event.clientY - rect.top - diameter / 2,
            size: diameter,
          },
        ])
      }

      onClick?.(event)
    }

    React.useEffect(() => {
      if (ripples.length === 0) {
        return
      }

      const timeout = setTimeout(() => {
        setRipples((previous) => previous.slice(1))
      }, 500)

      return () => clearTimeout(timeout)
    }, [ripples])

    const isDisabled = disabled || isLoading

    const content = (
      <>
        <span className="absolute inset-0 pointer-events-none" aria-hidden>
          {ripples.map((rippleItem) => (
            <span
              key={rippleItem.id}
              className="btn-ripple"
              style={{
                left: rippleItem.x,
                top: rippleItem.y,
                width: rippleItem.size,
                height: rippleItem.size,
              }}
            />
          ))}
        </span>

        <span className="relative z-[1] inline-flex items-center justify-center gap-2">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : leftIcon}
          <span>{isLoading && loadingText ? loadingText : children}</span>
          {!isLoading ? rightIcon : null}
        </span>
      </>
    )

    if (asChild) {
      const Comp = Slot
      return (
        <Comp
          className={cn(
            buttonVariants({ variant, size, fullWidth, className }),
            isDisabled && "pointer-events-none opacity-50"
          )}
          ref={ref}
          aria-disabled={isDisabled}
          data-loading={isLoading ? "true" : "false"}
          {...props}
        >
          {children}
        </Comp>
      )
    }

    if (!shouldReduceMotion && !isDisabled) {
      return (
        <motion.button
          className={cn(buttonVariants({ variant, size, fullWidth, className }))}
          ref={ref}
          whileHover={{ scale: variant === "primary" || variant === "default" ? 1.05 : 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{ willChange: "transform" }}
          disabled={isDisabled}
          onClick={handleClick}
          data-loading={isLoading ? "true" : "false"}
          {...props}
        >
          {content}
        </motion.button>
      )
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={isDisabled}
        onClick={handleClick}
        data-loading={isLoading ? "true" : "false"}
        {...props}
      >
        {content}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
