import { db } from "~/server/db";
import { getAuth } from "~/server/actions";
import { requireAdmin } from "./admin";

export async function createOffer(input: {
  title: string;
  description: string;
  imageUrl?: string;
  price: number;
  isVisible?: boolean;
  priority?: number;
  startDate?: string;
  endDate?: string;
}) {
  const auth = await getAuth({ required: true });
  await requireAdmin(auth.userId);

  return db.offer.create({
    data: {
      title: input.title,
      description: input.description,
      imageUrl: input.imageUrl,
      price: input.price,
      isVisible: input.isVisible !== undefined ? input.isVisible : true,
      priority: input.priority || 0,
      startDate: input.startDate ? new Date(input.startDate) : null,
      endDate: input.endDate ? new Date(input.endDate) : null,
    },
  });
}

export async function updateOffer(input: {
  id: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  isVisible?: boolean;
  priority?: number;
  startDate?: string | null;
  endDate?: string | null;
}) {
  const auth = await getAuth({ required: true });
  await requireAdmin(auth.userId);

  const updateData: any = {};
  if (input.title !== undefined) updateData.title = input.title;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl;
  if (input.price !== undefined) updateData.price = input.price;
  if (input.isVisible !== undefined) updateData.isVisible = input.isVisible;
  if (input.priority !== undefined) updateData.priority = input.priority;
  if (input.startDate !== undefined) updateData.startDate = input.startDate ? new Date(input.startDate) : null;
  if (input.endDate !== undefined) updateData.endDate = input.endDate ? new Date(input.endDate) : null;

  return db.offer.update({
    where: { id: input.id },
    data: updateData,
  });
}

export async function deleteOffer(input: { id: string }) {
  const auth = await getAuth({ required: true });
  await requireAdmin(auth.userId);

  await db.offer.delete({ where: { id: input.id } });
  return { success: true };
}

export async function getAllOffers(input?: { includeHidden?: boolean }) {
  const auth = await getAuth();
  const isAdmin =
    auth.status === "authenticated"
      ? await db.user.findUnique({ where: { id: auth.userId }, select: { isAdmin: true } })
      : null;

  let where: any = !isAdmin?.isAdmin && !input?.includeHidden ? { isVisible: true } : {};

  if (!isAdmin?.isAdmin) {
    const now = new Date();
    where.AND = [
      { OR: [{ startDate: null }, { startDate: { lte: now } }] },
      { OR: [{ endDate: null }, { endDate: { gte: now } }] },
    ];
  }

  return db.offer.findMany({
    where,
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });
}

