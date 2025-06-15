import React from "react";

const Separator = React.forwardRef(({ 
  orientation = "horizontal", 
  decorative = true, 
  className = "", 
  ...props 
}, ref) => (
  <div
    ref={ref}
    data-orientation={orientation}
    role={!decorative ? "separator" : undefined}
    aria-orientation={!decorative ? orientation : undefined}
    className={`shrink-0 bg-border ${
      orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]"
    } ${className}`}
    {...props}
  />
));

Separator.displayName = "Separator";

export { Separator };
