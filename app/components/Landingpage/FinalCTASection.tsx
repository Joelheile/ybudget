"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

export function FinalCTASection() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-slate-900 via-slate-800 to-blue-900 px-4 py-16 sm:py-24 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

      <div className="relative mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Bereit, dein Budget unter Kontrolle zu bringen?
          </h2>
          <p className="mt-4 text-base text-slate-300 sm:mt-6 sm:text-xl">
            Starte kostenlos – keine Kreditkarte erforderlich.
          </p>

          <div className="mt-8 flex justify-center sm:mt-10">
            <Button
              asChild
              size="lg"
              className="h-11 bg-white px-6 text-sm font-semibold text-slate-900 hover:bg-slate-100 sm:h-12 sm:px-8 sm:text-base"
            >
              <Link href="/login">YBudget testen</Link>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-300 sm:mt-10 sm:gap-6 sm:text-sm">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-400 sm:h-5 sm:w-5" />
              Keine Kreditkarte
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-400 sm:h-5 sm:w-5" />
              Jederzeit kündbar
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-400 sm:h-5 sm:w-5" />
              DSGVO-konform
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
