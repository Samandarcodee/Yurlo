import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export function ResponsiveContainer({ 
  children, 
  className,
  maxWidth = "md" 
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md", 
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl"
  };

  return (
    <div className={cn(
      "mx-auto px-4 sm:px-6",
      maxWidthClasses[maxWidth],
      className
    )}>
      {children}
    </div>
  );
}

// Mobile-first responsive utilities
export const responsiveClasses = {
  // Text sizes
  text: {
    xs: "text-xs sm:text-sm",
    sm: "text-sm sm:text-base", 
    base: "text-base sm:text-lg",
    lg: "text-lg sm:text-xl",
    xl: "text-xl sm:text-2xl",
    "2xl": "text-2xl sm:text-3xl"
  },
  
  // Spacing
  padding: {
    sm: "p-2 sm:p-4",
    md: "p-4 sm:p-6", 
    lg: "p-6 sm:p-8"
  },
  
  // Grid columns
  grid: {
    "1": "grid-cols-1",
    "2": "grid-cols-1 sm:grid-cols-2",
    "3": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    "4": "grid-cols-2 sm:grid-cols-4"
  },
  
  // Flex direction
  flex: {
    row: "flex-col sm:flex-row",
    col: "flex-row sm:flex-col"
  }
}; 