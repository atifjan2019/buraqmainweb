"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { bookingCta, contact, nav, whatsappLink } from "@/lib/site";
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
            `nav-link` — 14px / 700 / 0.5px. The weight is a deliberate
            divergence from the doc; see the .nav-link rule in globals.css. */}
        {/* The desktop nav starts at xl, not lg.

            It gained a seventh item and then an eighth, and eight labels of
            this length measure 605px against the 563px between the wordmark and
            the WhatsApp button at 1024 — the row wrapped to two lines and
            "Home" ran under the logo. Tightening the gap bought the seventh
            item and would not buy the eighth without squeezing the labels to
            the point of looking broken.

            So 1024–1279 gets the full-screen menu instead, which lists all
            eight comfortably. Raising the breakpoint is the honest fix: the
            items do not fit, and a nav that technically renders while looking
            crushed is worse than one tap. */}
        <nav className="hidden items-center gap-6 xl:flex xl:gap-7">
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

        <div className="hidden items-center gap-3 xl:flex">
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline h-11 min-h-11 px-5"
            >
              <WhatsApp className="h-4 w-4" />
              WhatsApp
            </a>
          )}
          {/* Solid, because booking is the action this header exists to
              produce. It was the fourth of eight identical grey nav links. */}
          <Link href={bookingCta.href} className="btn btn-solid h-11 min-h-11 px-5">
            {bookingCta.label}
          </Link>
          <ThemeToggle />
        </div>

        {/*
          Below 1280px this bar was a logo, a theme toggle and a hamburger —
          the phone and WhatsApp were two taps and a full-screen overlay away,
          on the one device where the visitor is already holding the thing they
          would ring from. Both are icon buttons now, at the 44px touch
          minimum, and labelled, because here the glyph carries the whole
          meaning.
        */}
        <div className="flex items-center gap-2 xl:hidden">
          {contact.phone && (
            <a
              href={`tel:${contact.phoneHref}`}
              aria-label={`Call ${contact.phone}`}
              className="grid h-11 w-11 place-items-center border border-line text-ink"
            >
              <Phone className="h-5 w-5" />
            </a>
          )}
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Message us on WhatsApp"
              className="grid h-11 w-11 place-items-center border border-line text-ink"
            >
              <WhatsApp className="h-5 w-5" />
            </a>
          )}
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
        /*
          `inert` when closed, and this is a real accessibility fix rather than
          a tidy-up. The panel is display:block and visibility:visible at all
          times — only opacity and pointer-events change — so a keyboard user
          below 1280px tabbed off "Open menu" and then pressed Tab a dozen more
          times through links that were painting nothing at all, with the focus
          ring drawn on a fully transparent element. That is a WCAG 2.4.7 Focus
          Visible failure at every mobile and tablet width, and it was the only
          hard failure on the site.

          `inert` rather than aria-hidden: aria-hidden would quieten a screen
          reader while leaving the same links in the tab order, which is the
          worse half of the bug.
        */
        inert={!open}
        className={`fixed inset-0 top-16 z-40 bg-canvas transition-opacity duration-200 xl:hidden ${
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
              href={bookingCta.href}
              onClick={() => setOpen(false)}
              className="btn btn-solid"
            >
              {bookingCta.label}
            </Link>
            <Link
              href="/cars"
              onClick={() => setOpen(false)}
              className="btn btn-outline"
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
