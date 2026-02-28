import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stars({
  value,
  interactive = false,
  onChange
}: {
  value: number;
  interactive?: boolean;
  onChange?: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = index + 1;
        const active = starValue <= value;

        if (interactive) {
          return (
            <button
              key={starValue}
              type="button"
              className="text-accent"
              onClick={() => onChange?.(starValue)}
            >
              <Star className={cn("h-4 w-4", active ? "fill-current" : "")} />
            </button>
          );
        }

        return (
          <Star
            key={starValue}
            className={cn("h-4 w-4 text-accent", active ? "fill-current" : "")}
          />
        );
      })}
    </div>
  );
}
