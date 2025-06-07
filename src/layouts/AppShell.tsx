import { Sidebar } from "@/components/ui/sidebar";
import { BottomNav } from "@/components/ui/BottomNav";
import { MobileTopBar } from "@/components/ui/MobileTopBar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MobileTopBar openSidebar={() => {}} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 container pb-20">{children}</main>
      </div>
      <footer className="mt-auto py-6 text-center text-xs text-muted-foreground">
        XRAYGUI © 2025
      </footer>
      <BottomNav />
    </div>
  );
}
