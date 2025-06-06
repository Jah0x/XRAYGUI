import { expect } from "expect";
import { getUserSubscriptions, getSubscriptionStats } from "./subscription";

export async function _runSubscriptionTests() {
  const result = { passedTests: [] as string[], failedTests: [] as { name: string; error: string }[] };

  try {
    expect(typeof getUserSubscriptions).toBe("function");
    expect(typeof getSubscriptionStats).toBe("function");
    result.passedTests.push("subscription functions defined");
  } catch (error) {
    result.failedTests.push({ name: "subscription functions defined", error: (error as Error).message });
  }

  return result;
}

