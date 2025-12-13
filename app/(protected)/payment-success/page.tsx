"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PaymentSuccess() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <img
        src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZWEyanhxZXp2NnFhcjZ3bjdkbHU3anhpdzV4ZWMxZGxiazFkNDQyaCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/tlawNnswcTAmGjKRHQ/giphy.gif"
        alt="Celebration"
        className="w-64 h-64 object-contain mb-8"
      />
      <h1 className="text-4xl font-bold text-primary mb-4">
        Vielen Dank für DEINE Unterstützung!
      </h1>
      <p className=" text-muted-foreground mb-8">
        Die Zahlung hat funktioniert :) <br />
        Damit stehen dir jetzt alle YBudgets Features zur Verfügung. <br /> Ich
        wünsche dir viel Spaß mit der App und freue mich sehr über Feedback.
        <br />
        <br /> Vielen Dank nochmal 🫶
      </p>
      <Button asChild size="lg">
        <Link href="/dashboard">Zurück zur App</Link>
      </Button>
    </div>
  );
}
