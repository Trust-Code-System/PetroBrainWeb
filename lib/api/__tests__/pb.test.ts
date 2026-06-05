import { describe, expect, it } from "vitest";
import { ApiError, swallowNotFound } from "../pb";

describe("swallowNotFound", () => {
  it.each([401, 404, 501, 502, 503, 504])(
    "resolves optional read failures for HTTP %s",
    async (status) => {
      await expect(swallowNotFound(Promise.reject(new ApiError(status, "missing")))).resolves.toBeUndefined();
    },
  );

  it("still propagates non-optional failures", async () => {
    await expect(swallowNotFound(Promise.reject(new ApiError(500, "broken")))).rejects.toThrow("broken");
  });
});
