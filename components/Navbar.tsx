import { NavLink } from 'react-router-dom';
import Logo from './Logo';

export default function Navbar() {
  return (
    <header className="bg-surface text-onSurface border-b border-primary/20">
      <div className="max-w-screen-lg mx-auto flex items-center justify-between p-4">
        <Logo />
        <nav className="flex gap-4">
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'text-primary' : '')}>Dashboard</NavLink>
          <NavLink to="/profile" className={({ isActive }) => (isActive ? 'text-primary' : '')}>Profile</NavLink>
          <NavLink to="/admin" className={({ isActive }) => (isActive ? 'text-primary' : '')}>Admin</NavLink>
        </nav>
      </div>
    </header>
  );
}
