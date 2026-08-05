"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { contact, nav, whatsappLink } from "@/lib/site";
import { Close, Menu, Phone, WhatsApp } from "./Icons";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const wa = whatsappLink("Hi Burraq Motors, I'd like to enquire about a car.");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Stop the page scrolling behind the open mobile menu.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Escape closes the mobile menu.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-line-soft bg-canvas/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="group" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative rounded-lg px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-amber px-5 py-2.5 text-sm font-semibold text-on-amber transition-all hover:bg-amber-bright hover:shadow-(--shadow-glow)"
            >
              <WhatsApp className="h-4 w-4" />
              WhatsApp
            </a>
          )}
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="grid h-11 w-11 place-items-center rounded-xl border border-line text-ink"
          >
            {open ? <Close className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 top-20 z-40 bg-canvas/98 backdrop-blur-xl transition-all duration-300 lg:hidden ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <div className="flex h-full flex-col gap-2 overflow-y-auto px-5 pt-8 pb-24">
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            /* 44px minimum — this is a touch-only control, so it never gets
               the precision of a cursor. */
            className="mb-2 ml-auto grid h-11 w-11 place-items-center rounded-xl border border-line text-muted"
          >
            <Close className="h-5 w-5" />
          </button>

          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="border-b border-line-soft py-4 font-display text-2xl font-medium text-ink"
            >
              {item.label}
            </Link>
          ))}

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/cars"
              onClick={() => setOpen(false)}
              className="rounded-full bg-amber px-6 py-4 text-center font-semibold text-on-amber"
            >
              Browse Cars
            </Link>
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full border border-line px-6 py-4 font-semibold text-ink"
              >
                <WhatsApp className="h-5 w-5" />
                WhatsApp Us
              </a>
            )}
            {contact.phone && (
              <a
                href={`tel:${contact.phoneHref}`}
                className="flex items-center justify-center gap-2 rounded-full border border-line px-6 py-4 font-semibold text-ink"
              >
                <Phone className="h-5 w-5" />
                {contact.phone}
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
