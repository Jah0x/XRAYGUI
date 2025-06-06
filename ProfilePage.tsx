import React from 'react';
import Card from './components/Card';
import Button from './components/Button';
import { Input, Label } from './components/ui';
import Divider from './components/Divider';
import SectionTitle from './components/SectionTitle';

export default function ProfilePage() {
  return (
    <Card className="max-w-lg mx-auto">
      <div className="space-y-4">
        <SectionTitle title="Account Information" subtitle="Update your account details" />
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" />
          </div>
        </div>
        <Divider />
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" />
          </div>
          <div>
            <Label htmlFor="confirm">Confirm Password</Label>
            <Input id="confirm" type="password" />
          </div>
        </div>
        <div className="pt-4">
          <Button>Save Changes</Button>
        </div>
      </div>
    </Card>
  );
}
