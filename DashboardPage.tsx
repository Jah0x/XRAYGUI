import React from 'react';
import BrandCard from './src/components/BrandCard';
import AppShell from './src/layouts/AppShell';

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BrandCard>Total Users: 123</BrandCard>
        <BrandCard>Active VPN: 57</BrandCard>
        <BrandCard>Net Traffic: 1.2 TB</BrandCard>
        <BrandCard>Revenue: $420</BrandCard>
      </div>
    </AppShell>
  );
}
