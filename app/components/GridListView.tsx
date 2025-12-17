'use client';

interface ToggleProps {
  view: 'grid' | 'list';
  setView: (view: 'grid' | 'list') => void
}

export default function GridListView({ view, setView }: ToggleProps) {
  return (
    <div className="inline-flex rounded-md shadow-sm border border-gray-300 overflow-hidden bg-white">
      <button type="button" onClick={() => setView('grid')} className={`px-4 py-2 text-sm font-bold transition-all duration-200 ${view === 'grid'
            ? 'bg-amazon-yellow text-amazon-blue' // lightgreen background with darkgreen text
            : 'bg-white text-amazon-gray-dark hover:bg-amazon-gray-light'}`}>
        <div className="flex items-center gap-2">Grid</div>
      </button>

      <button type="button" onClick={() => setView('list')} className={`px-4 py-2 text-sm font-bold border-l border-gray-400 transition-all duration-400 ${view === 'list'
            ? 'bg-amazon-yellow text-amazon-blue' // lightgreen background
            : 'bg-white text-amazon-gray-dark hover:bg-amazon-gray-light'}`}>
        <div className="flex items-center gap-2">List</div>
      </button>
    </div>
  );
}