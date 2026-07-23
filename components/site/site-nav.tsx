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
  { href: "/open-source", label: "Open source" },
];

export function SiteNav() {
  const pathname = usePathname();
  const activeHref = pathname.startsWith("/components")
    ? "/components/button"
    : pathname === "/connect"
      ? "/connect"
      : pathname === "/open-source"
        ? "/open-source"
        : "/";

  return (
    <Navbar
      links={LINKS}
      activeHref={activeHref}
      logo={
        <Link
          href="/"
          className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/duku_labs_light.svg" alt="DUKU Labs" className="h-6 w-auto dark:hidden" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/duku_labs_dark.svg" alt="DUKU Labs" className="hidden h-6 w-auto dark:block" />
        </Link>
      }
      cta={<ThemeToggle />}
    />
  );
}
