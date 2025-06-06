import React, { useState } from 'react';
import Tabs from './components/Tabs';

export default function AdminPanel() {
  const [tab, setTab] = useState<'coupons' | 'offers' | 'users' | 'subscriptions' | 'newsletter'>('coupons');

  const items = [
    { label: 'Coupons', value: 'coupons' },
    { label: 'Offers', value: 'offers' },
    { label: 'Users', value: 'users' },
    { label: 'Subscriptions', value: 'subscriptions' },
    { label: 'Newsletter', value: 'newsletter' },
  ];

  return (
    <div className="max-w-screen-lg mx-auto p-4">
      <Tabs items={items} value={tab} onChange={setTab} />

      {tab === 'coupons' && <div>Coupons content</div>}
      {tab === 'offers' && <div>Offers content</div>}
      {tab === 'users' && <div>Users content</div>}
      {tab === 'subscriptions' && <div>Subscriptions content</div>}
      {tab === 'newsletter' && <div>Newsletter content</div>}
    </div>
  );
}
