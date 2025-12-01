import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
    rating: number;
    onRatingChange?: (rating: number) => void;
    readonly?: boolean;
    size?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({
    rating,
    onRatingChange,
    readonly = false,
    size = 20,
}) => {
    const [hoverRating, setHoverRating] = React.useState(0);

    const handleClick = (value: number) => {
        if (!readonly && onRatingChange) {
            onRatingChange(value);
        }
    };

    const handleMouseEnter = (value: number) => {
        if (!readonly) {
            setHoverRating(value);
        }
    };

    const handleMouseLeave = () => {
        if (!readonly) {
            setHoverRating(0);
        }
    };

    const displayRating = hoverRating || rating;

    return (
        <div className="flex gap-1" dir="ltr">
            {[1, 2, 3, 4, 5].map((value) => (
                <button
                    key={value}
                    type="button"
                    onClick={() => handleClick(value)}
                    onMouseEnter={() => handleMouseEnter(value)}
                    onMouseLeave={handleMouseLeave}
                    disabled={readonly}
                    className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
                        } transition-transform duration-150`}
                >
                    <Star
                        size={size}
                        className={`${value <= displayRating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-200 text-gray-300'
                            } transition-colors duration-150`}
                    />
                </button>
            ))}
        </div>
    );
};
