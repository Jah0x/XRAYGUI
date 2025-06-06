import { db } from "~/server/db";
import { getAuth } from "~/server/actions";

export async function requireAdmin(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user?.isAdmin) {
    throw new Error("Unauthorized: Admin access required");
  }
  return user;
}

export async function getUsers(input?: { role?: string }) {
  const auth = await getAuth({ required: true });
  await requireAdmin(auth.userId);

  const where = input?.role ? { role: input.role } : {};

  return await db.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      role: true,
      telegramUsername: true,
      createdAt: true,
      isAdmin: true,
      _count: {
        select: {
          subscriptions: true,
          payments: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function sendAdminMessage(input: {
  content: string;
  targetRole?: string;
  recipientIds?: string[];
}) {
  const auth = await getAuth({ required: true });
  await requireAdmin(auth.userId);

  if (input.targetRole) {
    if (input.targetRole !== "VIP" && input.targetRole !== "tester") {
      throw new Error(
        "Can only send role-based messages to VIP and tester users",
      );
    }

    const targetUsers = await db.user.findMany({
      where: { role: input.targetRole },
      select: { id: true },
    });

    const messages = await Promise.all(
      targetUsers.map((user) =>
        db.message.create({
          data: {
            content: input.content,
            targetRole: input.targetRole,
            senderId: auth.userId,
            recipientId: user.id,
          },
        }),
      ),
    );

    return { success: true, messageCount: messages.length };
  } else if (input.recipientIds && input.recipientIds.length > 0) {
    const messages = await Promise.all(
      input.recipientIds.map((recipientId) =>
        db.message.create({
          data: {
            content: input.content,
            senderId: auth.userId,
            recipientId,
          },
        }),
      ),
    );

    return { success: true, messageCount: messages.length };
  }

  throw new Error("Either targetRole or recipientIds must be provided");
}

