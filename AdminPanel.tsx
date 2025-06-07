import React, { useState } from 'react';
import BrandTabs from './src/components/BrandTabs';
import BrandButton from './src/components/BrandButton';
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
        </div>
      ),
    },
    { label: 'Users', value: 'users', content: <div>Users content</div> },
    { label: 'Subscriptions', value: 'subscriptions', content: <div>Subscriptions content</div> },
    { label: 'Newsletter', value: 'newsletter', content: <div>Newsletter content</div> },
  ];

  return (
    <div className="max-w-screen-lg mx-auto p-4">
      <BrandTabs tabs={tabs} value={tab} onValueChange={setTab} />
    </div>
  );
}
