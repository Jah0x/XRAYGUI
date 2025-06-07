import { Button } from "@/components/ui/button";
import { ButtonHTMLAttributes } from "react";

export default function BrandButton({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button className="bg-brand text-white hover:bg-brand/90" {...props}>
      {children}
    </Button>
  );
}
