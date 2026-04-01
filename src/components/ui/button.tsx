"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
"relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-full font-semibold ring-offset-background transition-all duration-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
{
variants: {
variant: {
primary: "bg-orange-500 text-white hover:bg-orange-600",
secondary: "border bg-transparent text-black",
ghost: "bg-transparent hover:bg-gray-100",
default: "bg-black text-white",
destructive: "bg-red-500 text-white",
outline: "border",
link: "underline text-blue-500",
},
size: {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-12 px-8 text-base",
  icon: "h-10 w-10 p-0", // ADD THIS
}
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

export interface ButtonProps
extends React.ButtonHTMLAttributes<HTMLButtonElement>,
VariantProps<typeof buttonVariants> {
asChild?: boolean
isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
({ className, variant, size, fullWidth, asChild = false, isLoading, children, ...props }, ref) => {
const Comp = asChild ? Slot : "button"

```
return (
  <Comp
    className={cn(buttonVariants({ variant, size, fullWidth, className }))}
    ref={ref}
    disabled={isLoading}
    {...props}
  >
    {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : children}
  </Comp>
)
```

}
)

Button.displayName = "Button"

export { Button, buttonVariants }
