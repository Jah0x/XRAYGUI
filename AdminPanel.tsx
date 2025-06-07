import React, { useState } from 'react';
import BrandTabs from './src/components/BrandTabs';
import BrandButton from './src/components/BrandButton';
import EmptyState from './components/EmptyState';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function AdminPanel() {
  const [tab, setTab] = useState<'coupons' | 'offers' | 'users' | 'subscriptions' | 'newsletter'>('coupons');
  const [couponOpen, setCouponOpen] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);


  const tabs = [
    {
      label: 'Coupons',
      value: 'coupons',
      content: (
        <div className="space-y-4">
          <BrandButton onClick={() => setCouponOpen(true)}>Create Coupon</BrandButton>
          <Dialog open={couponOpen} onOpenChange={setCouponOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Coupon</DialogTitle>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <EmptyState>No coupons found …</EmptyState>
        </div>
      ),
    },
    {
      label: 'Offers',
      value: 'offers',
      content: (
        <div className="space-y-4">
          <BrandButton onClick={() => setOfferOpen(true)}>Create Offer</BrandButton>
          <Dialog open={offerOpen} onOpenChange={setOfferOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Offer</DialogTitle>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <EmptyState>No offers found …</EmptyState>
        </div>
      ),
    },
    {
      label: 'Users',
      value: 'users',
      content: <EmptyState>No users found …</EmptyState>,
    },
    {
      label: 'Subscriptions',
      value: 'subscriptions',
      content: <EmptyState>No subscriptions found …</EmptyState>,
    },
    { label: 'Newsletter', value: 'newsletter', content: <div>Newsletter content</div> },
  ];

  return (
    <div className="max-w-screen-lg mx-auto p-4">
      <BrandTabs tabs={tabs} value={tab} onValueChange={setTab} />
    </div>
  );
}
