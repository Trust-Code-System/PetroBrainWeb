import { ProviderUnavailableError } from "./types";

/**
 * Fetch JSON for a provider, converting every failure mode (network error, non-2xx,
 * unparseable body) into a `ProviderUnavailableError` with a user-safe message. This is
 * what lets the layer degrade to an honest "unavailable" state instead of throwing raw.
 */
export async function fetchJson<T>(
  url: string,
  signal: AbortSignal,
  sourceName: string,
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  } catch {
    throw new ProviderUnavailableError(`Couldn’t reach ${sourceName}.`);
  }
  if (!res.ok) {
    throw new ProviderUnavailableError(`${sourceName} returned an error (HTTP ${res.status}).`);
  }
  try {
    return (await res.json()) as T;
  } catch {
    throw new ProviderUnavailableError(`${sourceName} returned an unreadable response.`);
  }
}
