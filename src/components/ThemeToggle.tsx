import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="glass-card p-2.5 rounded-full transition-all duration-300 hover:scale-110"
      aria-label="Toggle theme"
    >
      {dark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-primary" />}
    </button>
  );
}
