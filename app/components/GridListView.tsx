'use client';

interface ToggleProps {
  view: 'grid' | 'list';
  setView: (view: 'grid' | 'list') => void;
}

export default function GridListView({ view, setView }: ToggleProps) {
  const activeClass = "bg-amazon-yellow text-amazon-blue";
  const inactiveClass = "bg-white text-amazon-gray-dark hover:bg-amazon-gray-light";

  return (
    <div className="inline-flex rounded-md shadow-sm border border-gray-300 overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => setView('grid')}
        className={`px-4 py-2 text-sm font-bold transition-all duration-200 ${view === 'grid' ? activeClass : inactiveClass}`}
      >
        Grid
      </button>

      <button
        type="button"
        onClick={() => setView('list')}
        className={`px-4 py-2 text-sm font-bold border-l border-gray-300 transition-all duration-200 ${view === 'list' ? activeClass : inactiveClass}`}
      >
        List
      </button>
    </div>
  );
}