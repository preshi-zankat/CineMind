import { useState } from "react";
import { Star } from "lucide-react";

// value: current rating (1-5)
// onChange: (rating) => void - agar diya hai to interactive ban jaata hai
// readOnly: true -> sirf display, click/hover kaam nahi karega
// size: icon size in px
export default function StarRating({ value = 0, onChange, readOnly = false, size = 20 }) {
  const [hovered, setHovered] = useState(0);

  const displayValue = hovered || value;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange && onChange(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          className={readOnly ? "cursor-default" : "cursor-pointer transition hover:scale-110"}
        >
          <Star
            size={size}
            fill={star <= displayValue ? "#F59E0B" : "none"}
            color="#F59E0B"
          />
        </button>
      ))}
    </div>
  );
}