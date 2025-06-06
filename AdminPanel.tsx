import React, { useState } from 'react';
import Tabs from './components/Tabs';
import Button from './components/Button';
import CreateCouponModal from './components/CreateCouponModal';
import CreateOfferModal from './components/CreateOfferModal';

export default function AdminPanel() {
  const [tab, setTab] = useState<'coupons' | 'offers' | 'users' | 'subscriptions' | 'newsletter'>('coupons');
  const [couponOpen, setCouponOpen] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);

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

      {tab === 'coupons' && (
        <div className="space-y-4">
          <Button onClick={() => setCouponOpen(true)}>Create Coupon</Button>
          <CreateCouponModal isOpen={couponOpen} onClose={() => setCouponOpen(false)} />
        </div>
      )}

      {tab === 'offers' && (
        <div className="space-y-4">
          <Button onClick={() => setOfferOpen(true)}>Create Offer</Button>
          <CreateOfferModal isOpen={offerOpen} onClose={() => setOfferOpen(false)} />
        </div>
      )}

      {tab === 'users' && <div>Users content</div>}
      {tab === 'subscriptions' && <div>Subscriptions content</div>}
      {tab === 'newsletter' && <div>Newsletter content</div>}
    </div>
  );
}
