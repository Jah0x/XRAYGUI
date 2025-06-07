import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import * as React from "react";

export interface BrandTabsProps {
  tabs: { value: string; label: string; content: React.ReactNode }[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export default function BrandTabs({ tabs, defaultValue, value, onValueChange }: BrandTabsProps) {
  return (
    <Tabs value={value} onValueChange={onValueChange} defaultValue={defaultValue ?? tabs[0]?.value} className="w-full">
      <TabsList className="mb-4">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="data-[state=active]:text-brand data-[state=active]:border-b-2 data-[state=active]:border-brand"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="mt-0">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
