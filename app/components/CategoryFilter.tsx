import { FC } from 'react'
import { categoryMenu, formatCategoryName } from '../utils/productUtils'

interface Props {
  selected: string[]
  onChange: (cats: string[]) => void
}

const CategoryFilter: FC<Props> = ({ selected, onChange }) => (
  <section>
    <h3 className="font-bold text-sm mb-2">Categories</h3>
    <div className="max-h-40 overflow-y-auto space-y-1 text-xs">
      {categoryMenu.map(cat => {
        const checked = selected.includes(cat)
        return (
          <label key={cat} className="flex items-center gap-2 px-3 py-1.5 rounded-2xl cursor-pointer hover:text-amazon-orange hover:bg-amazon-orange/20">
            <input
              type="checkbox"
              className="accent-amazon-orange h-3.5 w-3.5 rounded"
              checked={checked}
              disabled={!checked && selected.length >= 3}
              onChange={() => {
                const updated = checked ? selected.filter(c => c !== cat) : [...selected, cat]
                onChange(updated)
              }}
            />
            <span className="text-gray-700">{formatCategoryName(cat)}</span>
          </label>
        )
      })}
    </div>
  </section>
)

export default CategoryFilter
