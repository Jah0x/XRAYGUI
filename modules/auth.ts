import { db } from "~/server/db";
import { getAuth } from "~/server/actions";

// Получение текущего пользователя
export async function getCurrentUser() {
  try {
    const auth = await getAuth();
    if (auth.status !== "authenticated") {
      return null;
    }

    let user = await db.user.findUnique({
      where: { id: auth.userId },
    });

    if (!user) {
      // Создаем пользователя, если его нет в базе
      user = await db.user.create({
        data: { id: auth.userId },
      });
    }

    return user;
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    throw new Error("Failed to get current user");
  }
}
