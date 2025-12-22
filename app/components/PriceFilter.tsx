import { FC } from 'react'
import { pricePresets } from '../utils/productUtils'

interface Props {
  minPrice: number
  maxPrice: number
  onChange: (min: number, max: number) => void
}

const PriceFilter: FC<Props> = ({ minPrice, maxPrice, onChange }) => (
  <section>
    <h3 className="font-bold text-sm mb-2">Price</h3>
    <div className="grid grid-cols-2 gap-2">
      {pricePresets.map(p => (
        <button
          key={p.label}
          onClick={() => onChange(p.min, p.max)}
          className={`text-[10px] py-2 px-1 border rounded-md transition-all ${
            minPrice === p.min && maxPrice === p.max
              ? 'bg-amazon-yellow border-amazon-orange font-bold text-gray-900'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-amazon-orange/10'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  </section>
)

export default PriceFilter
