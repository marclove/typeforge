import { describe, expect, it } from "vitest";

describe("sanity", () => {
  it("adds numbers", () => {
    const sum = (a: number, b: number) => a + b;
    expect(sum(2, 3)).toBe(5);
  });
});
