import { Menu } from "lucide-react";

export function MobileTopBar({ openSidebar }: { openSidebar: () => void }) {
  return (
    <div className="md:hidden h-14 flex items-center justify-between px-4">
      <img src="/logo.svg" className="h-6" />
      <button onClick={openSidebar}>
        <Menu className="h-6 w-6" />
      </button>
    </div>
  );
}
