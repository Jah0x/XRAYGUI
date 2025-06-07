import React from 'react';
import { Card } from './apps/frontend/src/components/ui/card';
import { Button } from './apps/frontend/src/components/ui/button';
import { AppShell } from './apps/frontend/src/components/ui/app-shell';

export default function DashboardPage() {
  return (
    <AppShell topbar={<div className="p-4">Dashboard</div>}>
      <div className="grid gap-4 lg:grid-cols-4">
        <Card neon>Card 1</Card>
        <Card neon>Card 2</Card>
        <Card neon>Card 3</Card>
        <Card neon>Card 4</Card>
      </div>
      <div className="mt-8">
        <Button>Primary Action</Button>
      </div>
    </AppShell>
  );
}
