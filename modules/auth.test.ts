import { expect } from "expect";
import { getCurrentUser } from "./auth";

export async function _runAuthTests() {
  const result = { passedTests: [] as string[], failedTests: [] as { name: string; error: string }[] };

  try {
    expect(typeof getCurrentUser).toBe("function");
    result.passedTests.push("getCurrentUser defined");
  } catch (error) {
    result.failedTests.push({ name: "getCurrentUser defined", error: (error as Error).message });
  }

  return result;
}

