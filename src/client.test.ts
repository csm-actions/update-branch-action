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

  it("accepts numbers in a JSON array as numbers or strings", () => {
    expect(parsePullRequestNumbers('[1, "2"]')).toEqual([1, 2]);
  });

  it("fails if a value isn't a positive integer", () => {
    for (const input of [
      "abc",
      "12,abc",
      "0",
      "-1",
      "1.5",
      "0x1A",
      "1e3",
      "[1, null]",
      "[1.5]",
    ]) {
      expect(() => parsePullRequestNumbers(input)).toThrowError(
        "pull_request_number must be positive integers",
      );
    }
  });
});
