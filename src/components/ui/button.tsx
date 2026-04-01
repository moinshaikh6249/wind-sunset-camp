"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
"inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none",
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
glass: "bg-white/10 backdrop-blur-md text-white border border-white/30 hover:bg-white/20",
},
size: {
sm: "h-9 px-4 text-sm",
md: "h-11 px-6 text-sm",
lg: "h-12 px-8 text-base",
icon: "h-10 w-10 p-0",
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

export interface ButtonProps
extends React.ButtonHTMLAttributes<HTMLButtonElement>,
VariantProps<typeof buttonVariants> {
asChild?: boolean
isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
(
{ className, variant, size, fullWidth, asChild = false, isLoading = false, children, ...props },
ref
) => {
const Comp = asChild ? Slot : "button"

```
return (
  <Comp
    ref={ref}
    className={cn(buttonVariants({ variant, size, fullWidth }), className)}
    disabled={isLoading || props.disabled}
    {...props}
  >
    {isLoading ? (
      <Loader2 className="h-4 w-4 animate-spin" />
    ) : (
      children
    )}
  </Comp>
)
```

}
)

Button.displayName = "Button"

export { Button, buttonVariants }
