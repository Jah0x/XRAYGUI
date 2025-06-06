import { expect } from "expect";
import { generateTelegramToken, verifyTelegramToken, getUserByTelegramId } from "./telegram";

export async function _runTelegramTests() {
  const result = { passedTests: [] as string[], failedTests: [] as { name: string; error: string }[] };

  try {
    expect(typeof generateTelegramToken).toBe("function");
    expect(typeof verifyTelegramToken).toBe("function");
    expect(typeof getUserByTelegramId).toBe("function");
    result.passedTests.push("telegram functions defined");
  } catch (error) {
    result.failedTests.push({ name: "telegram functions defined", error: (error as Error).message });
  }

  return result;
}

