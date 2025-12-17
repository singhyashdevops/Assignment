export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-amazon-blue text-white shadow-md">
      <div className="mx-auto flex max-w-375 items-center px-4 py-2">
        <div className="group flex cursor-pointer items-center border border-transparent p-1 transition-all hover:border-white">
          <h1 className="text-4xl font-extrabold tracking-tighter text-amazon-yellow italic">
            QuickCart   
          </h1>
        </div>
      </div>
    </nav>
  );
}