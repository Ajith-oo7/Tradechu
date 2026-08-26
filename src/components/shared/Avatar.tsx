import { cn } from "@/lib/utils";

interface AvatarProps {
  letter: string;
  gradient: string;
  size?: "sm" | "md" | "lg" | "xl";
  glow?: boolean;
  className?: string;
}

export function Avatar({ letter, gradient, size = "md", glow, className }: AvatarProps) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-11 h-11 text-sm",
    lg: "w-14 h-14 text-lg",
    xl: "w-20 h-20 text-2xl",
  };

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold text-white shrink-0",
        `bg-gradient-to-br ${gradient}`,
        sizes[size],
        glow && "animate-pulse-glow ring-2 ring-pikachu/50",
        className
      )}
    >
      {letter}
    </div>
  );
}
