import { FC } from 'react'

interface Props {
  minRating: number
  onChange: (rating: number) => void
}

const RatingFilter: FC<Props> = ({ minRating, onChange }) => (
  <section>
    <h3 className="font-bold text-sm mb-2">★ Ratings</h3>
    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
      {[4, 3, 2, 1].map(star => (
        <button
          key={star}
          onClick={() => onChange(star)}
          className={`flex items-center gap-1.5 text-xs whitespace-nowrap px-3 py-1 rounded transition-all ${
            minRating === star
              ? 'bg-amazon-orange/10 border-amazon-orange text-amazon-orange font-bold'
              : 'bg-white border-gray-200 text-gray-600'
          }`}
        >
          <span className="text-amazon-orange text-sm leading-none p-1">
            {"★".repeat(star)}{"☆".repeat(5 - star)}
          </span>
          <span className="hidden md:inline">& Up</span>
        </button>
      ))}
    </div>
  </section>
)

export default RatingFilter
