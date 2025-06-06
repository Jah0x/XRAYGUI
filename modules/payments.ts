import { db } from "~/server/db";
import { getAuth, sendEmail } from "~/server/actions";
import { requireAdmin } from "./admin";

export async function initiatePayment(input: {
  planId: string;
  paymentDetails?: string;
}) {
  try {
    const auth = await getAuth({ required: true });

    const plan = await db.subscriptionPlan.findUnique({
      where: { id: input.planId },
    });
    if (!plan) {
      throw new Error("Subscription plan not found");
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    switch (plan.duration) {
      case "7days":
        endDate.setDate(endDate.getDate() + 7);
        break;
      case "1month":
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case "3months":
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case "6months":
        endDate.setMonth(endDate.getMonth() + 6);
        break;
      case "12months":
        endDate.setMonth(endDate.getMonth() + 12);
        break;
      default:
        endDate.setMonth(endDate.getMonth() + 1);
    }

    const { payment, subscription } = await db.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          amount: plan.price,
          userId: auth.userId,
          paymentDetails: input.paymentDetails,
        },
      });

      const subscription = await tx.subscription.create({
        data: {
          planName: plan.name,
          planDuration: plan.duration,
          price: plan.price,
          startDate,
          endDate,
          userId: auth.userId,
          paymentId: payment.id,
        },
      });

      return { payment, subscription };
    });

    const admins = await db.user.findMany({ where: { isAdmin: true } });
    for (const admin of admins) {
      if (admin.telegramId) {
        console.log(
          `Notify admin ${admin.id} via Telegram about payment ${payment.id}`,
        );
      }
      if (admin.id) {
        try {
          await sendEmail({
            toUserId: admin.id,
            subject: "New VPN Subscription Payment",
            markdown: `
### New Payment Requires Approval

**User ID:** ${auth.userId}
**Plan:** ${plan.name}
**Amount:** ${plan.price}
**Duration:** ${plan.duration}

Please review and approve this payment in the admin dashboard.
            `,
          });
        } catch (error) {
          console.error("Failed to send admin notification email:", error);
        }
      }
    }

    return { paymentId: payment.id, subscriptionId: subscription.id };
  } catch (error) {
    console.error("Error in initiatePayment:", error);
    throw new Error("Failed to initiate payment");
  }
}

export async function approvePayment(input: { paymentId: string }) {
  try {
    const auth = await getAuth({ required: true });
    await requireAdmin(auth.userId);

    const { payment, subscription } = await db.$transaction(async (tx) => {
      const payment = await tx.payment.update({
        where: { id: input.paymentId },
        data: {
          status: "completed",
          adminApproved: true,
          adminId: auth.userId,
        },
        include: { subscription: true },
      });

      if (!payment.subscription) {
        throw new Error("No subscription found for this payment");
      }

      const subscription = await tx.subscription.update({
        where: { id: payment.subscription.id },
        data: { status: "active" },
        include: { user: true },
      });

      return { payment, subscription };
    });

    if (subscription.user.id) {
      try {
        await sendEmail({
          toUserId: subscription.user.id,
          subject: "Your VPN Subscription is Active",
          markdown: `
### Your VPN Subscription is Now Active!

**Plan:** ${subscription.planName}
**Duration:** ${subscription.planDuration}
**Valid Until:** ${new Date(subscription.endDate).toLocaleDateString()}

Thank you for your purchase. You can now access all VPN features.
          `,
        });
      } catch (error) {
        console.error("Failed to send subscription activation email:", error);
      }
    }

    return { success: true, subscription };
  } catch (error) {
    console.error("Error in approvePayment:", error);
    throw new Error("Failed to approve payment");
  }
}

export async function rejectPayment(input: { paymentId: string; reason?: string }) {
  try {
    const auth = await getAuth({ required: true });
    await requireAdmin(auth.userId);

    const { payment } = await db.$transaction(async (tx) => {
      const payment = await tx.payment.update({
        where: { id: input.paymentId },
        data: {
          status: "cancelled",
          adminApproved: false,
          adminId: auth.userId,
        },
        include: { subscription: true, user: true },
      });

      if (payment.subscription) {
        await tx.subscription.update({
          where: { id: payment.subscription.id },
          data: { status: "suspended" },
        });
      }

      return { payment };
    });

    if (payment.user.id) {
      try {
        await sendEmail({
          toUserId: payment.user.id,
          subject: "Your VPN Payment Was Rejected",
          markdown: `
### Your VPN Payment Was Rejected

**Amount:** ${payment.amount}
**Reason:** ${input.reason || "No reason provided"}

Please contact support for more information or try again with a different payment method.
          `,
        });
      } catch (error) {
        console.error("Failed to send payment rejection email:", error);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error in rejectPayment:", error);
    throw new Error("Failed to reject payment");
  }
}

export async function getAllPayments() {
  const auth = await getAuth({ required: true });
  await requireAdmin(auth.userId);

  return db.payment.findMany({
    include: { user: true, subscription: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function extendSubscription(input: { subscriptionId: string; months: number }) {
  const auth = await getAuth({ required: true });

  const subscription = await db.subscription.findUnique({
    where: { id: input.subscriptionId },
    include: { user: true },
  });
  if (!subscription) {
    throw new Error("Subscription not found");
  }

  const isAdmin = await db.user.findUnique({
    where: { id: auth.userId },
    select: { isAdmin: true },
  });

  if (subscription.userId !== auth.userId && !isAdmin?.isAdmin) {
    throw new Error("Unauthorized: You cannot extend this subscription");
  }

  if (!isAdmin?.isAdmin) {
    throw new Error("Please use the payment system to extend your subscription");
  }

  const newEndDate = new Date(subscription.endDate);
  newEndDate.setMonth(newEndDate.getMonth() + input.months);

  return db.subscription.update({
    where: { id: input.subscriptionId },
    data: {
      endDate: newEndDate,
      status: "active",
    },
  });
}

export async function getUserPayments() {
  const auth = await getAuth({ required: true });

  return db.payment.findMany({
    where: { userId: auth.userId },
    include: { subscription: true },
    orderBy: { createdAt: "desc" },
  });
}

