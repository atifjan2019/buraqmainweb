"use client";

import Script from "next/script";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  codeweaversScriptUrl,
  contact,
  financeFullDisclaimer,
  site,
  whatsappLink,
} from "@/lib/site";
import { Phone, WhatsApp } from "./Icons";

interface CodeweaversVehicle {
  type: string;
  mileage: string;
  isNew: string;
  identifierType: string;
  cashPrice: string;
  identifier: string;
  imageUrl?: string;
  linkBackUrl: string;
  registration: { number: string; date: string };
}

interface CodeweaversConfig {
  pluginContentDivId: string;
  vehicle: CodeweaversVehicle;
  defaultParameters: Record<string, unknown>;
}

declare global {
  interface Window {
    codeweavers?: { main: (config: CodeweaversConfig) => void };
  }
}

interface FinanceCalculatorProps {
  /** Pre-fills the price, e.g. from a vehicle detail page. */
  initialPrice?: number;
  /** Shown in the quote where the plugin supports it. */
  vehicleImageUrl?: string;
}

export default function FinanceCalculator({
  initialPrice = 10000,
  vehicleImageUrl,
}: FinanceCalculatorProps) {
  const [price, setPrice] = useState(String(initialPrice));
  const [status, setStatus] = useState<
    "idle" | "ready" | "failed" | "unauthorised"
  >("idle");
  const containerId = useId().replace(/:/g, "");
  // The plugin mutates this div directly, so React must not own its children.
  const mounted = useRef(false);
  const verifyTimer = useRef<number | null>(null);
  const wa = whatsappLink("Hi Burraq Motors, I'd like to discuss car finance.");

  // Don't leave a pending check running after the component goes away.
  useEffect(
    () => () => {
      if (verifyTimer.current) window.clearTimeout(verifyTimer.current);
    },
    [],
  );

  const render = useCallback(
    (cashPrice: string) => {
      const cw = window.codeweavers;
      const host = document.getElementById(containerId);
      if (!cw || !host) {
        setStatus("failed");
        return;
      }

      const amount = Number(cashPrice.replace(/[^0-9.]/g, ""));
      if (!Number.isFinite(amount) || amount <= 0) return;

      // A rejected API key sometimes throws and sometimes only writes to the
      // console, so neither a try/catch nor a clean return proves success.
      // Contain the throw, then confirm the plugin actually rendered.
      try {
        cw.main({
          pluginContentDivId: containerId,
          vehicle: {
            type: "Car",
            mileage: "10",
            isNew: "false",
            identifierType: "",
            cashPrice: String(amount),
            identifier: " ",
            ...(vehicleImageUrl ? { imageUrl: vehicleImageUrl } : {}),
            linkBackUrl: site.url,
            registration: { number: "NOVEHICLE", date: "2018-01-01" },
          },
          defaultParameters: {
            deposit: { defaultValue: 10, defaultType: "Percentage" },
            term: { defaultValue: 60 },
            annualMileage: { defaultValue: 10000 },
          },
        });

        mounted.current = true;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setStatus(/authenticate/i.test(message) ? "unauthorised" : "failed");
        return;
      }

      // Treat an empty container after a grace period as a failed render,
      // which is what an unauthorised API key looks like from out here.
      if (verifyTimer.current) window.clearTimeout(verifyTimer.current);
      verifyTimer.current = window.setTimeout(() => {
        setStatus(host.childElementCount > 0 ? "ready" : "unauthorised");
      }, 4000);
    },
    [containerId, vehicleImageUrl],
  );

  return (
    <div className="glass overflow-hidden rounded-2xl">
      {/* Our own controls, styled to the site */}
      <form
        className="border-b border-line-soft p-6 sm:p-8"
        onSubmit={(e) => {
          e.preventDefault();
          render(price);
        }}
      >
        <label
          htmlFor={`${containerId}-price`}
          className="block font-display text-lg font-semibold text-ink"
        >
          What's the vehicle price?
        </label>
        <p className="mt-2 text-sm text-muted">
          Enter a price and we'll show you illustrative Hire Purchase payments.
        </p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center rounded-full border border-line bg-canvas/60 focus-within:border-amber/50">
            <span className="pl-5 font-display text-lg text-muted">£</span>
            <input
              id={`${containerId}-price`}
              name="cashPrice"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              maxLength={7}
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))}
              className="w-full bg-transparent px-3 py-4 font-display text-lg text-ink outline-none placeholder:text-faint"
              placeholder="10000"
            />
          </div>
          <button
            type="submit"
            className="rounded-full bg-amber px-8 py-4 font-semibold text-canvas transition-all hover:bg-amber-bright hover:shadow-[0_0_36px_-8px_var(--color-amber)]"
          >
            Calculate
          </button>
        </div>
      </form>

      {/*
        The Codeweavers plugin renders its own light-themed UI, so once it is
        live it gets a light panel rather than fighting the dark canvas. The
        container must stay mounted at all times because the plugin looks it up
        by id before rendering into it.
      */}
      <div className={status === "ready" ? "bg-[#f4f4f5] p-3 sm:p-5" : ""}>
        <div
          id={containerId}
          className="[&_*]:max-w-full"
          suppressHydrationWarning
        />

        {status !== "ready" && (
          <div className="px-6 py-10 text-center">
            {status === "idle" ? (
              <p className="text-sm text-muted">
                Loading the finance calculator…
              </p>
            ) : (
              <>
                <p className="text-sm leading-relaxed text-muted">
                  {status === "unauthorised"
                    ? "Our live quote calculator isn't available on this address yet."
                    : "The finance calculator couldn't load — an ad blocker or privacy extension may be blocking it."}{" "}
                  Call or message us and we'll run the figures for you straight
                  away.
                </p>
                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                  {contact.phone && (
                    <a
                      href={`tel:${contact.phoneHref}`}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-amber px-6 py-3 text-sm font-semibold text-canvas transition-colors hover:bg-amber-bright"
                    >
                      <Phone className="h-4 w-4" />
                      {contact.phone}
                    </a>
                  )}
                  {wa && (
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-amber/40 hover:text-amber"
                    >
                      <WhatsApp className="h-4 w-4" />
                      WhatsApp us
                    </a>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Regulatory disclosure — required alongside any finance illustration */}
      <div className="border-t border-line-soft p-6 sm:px-8">
        <p className="text-xs leading-relaxed text-faint">
          {financeFullDisclaimer}
        </p>

        {/* The fallback state already offers these, so don't repeat them. */}
        {status === "ready" && (
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            {contact.phone && (
              <a
                href={`tel:${contact.phoneHref}`}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-amber/40 hover:text-amber"
              >
                <Phone className="h-4 w-4" />
                {contact.phone}
              </a>
            )}
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-amber/40 hover:text-amber"
              >
                <WhatsApp className="h-4 w-4" />
                Ask about finance
              </a>
            )}
          </div>
        )}
      </div>

      <Script
        src={codeweaversScriptUrl()}
        strategy="lazyOnload"
        onReady={() => {
          if (!mounted.current) render(price);
        }}
        onError={() => setStatus("failed")}
      />
    </div>
  );
}
