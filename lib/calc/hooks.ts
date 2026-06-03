"use client";

import { useMutation } from "@tanstack/react-query";
import { calcApi } from "./client";
import type { CalcInputs } from "./types";

/** Run a calc on the backend engine. Mutation (an explicit user action). */
export function useRunCalc() {
  return useMutation({
    mutationFn: ({ calcId, inputs }: { calcId: string; inputs: CalcInputs }) =>
      calcApi.run(calcId, inputs),
  });
}
