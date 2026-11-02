"use client";

import type { ComponentProps } from "react";
import { Button } from "@/components/zan/ui/Button";
import { useQuote, type QuoteRequest } from "./quoteContext";

/**
 * A call to action that asks for a quote, from anywhere on the page. It lets
 * the server components around it stay server components.
 */
export function QuoteButton({
  location,
  interest,
  ...rest
}: QuoteRequest & Omit<ComponentProps<typeof Button>, "onClick" | "type">) {
  const { ask } = useQuote();
  return <Button onClick={() => ask({ location, interest })} {...rest} />;
}
