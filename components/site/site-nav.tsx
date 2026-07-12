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
          className="text-sm font-semibold tracking-tight text-foreground"
        >
          DUKU<span className="text-muted-foreground"> Labs</span>
        </Link>
      }
      cta={<ThemeToggle />}
    />
  );
}
