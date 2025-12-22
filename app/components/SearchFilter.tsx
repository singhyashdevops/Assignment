import { FC } from 'react'

interface Props {
  searchText: string
  onSearch: (text: string) => void
}

const SearchFilter: FC<Props> = ({ searchText, onSearch }) => (
  <section className="relative">
    <h3 className="font-bold text-sm mb-2">Search</h3>
    <input
      type="text"
      placeholder="Search products..."
      value={searchText}
      onChange={e => onSearch(e.target.value)}
      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amazon-orange/20 focus:border-amazon-orange text-sm pr-8"
    />
    {searchText && <button onClick={() => onSearch('')} className="absolute right-2 top-9 font-bold text-gray-900 hover:text-gray-600">×</button>}
  </section>
)

export default SearchFilter
