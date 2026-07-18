"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Navbar } from "@/registry/default/ui/navbar";
import { ThemeToggle } from "@/components/site/theme-toggle";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/components/button", label: "Components" },
  { href: "/connect", label: "MCP" },
  { href: "/pricing", label: "Pricing" },
];

export function SiteNav() {
  const pathname = usePathname();
  const activeHref = pathname.startsWith("/components")
    ? "/components/button"
    : pathname === "/connect"
      ? "/connect"
      : pathname === "/pricing"
        ? "/pricing"
        : "/";

  return (
    <Navbar
      links={LINKS}
      activeHref={activeHref}
      logo={
        <Link
          href="/"
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-light.svg" alt="DUKU" className="pixelated h-5 w-auto dark:hidden" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-dark.svg" alt="DUKU" className="pixelated hidden h-5 w-auto dark:block" />
          <span className="font-pixel text-xs tracking-wider text-foreground">
            DUKU LABS
          </span>
        </Link>
      }
      cta={<ThemeToggle />}
    />
  );
}
