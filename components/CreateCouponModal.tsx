import React from 'react';
import Modal from './Modal';
import Card from './Card';

export default function CreateCouponModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Card>
        <h2 className="text-white text-xl mb-4">Create Coupon</h2>
        <button className="mt-2 bg-primary text-white px-4 py-2 rounded" onClick={onClose}>Close</button>
      </Card>
    </Modal>
  );
}
