"use client";

import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOnborda } from "onborda";

export function StartTourButton() {
  const { startOnborda } = useOnborda();
  const router = useRouter();

  const handleClick = () => {
    localStorage.removeItem("onborda:main-tour");
    router.push("/dashboard");
    setTimeout(() => startOnborda("main-tour"), 300);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      title="Tour starten"
      className="h-8 w-8"
    >
      <HelpCircle className="h-4 w-4" />
    </Button>
  );
}
