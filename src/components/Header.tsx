export default function Header() {
  return (
    <header className="bg-gradient-to-b from-coffee-600 to-coffee-800 dark:from-coffee-800 dark:to-coffee-950 text-white shadow-lg">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
          ☕ Coffee Caffeine Calculator
        </h1>
        <p className="mt-2 text-coffee-200 dark:text-coffee-100 text-xs sm:text-sm md:text-base">
          Science-based caffeine estimates for your brew
        </p>
      </div>
    </header>
  );
}
