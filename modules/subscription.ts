import { db } from "~/server/db";
import { getAuth } from "~/server/actions";

// Получить подписки текущего пользователя
export async function getUserSubscriptions() {
  try {
    const auth = await getAuth({ required: true });

    return await db.subscription.findMany({
      where: { userId: auth.userId },
      orderBy: { endDate: "desc" },
    });
  } catch (error) {
    console.error("Error in getUserSubscriptions:", error);
    return [];
  }
}

// Статистика подписок пользователя
export async function getSubscriptionStats() {
  try {
    const auth = await getAuth({ required: true });

    const subscriptions = await db.subscription.findMany({
      where: { userId: auth.userId },
    });

    const activeCount = subscriptions.filter(
      (sub) => sub.status === "active",
    ).length;
    const expiredCount = subscriptions.filter(
      (sub) => sub.status === "expired",
    ).length;
    const totalBandwidth = subscriptions.reduce(
      (sum, sub) => sum + sub.bandwidth,
      0,
    );

    return {
      activeCount,
      expiredCount,
      totalBandwidth,
      totalSubscriptions: subscriptions.length,
    };
  } catch (error) {
    console.error("Error in getSubscriptionStats:", error);
    return {
      activeCount: 0,
      expiredCount: 0,
      totalBandwidth: 0,
      totalSubscriptions: 0,
    };
  }
}
