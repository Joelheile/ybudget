"use client";

import Image from "next/image";
import Link from "next/link";

const footerLinks = {
  product: [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "Changelog", href: "#changelog" },
    { name: "Roadmap", href: "#roadmap" },
  ],

  company: [
    { name: "Über uns", href: "#about" },
    { name: "Kontakt", href: "#contact" },
    { name: "Impressum", href: "/impressum" },
    { name: "Datenschutz", href: "/datenschutz" },
  ],
  community: [
    { name: "Young Founders Network", href: "#yfn" },
    { name: "GitHub", href: "#github" },
    { name: "Twitter", href: "#twitter" },
    { name: "LinkedIn", href: "#linkedin" },
  ],
};

export function Footer() {
  return (
    <footer className=" border-slate-200 bg-white px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className=" flex flex-col items-center justify-between gap-3  sm:flex-row sm:gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/AppIcon.png"
              alt="YBudget"
              width={24}
              height={24}
              className="size-6 sm:size-8"
            />

            <span className="text-sm font-semibold  sm:text-base">YBudget</span>
          </div>
          <div className="flex items-center gap-4 ">
            <Link href="/impressum" className="text-sm hover:text-primary">
              Impressum
            </Link>
            <Link href="/datenschutz" className="text-sm hover:text-primary">
              Datenschutz
            </Link>
          </div>
          <p className="text-xs text-slate-500 sm:text-sm">
            © 2025 YBudget. Made with ❤️ for non-profits in Germany.
          </p>
        </div>
      </div>
    </footer>
  );
}
