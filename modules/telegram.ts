import { db } from "~/server/db";
import { getAuth } from "~/server/actions";
import crypto from "crypto";

// Генерация токена для привязки Telegram
export async function generateTelegramToken() {
  try {
    const auth = await getAuth({ required: true });
    const user = await db.user.findUnique({ where: { id: auth.userId } });

    if (!user) {
      throw new Error("User not found");
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await db.telegramToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    return { token };
  } catch (error) {
    console.error("Error in generateTelegramToken:", error);
    throw new Error("Failed to generate Telegram token");
  }
}

// Проверка Telegram-токена
export async function verifyTelegramToken(input: {
  token: string;
  telegramId: string;
  username?: string;
}) {
  try {
    const telegramToken = await db.telegramToken.findUnique({
      where: { token: input.token },
      include: { user: true },
    });

    if (!telegramToken) {
      return { success: false, message: "Invalid token" };
    }

    if (telegramToken.isUsed) {
      return { success: false, message: "Token already used" };
    }

    if (telegramToken.expiresAt < new Date()) {
      return { success: false, message: "Token expired" };
    }

    if (!telegramToken.userId) {
      return { success: false, message: "Token not associated with a user" };
    }

    await db.user.update({
      where: { id: telegramToken.userId },
      data: {
        telegramId: input.telegramId,
        telegramUsername: input.username,
      },
    });

    await db.telegramToken.update({
      where: { id: telegramToken.id },
      data: { isUsed: true },
    });

    return { success: true, userId: telegramToken.userId };
  } catch (error) {
    console.error("Error in verifyTelegramToken:", error);
    return { success: false, message: "Error verifying token" };
  }
}

// Получение пользователя по Telegram ID
export async function getUserByTelegramId(input: { telegramId: string }) {
  try {
    const user = await db.user.findUnique({
      where: { telegramId: input.telegramId },
      include: { subscriptions: true },
    });

    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error in getUserByTelegramId:", error);
    return null;
  }
}
