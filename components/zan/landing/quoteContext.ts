"use client";

import { createContext, useContext } from "react";

/** What a form needs to know about the page it is on. */
export interface QuotePage {
  slug: string;
  label: string;
  service: string;
  /** The packages, for the "What do you need?" list. A group's label heads it. */
  packages: readonly { label?: string; titles: readonly string[] }[];
}

/** Which button asked. `location` reaches the lead and the reports. */
export interface QuoteRequest {
  location: string;
  /** A package to open the form on: the card the visitor pressed. */
  interest?: string;
}

export interface QuoteApi {
  page: QuotePage;
  ask: (request: QuoteRequest) => void;
}

export const QuoteContext = createContext<QuoteApi | null>(null);

export function useQuote(): QuoteApi {
  const api = useContext(QuoteContext);
  if (!api) throw new Error("useQuote must be used inside QuoteProvider");
  return api;
}
