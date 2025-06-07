import { Card, CardProps } from "@/components/ui/card";

export default function BrandCard({ children, className, ...props }: CardProps) {
  return (
    <Card className="border border-white/5 rounded-xl" {...props}>
      {children}
    </Card>
  );
}
