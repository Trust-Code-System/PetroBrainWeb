"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { calcApi } from "./client";
import type { CalcInputs } from "./types";

/** The calc catalog from the backend engine (drives the picker + forms). */
export function useCalcCatalog() {
  return useQuery({
    queryKey: ["calc", "catalog"],
    queryFn: ({ signal }) => calcApi.catalog(signal),
    staleTime: 5 * 60 * 1000,
  });
}

/** Run a calc on the backend engine. Mutation (an explicit user action). */
export function useRunCalc() {
  return useMutation({
    mutationFn: ({ calcId, inputs }: { calcId: string; inputs: CalcInputs }) =>
      calcApi.run(calcId, inputs),
  });
}
