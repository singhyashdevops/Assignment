export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-black shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center space-x-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-red-400 italic">
          QuickCart
        </h1>
        <p className="text-sm font-medium italic text-red-300">
          An Ecommerce Solution
        </p>
      </div>
    </nav>
  );
}