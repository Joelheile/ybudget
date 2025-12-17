"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

interface Tier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  popular: boolean;
  priceCalculation?: string;
}

const tiers: Tier[] = [
  {
    name: "YBudget Free",
    price: "0€",
    period: "/ für immer",
    description: "Perfekt für kleine Vereine zum Ausprobieren",
    features: [
      "Bis zu 3 Projekte",
      "Unbegrenzte Transaktionen",
      "CSV-Import",
      "Basis-Kategorisierung",
    ],
    cta: "Kostenlos starten",
    href: "/login",
    popular: false,
  },
  {
    name: "YBudget Premium",
    price: "29,99€",
    period: "/ Monat",
    description: "Volle Flexibilität mit monatlicher Zahlung",
    features: [
      "Unbegrenzte Projekte",
      "Unbegrenzte Transaktionen",
      "CSV-Import",
      "Erweiterte Kategorisierung",
      "Multi-User",
    ],
    cta: "Jetzt upgraden",
    href: "/login",
    popular: false,
  },
  {
    name: "YBudget Premium Yearly",
    price: "299,00€",
    period: "/ Jahr",
    priceCalculation: "29,99€ × 12 = 359,88€",
    description: "Spare über 60€ mit jährlicher Zahlung",
    features: [
      "Unbegrenzte Projekte",
      "Unbegrenzte Transaktionen",
      "CSV-Import",
      "Erweiterte Kategorisierung",
      "Multi-User",
    ],
    cta: "Beste Wahl - Jetzt upgraden",
    href: "/login",
    popular: true,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="bg-slate-50 px-4 py-16 sm:py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Transparent. Fair. Ohne versteckte Kosten.
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base text-slate-600 sm:mt-6 sm:text-lg">
            Starte kostenlos mit bis zu 3 Projekten. Braucht dein Verein mehr?
            Upgrade jederzeit auf Premium.
          </p>
        </motion.div>

        <div className="mx-auto mt-10 grid max-w-6xl gap-6 sm:mt-16 sm:gap-8 lg:grid-cols-3">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative flex flex-col rounded-xl border bg-white p-6 shadow-sm sm:rounded-2xl sm:p-8 ${
                tier.popular
                  ? "border-primary ring-2 ring-primary"
                  : "border-slate-200"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 sm:-top-4">
                  <div className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white shadow-lg sm:px-4 sm:text-sm">
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                    Beliebteste Wahl
                  </div>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  {tier.name}
                </h3>
                <div className="mt-3 flex items-baseline justify-center gap-1 sm:mt-4">
                  <span className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-base text-slate-600 sm:text-lg">
                      {tier.period}
                    </span>
                  )}
                </div>
                {tier.priceCalculation && (
                  <p className="mt-2 text-xs text-slate-500 line-through sm:text-sm">
                    {tier.priceCalculation}
                  </p>
                )}
                <p className="mt-3 text-xs text-slate-600 sm:mt-4 sm:text-sm">
                  {tier.description}
                </p>
              </div>

              <ul className="my-6 flex-1 space-y-2 sm:my-8 sm:space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 sm:gap-3">
                    <Check className="h-4 w-4 shrink-0 text-emerald-500 sm:h-5 sm:w-5" />
                    <span className="text-sm text-slate-700 sm:text-base">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                variant={tier.popular ? "default" : "outline"}
                size="lg"
                className="w-full text-sm sm:text-base"
              >
                <Link href={tier.href}>{tier.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 text-center text-sm text-slate-500"
        >
          Alle Preise zzgl. MwSt. Jederzeit kündbar.
        </motion.p>
      </div>
    </section>
  );
}
