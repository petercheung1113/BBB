import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border-2 px-2.5 py-0.5 font-display text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "border-transparent bg-coral/15 text-coral",
        leaf: "border-transparent bg-leaf/15 text-leaf-hot",
        sun: "border-transparent bg-sun/40 text-ink",
        outline: "border-ink/15 text-ink-soft",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
