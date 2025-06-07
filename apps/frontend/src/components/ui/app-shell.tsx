import React from 'react';

export interface AppShellProps {
  sidebar?: React.ReactNode;
  topbar?: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({ sidebar, topbar, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-surface text-gray-200">
      {sidebar}
      <div className="flex-1 flex flex-col w-full">
        {topbar}
        <main className="flex-1 container py-4">{children}</main>
      </div>
    </div>
  );
}
