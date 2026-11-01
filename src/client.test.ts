import { describe, it, expect } from "vitest";
import { parsePullRequestNumbers } from "./client";

describe("parsePullRequestNumbers", () => {
  it("parses a number", () => {
    expect(parsePullRequestNumbers("123")).toEqual([123]);
  });

  it("parses numbers separated by commas and newlines", () => {
    expect(parsePullRequestNumbers(" 1, 2\n3,\n\n 4 ")).toEqual([1, 2, 3, 4]);
  });

  it("parses a JSON array", () => {
    expect(parsePullRequestNumbers("[1, 2, 3]")).toEqual([1, 2, 3]);
  });

  it("returns an empty array for an empty input", () => {
    expect(parsePullRequestNumbers("")).toEqual([]);
  });

  // The current behavior: values that aren't numbers become NaN.
  it("doesn't validate numbers", () => {
    expect(parsePullRequestNumbers("abc")).toEqual([NaN]);
  });
});
