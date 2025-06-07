import { Home, User, Shield } from "lucide-react";
import { NavLink } from "react-router-dom";

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 h-14 z-40 bg-surface2/80 backdrop-blur-lg border-t border-white/10 md:hidden flex">
      <NavLink to="/" className="flex-1 flex flex-col items-center justify-center text-2xs">
        <Home className="h-5 w-5" />
        Home
      </NavLink>
      <NavLink to="/profile" className="flex-1 flex flex-col items-center justify-center text-2xs">
        <User className="h-5 w-5" />
        Profile
      </NavLink>
      <NavLink to="/admin" className="flex-1 flex flex-col items-center justify-center text-2xs">
        <Shield className="h-5 w-5" />
        Admin
      </NavLink>
    </nav>
  );
}
