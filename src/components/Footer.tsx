export default function Footer() {
  return (
    <footer className="border-t border-coffee-200 dark:border-coffee-800 mt-12 transition-colors duration-300">
      <div className="max-w-2xl mx-auto px-6 py-6 text-center space-y-1">
        <p className="text-xs text-coffee-500 dark:text-coffee-300">
          Data sourced from peer-reviewed research.{' '}
          <span className="text-coffee-400 dark:text-coffee-400">
            Switch to the Methodology tab for full references.
          </span>
        </p>
        <p className="text-xs text-coffee-400 dark:text-coffee-400">
          Built with React + Vite + Tailwind CSS
        </p>
      </div>
    </footer>
  );
}
