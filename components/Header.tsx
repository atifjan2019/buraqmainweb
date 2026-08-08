"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { contact, nav, whatsappLink } from "@/lib/site";
import { Close, Menu, Phone, WhatsApp } from "./Icons";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

/**
 * Top navigation.
 *
 * Solid canvas at every scroll position, not transparent-until-scrolled.
 * DESIGN-bmw-m.md gives `top-nav` a canvas background outright, and the reason
 * is structural rather than cosmetic: the hero below is full-bleed photography,
 * and a nav that dissolves into it puts white 14px labels over whatever part of
 * a car happens to be behind them. A solid bar is what lets the photograph run
 * edge to edge without the chrome having to fight it.
 *
 * That is also why the scroll listener this component used to carry is gone —
 * it existed only to fade the background in.
 */
export default function Header() {
  const [open, setOpen] = useState(false);
  const wa = whatsappLink("Hi Burraq Motors, I'd like to enquire about a car.");

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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line-soft bg-canvas">
      {/* 64px per the doc's `top-nav`. The max width is 1440px rather than the
          usual SaaS 1280 — the system wants photography to breathe. */}
      <div className="mx-auto flex h-16 max-w-[90rem] items-center justify-between px-5 sm:px-8">
        <Link href="/" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        {/* Sentence case, not uppercase: the doc reserves the machined
            all-caps treatment for buttons and labels, and puts nav items in
            `nav-link` — 14px / 400 / 0.5px. */}
        <nav className="hidden items-center gap-8 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-link text-muted transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline h-11 min-h-11 px-6"
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
            className="grid h-11 w-11 place-items-center border border-line text-ink"
          >
            {open ? <Close className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile sheet — a full-screen black overlay carrying the tricolour at
          its top edge, which is the collapse the doc specifies by name. */}
      <div
        className={`fixed inset-0 top-16 z-40 bg-canvas transition-opacity duration-200 lg:hidden ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <span aria-hidden className="m-stripe block h-1 w-full" />

        <div className="flex h-full flex-col overflow-y-auto px-5 pt-6 pb-28">
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            /* 44px minimum — this is a touch-only control, so it never gets
               the precision of a cursor. */
            className="mb-4 ml-auto grid h-11 w-11 place-items-center border border-line text-muted"
          >
            <Close className="h-5 w-5" />
          </button>

          {/* Full-screen menus are the one place the system lets nav labels go
              display-weight: at this size they are headlines, not chrome. */}
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="display-sm border-b border-line-soft py-5 text-ink"
            >
              {item.label}
            </Link>
          ))}

          <div className="mt-10 flex flex-col gap-3">
            <Link
              href="/cars"
              onClick={() => setOpen(false)}
              className="btn btn-solid"
            >
              Browse Cars
            </Link>
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                <WhatsApp className="h-5 w-5" />
                WhatsApp Us
              </a>
            )}
            {contact.phone && (
              <a href={`tel:${contact.phoneHref}`} className="btn btn-outline">
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
