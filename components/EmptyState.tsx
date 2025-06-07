import { Card } from "@/components/ui/card";

export default function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <Card className="py-16 text-center text-sm text-muted-foreground">
      {children}
    </Card>
  );
}
