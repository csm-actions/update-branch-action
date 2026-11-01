import { describe, it, expect } from "vitest";
import { isAlreadyUpToDate, parseLabelDescription } from "./server";

describe("parseLabelDescription", () => {
  it("parses a label description", () => {
    expect(parseLabelDescription("example/client/123")).toEqual({
      owner: "example",
      repo: "client",
      prNumber: 123,
    });
  });

  it("fails if the description has less than three elements", () => {
    expect(() => parseLabelDescription("example/client")).toThrowError(
      "Invalid label description format: example/client. Expected format: owner/repo/pr_number",
    );
  });

  // The current behavior: extra elements are ignored and the pull request
  // number isn't validated.
  it("ignores extra elements", () => {
    expect(parseLabelDescription("example/client/123/456")).toEqual({
      owner: "example",
      repo: "client",
      prNumber: 123,
    });
  });

  it("doesn't validate the pull request number", () => {
    expect(parseLabelDescription("example/client/abc").prNumber).toBeNaN();
  });
});

describe("isAlreadyUpToDate", () => {
  it("returns true for the 422 error of an up-to-date branch", () => {
    expect(
      isAlreadyUpToDate({
        status: 422,
        message: "There are no new commits on the base branch.",
      }),
    ).toBe(true);
  });

  it("returns false for other errors", () => {
    for (const error of [
      { status: 422, message: "Validation Failed" },
      { status: 500, message: "There are no new commits on the base branch." },
      new Error("There are no new commits on the base branch."),
      "There are no new commits on the base branch.",
      null,
      undefined,
    ]) {
      expect(isAlreadyUpToDate(error)).toBe(false);
    }
  });
});
