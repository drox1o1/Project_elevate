"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

export interface NavbarLink {
  href: string;
  label: string;
}

export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  links: NavbarLink[];
  activeHref?: string;
  logo?: React.ReactNode;
  cta?: React.ReactNode;
  ref?: React.Ref<HTMLElement>;
}

const springStandard = { type: "spring", stiffness: 380, damping: 32 } as const;

export function Navbar({
  links,
  activeHref,
  logo,
  cta,
  className,
  ref,
  ...rest
}: NavbarProps) {
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile menu is open.
  React.useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // Mobile menu links cascade rise-in.
  useGSAP(
    () => {
      const menu = menuRef.current;
      if (!menu || !menuOpen) return;
      const items = gsap.utils.toArray<HTMLElement>(
        menu.querySelectorAll('[data-slot="navbar-mobile-link"]')
      );
      if (reduced) {
        gsap.set(items, { y: 0, opacity: 1 });
        return;
      }
      gsap.fromTo(
        items,
        { y: 12, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.35,
          ease: "power2.out",
          stagger: 0.06,
        }
      );
    },
    { dependencies: [menuOpen, reduced], scope: menuRef }
  );

  return (
    <header
      ref={ref}
      data-slot="navbar"
      data-scrolled={scrolled || undefined}
      className={cn(
        "sticky top-0 z-40 w-full transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled || menuOpen
          ? "border-b border-border bg-background/80 backdrop-blur"
          : "border-b border-transparent bg-transparent",
        className
      )}
      {...rest}
    >
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
        <div data-slot="navbar-logo" className="flex items-center gap-2">
          {logo}
        </div>
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active = link.href === activeHref;
            return (
              <a
                key={link.href}
                href={link.href}
                data-slot="navbar-link"
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-200",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
              >
                {link.label}
                {active ? (
                  <motion.span
                    layoutId="nav-underline"
                    data-slot="navbar-underline"
                    aria-hidden="true"
                    className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-foreground"
                    transition={reduced ? { duration: 0 } : springStandard}
                  />
                ) : null}
              </a>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          {cta}
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="relative flex size-9 items-center justify-center rounded-md transition-colors duration-200 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
          >
            {/* hamburger morphs to X: two bars rotate ±45° */}
            <span
              aria-hidden="true"
              className={cn(
                "absolute h-[1.5px] w-[18px] rounded-full bg-foreground transition-transform duration-[250ms]",
                menuOpen ? "rotate-45" : "-translate-y-[3.5px]"
              )}
            />
            <span
              aria-hidden="true"
              className={cn(
                "absolute h-[1.5px] w-[18px] rounded-full bg-foreground transition-transform duration-[250ms]",
                menuOpen ? "-rotate-45" : "translate-y-[3.5px]"
              )}
            />
          </button>
        </div>
      </nav>
      {menuOpen ? (
        <div
          ref={menuRef}
          data-slot="navbar-mobile-menu"
          className="fixed inset-x-0 bottom-0 top-14 z-40 flex flex-col gap-1 bg-background px-6 py-8 md:hidden"
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              data-slot="navbar-mobile-link"
              aria-current={link.href === activeHref ? "page" : undefined}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "rounded-lg px-3 py-3 text-lg font-medium opacity-0 transition-colors duration-200",
                link.href === activeHref
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
            >
              {link.label}
            </a>
          ))}
        </div>
      ) : null}
    </header>
  );
}
