import { Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import logo from '@/assets/logo.png';

const links = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/student', label: 'Student' },
  { to: '/finance', label: 'Finance' },
  { to: '/disease', label: 'Disease' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  return (
    <nav className="glass-card sticky top-0 z-50 px-6 py-3 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <img src={logo} alt="Zentrix Logo" className="w-8 h-8" />
        <span className="font-bold text-lg gradient-text hidden sm:inline">ZENTRIX</span>
      </Link>
      <div className="flex items-center gap-1 sm:gap-2">
        {links.map(l => (
          <Link
            key={l.to}
            to={l.to}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              pathname === l.to
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {l.label}
          </Link>
        ))}
        <ThemeToggle />
      </div>
    </nav>
  );
}
