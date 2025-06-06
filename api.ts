import { db } from "~/server/db";
import { getAuth, sendEmail } from "~/server/actions";
import { z } from "zod";
import { nanoid } from "nanoid";
import crypto from "crypto";
import axios from "axios";
import fs from "fs";
import util from "util";
import { exec as execCallback } from "child_process";

// Constants for authentication
const TOKEN_EXPIRY_HOURS = 24;
const EMAIL_VERIFICATION_EXPIRY_HOURS = 48;
const PASSWORD_RESET_EXPIRY_HOURS = 24;

// Promisify exec for async/await usage
const exec = util.promisify(execCallback);

// User Authentication
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
      // Create user if they don't exist yet
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

// Subscription Management
export async function getUserSubscriptions() {
  try {
    const auth = await getAuth({ required: true });

    return await db.subscription.findMany({
      where: { userId: auth.userId },
      orderBy: { endDate: "desc" },
    });
  } catch (error) {
    console.error("Error in getUserSubscriptions:", error);
    // Return empty array instead of throwing to handle gracefully in UI
    return [];
  }
}

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
    // Return default stats object to handle gracefully in UI
    return {
      activeCount: 0,
      expiredCount: 0,
      totalBandwidth: 0,
      totalSubscriptions: 0,
    };
  }
}

// Telegram Integration
export async function generateTelegramToken() {
  try {
    const auth = await getAuth({ required: true });
    const user = await db.user.findUnique({ where: { id: auth.userId } });

    if (!user) {
      throw new Error("User not found");
    }

    // Generate a secure token
    const token = crypto.randomBytes(32).toString("hex");

    // Set expiration to 24 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Create token in database
    const telegramToken = await db.telegramToken.create({
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

export async function verifyTelegramToken(input: {
  token: string;
  telegramId: string;
  username?: string;
}) {
  try {
    // Find the token
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

    // Update the user with Telegram info
    await db.user.update({
      where: { id: telegramToken.userId },
      data: {
        telegramId: input.telegramId,
        telegramUsername: input.username,
      },
    });

    // Mark token as used
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

// Subscription Plans
export async function getSubscriptionPlans() {
  try {
    return await db.subscriptionPlan.findMany({
      orderBy: { price: "asc" },
    });
  } catch (error) {
    console.error("Error in getSubscriptionPlans:", error);
    return [];
  }
}

export async function createSubscriptionPlan(input: {
  name: string;
  duration: string;
  price: number;
  description?: string;
}) {
  try {
    const auth = await getAuth({ required: true });
    const user = await db.user.findUnique({ where: { id: auth.userId } });

    if (!user?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    return await db.subscriptionPlan.create({
      data: {
        name: input.name,
        duration: input.duration,
        price: input.price,
        description: input.description,
      },
    });
  } catch (error) {
    console.error("Error in createSubscriptionPlan:", error);
    throw new Error("Failed to create subscription plan");
  }
}

// Payment System
export async function initiatePayment(input: {
  planId: string;
  paymentDetails?: string;
}) {
  try {
    const auth = await getAuth({ required: true });

    // Get the subscription plan
    const plan = await db.subscriptionPlan.findUnique({
      where: { id: input.planId },
    });

    if (!plan) {
      throw new Error("Subscription plan not found");
    }

    // Calculate end date based on plan duration
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
        endDate.setMonth(endDate.getMonth() + 1); // Default to 1 month
    }

    // Create payment record
    const payment = await db.payment.create({
      data: {
        amount: plan.price,
        userId: auth.userId,
        paymentDetails: input.paymentDetails,
      },
    });

    // Create pending subscription
    const subscription = await db.subscription.create({
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

    // Notify admins about new payment
    const admins = await db.user.findMany({ where: { isAdmin: true } });
    for (const admin of admins) {
      if (admin.telegramId) {
        // In a real implementation, you would send Telegram notification here
        console.log(
          `Notify admin ${admin.id} via Telegram about payment ${payment.id}`,
        );
      }

      // Send email notification if we have an admin
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
    const user = await db.user.findUnique({ where: { id: auth.userId } });

    if (!user?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Update payment status
    const payment = await db.payment.update({
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

    // Activate the subscription
    const subscription = await db.subscription.update({
      where: { id: payment.subscription.id },
      data: { status: "active" },
      include: { user: true },
    });

    // Notify the user that their subscription is now active
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

export async function rejectPayment(input: {
  paymentId: string;
  reason?: string;
}) {
  try {
    const auth = await getAuth({ required: true });
    const user = await db.user.findUnique({ where: { id: auth.userId } });

    if (!user?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Update payment status
    const payment = await db.payment.update({
      where: { id: input.paymentId },
      data: {
        status: "cancelled",
        adminApproved: false,
        adminId: auth.userId,
      },
      include: { subscription: true, user: true },
    });

    if (payment.subscription) {
      // Cancel the subscription
      await db.subscription.update({
        where: { id: payment.subscription.id },
        data: { status: "suspended" },
      });
    }

    // Notify the user that their payment was rejected
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

// User Management API
export async function getUsers(input?: { role?: string }) {
  try {
    const auth = await getAuth({ required: true });
    const user = await db.user.findUnique({ where: { id: auth.userId } });

    if (!user?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Build the where clause based on the role filter
    const where = input?.role ? { role: input.role } : {};

    const users = await db.user.findMany({
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

    return users;
  } catch (error) {
    console.error("Error in getUsers:", error);
    throw new Error("Failed to get users");
  }
}

export async function sendAdminMessage(input: {
  content: string;
  targetRole?: string;
  recipientIds?: string[];
}) {
  try {
    const auth = await getAuth({ required: true });
    const sender = await db.user.findUnique({ where: { id: auth.userId } });

    if (!sender?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    // If targetRole is provided, send to all users with that role
    if (input.targetRole) {
      // Only allow sending to VIP and tester roles as specified in requirements
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
    }

    // If recipientIds is provided, send to those specific users
    else if (input.recipientIds && input.recipientIds.length > 0) {
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
  } catch (error) {
    console.error("Error in sendAdminMessage:", error);
    throw new Error("Failed to send admin message");
  }
}

export async function setDiscount(input: {
  code: string;
  percentage: number;
  expiresAt?: string;
  userId?: string;
  targetRole?: string;
  description?: string;
  isGift?: boolean;
  giftDetails?: string;
  maxUsageCount?: number;
}) {
  try {
    const auth = await getAuth({ required: true });
    const user = await db.user.findUnique({ where: { id: auth.userId } });

    if (!user?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Validate percentage is between 0 and 100
    if (input.percentage < 0 || input.percentage > 100) {
      throw new Error("Discount percentage must be between 0 and 100");
    }

    // Create the discount
    const discount = await db.discount.create({
      data: {
        code: input.code,
        percentage: input.percentage,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        userId: input.userId,
        targetRole: input.targetRole,
        description: input.description,
        isGift: input.isGift || false,
        giftDetails: input.giftDetails,
        maxUsageCount: input.maxUsageCount || null,
      },
    });

    return discount;
  } catch (error) {
    console.error("Error in setDiscount:", error);
    throw new Error("Failed to set discount");
  }
}

export async function updateVpnOption(input: {
  id?: string;
  name: string;
  price: number;
  description?: string;
}) {
  try {
    const auth = await getAuth({ required: true });
    const user = await db.user.findUnique({ where: { id: auth.userId } });

    if (!user?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    if (input.id) {
      // Update existing VPN option
      return await db.vpnOption.update({
        where: { id: input.id },
        data: {
          name: input.name,
          price: input.price,
          description: input.description,
        },
      });
    } else {
      // Create new VPN option
      return await db.vpnOption.create({
        data: {
          name: input.name,
          price: input.price,
          description: input.description,
        },
      });
    }
  } catch (error) {
    console.error("Error in updateVpnOption:", error);
    throw new Error("Failed to update VPN option");
  }
}

// News API
export async function createNews(input: {
  title: string;
  content: string;
  publishDate?: string;
  isPublished?: boolean;
}) {
  try {
    const auth = await getAuth({ required: true });
    const user = await db.user.findUnique({ where: { id: auth.userId } });

    if (!user?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const news = await db.news.create({
      data: {
        title: input.title,
        content: input.content,
        publishDate: input.publishDate
          ? new Date(input.publishDate)
          : new Date(),
        isPublished: input.isPublished !== undefined ? input.isPublished : true,
      },
    });

    return news;
  } catch (error) {
    console.error("Error in createNews:", error);
    throw new Error("Failed to create news");
  }
}

export async function getNews(input?: { onlyPublished?: boolean }) {
  try {
    const auth = await getAuth();

    // Determine if we should filter for published news only
    // If user is not admin or onlyPublished is true, only show published news
    const onlyPublished = input?.onlyPublished !== false;
    let where = {};

    if (auth.status === "authenticated") {
      const user = await db.user.findUnique({ where: { id: auth.userId } });

      // If not admin or explicitly requesting only published, filter for published news
      if (!user?.isAdmin || onlyPublished) {
        where = { isPublished: true };
      }
    } else {
      // Not authenticated, only show published news
      where = { isPublished: true };
    }

    return await db.news.findMany({
      where,
      orderBy: { publishDate: "desc" },
    });
  } catch (error) {
    console.error("Error in getNews:", error);
    return [];
  }
}

export async function deleteNews(input: { id: string }) {
  try {
    const auth = await getAuth({ required: true });
    const user = await db.user.findUnique({ where: { id: auth.userId } });

    if (!user?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    await db.news.delete({
      where: { id: input.id },
    });

    return { success: true };
  } catch (error) {
    console.error("Error in deleteNews:", error);
    throw new Error("Failed to delete news");
  }
}

// User Messages API
export async function getUserMessages() {
  try {
    const auth = await getAuth({ required: true });

    return await db.message.findMany({
      where: { recipientId: auth.userId },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error in getUserMessages:", error);
    return [];
  }
}

export async function markMessageAsRead(input: { messageId: string }) {
  try {
    const auth = await getAuth({ required: true });

    const message = await db.message.findUnique({
      where: { id: input.messageId },
      select: { recipientId: true },
    });

    if (!message) {
      throw new Error("Message not found");
    }

    if (message.recipientId !== auth.userId) {
      throw new Error(
        "Unauthorized: You can only mark your own messages as read",
      );
    }

    await db.message.update({
      where: { id: input.messageId },
      data: { isRead: true },
    });

    return { success: true };
  } catch (error) {
    console.error("Error in markMessageAsRead:", error);
    throw new Error("Failed to mark message as read");
  }
}

// Admin Dashboard
export async function getAllSubscriptions() {
  try {
    const auth = await getAuth({ required: true });
    const user = await db.user.findUnique({ where: { id: auth.userId } });

    if (!user?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    return await db.subscription.findMany({
      include: { user: true, payment: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error in getAllSubscriptions:", error);
    return [];
  }
}

export async function getAllDiscounts() {
  try {
    const auth = await getAuth({ required: true });
    const user = await db.user.findUnique({ where: { id: auth.userId } });

    if (!user?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    return await db.discount.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error in getAllDiscounts:", error);
    return [];
  }
}

export async function updateDiscount(input: {
  id: string;
  code?: string;
  percentage?: number;
  isActive?: boolean;
  expiresAt?: string | null;
  userId?: string | null;
  targetRole?: string | null;
  description?: string | null;
  isGift?: boolean;
  giftDetails?: string | null;
  maxUsageCount?: number | null;
}) {
  try {
    const auth = await getAuth({ required: true });
    const user = await db.user.findUnique({ where: { id: auth.userId } });

    if (!user?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Prepare the data to update
    const updateData: any = {};

    if (input.code !== undefined) updateData.code = input.code;
    if (input.percentage !== undefined)
      updateData.percentage = input.percentage;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;
    if (input.expiresAt !== undefined)
      updateData.expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;
    if (input.userId !== undefined) updateData.userId = input.userId;
    if (input.targetRole !== undefined)
      updateData.targetRole = input.targetRole;
    if (input.description !== undefined)
      updateData.description = input.description;
    if (input.isGift !== undefined) updateData.isGift = input.isGift;
    if (input.giftDetails !== undefined)
      updateData.giftDetails = input.giftDetails;
    if (input.maxUsageCount !== undefined)
      updateData.maxUsageCount = input.maxUsageCount;

    return await db.discount.update({
      where: { id: input.id },
      data: updateData,
    });
  } catch (error) {
    console.error("Error in updateDiscount:", error);
    throw new Error(
      `Failed to update discount: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function deleteDiscount(input: { id: string }) {
  try {
    const auth = await getAuth({ required: true });
    const user = await db.user.findUnique({ where: { id: auth.userId } });

    if (!user?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    await db.discount.delete({
      where: { id: input.id },
    });

    return { success: true };
  } catch (error) {
    console.error("Error in deleteDiscount:", error);
    throw new Error(
      `Failed to delete discount: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function generatePromoCode(input: {
  prefix?: string;
  length?: number;
}) {
  try {
    const auth = await getAuth({ required: true });
    const user = await db.user.findUnique({ where: { id: auth.userId } });

    if (!user?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const prefix = input.prefix || "PROMO";
    const length = input.length || 6;

    // Generate a random alphanumeric code
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = prefix;

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters.charAt(randomIndex);
    }

    return { code };
  } catch (error) {
    console.error("Error in generatePromoCode:", error);
    throw new Error(
      `Failed to generate promo code: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function getDiscountStats() {
  try {
    const auth = await getAuth({ required: true });
    const user = await db.user.findUnique({ where: { id: auth.userId } });

    if (!user?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const allDiscounts = await db.discount.findMany();

    const activeCount = allDiscounts.filter(
      (d) => d.isActive && (!d.expiresAt || d.expiresAt > new Date()),
    ).length;
    const expiredCount = allDiscounts.filter(
      (d) => d.expiresAt && d.expiresAt < new Date(),
    ).length;
    const totalUsageCount = allDiscounts.reduce(
      (sum, discount) => sum + discount.usageCount,
      0,
    );

    return {
      totalCount: allDiscounts.length,
      activeCount,
      expiredCount,
      inactiveCount: allDiscounts.filter((d) => !d.isActive).length,
      totalUsageCount,
    };
  } catch (error) {
    console.error("Error in getDiscountStats:", error);
    return {
      totalCount: 0,
      activeCount: 0,
      expiredCount: 0,
      inactiveCount: 0,
      totalUsageCount: 0,
    };
  }
}

export async function getAllPayments() {
  try {
    const auth = await getAuth({ required: true });
    const user = await db.user.findUnique({ where: { id: auth.userId } });

    if (!user?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    return await db.payment.findMany({
      include: { user: true, subscription: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error in getAllPayments:", error);
    return [];
  }
}

export async function extendSubscription(input: {
  subscriptionId: string;
  months: number;
}) {
  try {
    const auth = await getAuth({ required: true });

    // Check if admin or subscription owner
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

    // Only allow admin or subscription owner to extend
    if (subscription.userId !== auth.userId && !isAdmin?.isAdmin) {
      throw new Error("Unauthorized: You cannot extend this subscription");
    }

    // If not admin, require payment process
    if (!isAdmin?.isAdmin) {
      throw new Error(
        "Please use the payment system to extend your subscription",
      );
    }

    // Calculate new end date
    const newEndDate = new Date(subscription.endDate);
    newEndDate.setMonth(newEndDate.getMonth() + input.months);

    // Update subscription
    const updatedSubscription = await db.subscription.update({
      where: { id: input.subscriptionId },
      data: {
        endDate: newEndDate,
        status: "active", // Ensure it's active after extension
      },
    });

    return updatedSubscription;
  } catch (error) {
    console.error("Error in extendSubscription:", error);
    throw new Error("Failed to extend subscription");
  }
}

// User Subscription Management
export async function getUserPayments() {
  try {
    const auth = await getAuth({ required: true });

    return await db.payment.findMany({
      where: { userId: auth.userId },
      include: { subscription: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error in getUserPayments:", error);
    return [];
  }
}

// Xray API Management

// Configuration constants
const XRAY_API_BASE_URL = process.env.XRAY_API_BASE_URL || 'http://localhost:3000';
const XRAY_API_TOKEN = process.env.XRAY_API_TOKEN || 'default-token';

// Helper function to make API requests to Xray API
async function xrayApiRequest(endpoint: string, method: string = 'GET', data?: any) {
  try {
    const url = `${XRAY_API_BASE_URL}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${XRAY_API_TOKEN}`,
      'Content-Type': 'application/json'
    };

    const response = await axios({
      method,
      url,
      headers,
      data
    });

    return response.data;
  } catch (error) {
    console.error(`Error in Xray API request to ${endpoint}:`, error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Xray API error (${error.response.status}): ${error.response.data?.message || error.message}`);
    }
    throw new Error(`Failed to communicate with Xray API: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Helper function to get active Xray config
async function getActiveXrayConfig() {
  const config = await db.xrayConfig.findFirst({
    where: { isActive: true },
  });

  if (!config) {
    throw new Error("No active Xray configuration found");
  }

  return config;
}

// Helper function to execute a command on the server
async function executeCommand(command: string) {
  try {
    // This is a placeholder for actual server command execution
    // In a real environment, this would use SSH or other methods to execute commands on the Xray server
    console.log(`Executing command: ${command}`);

    // Simulate command execution for now
    // In production, you would use actual command execution or API calls
    // const { stdout, stderr } = await exec(command);
    // return { success: true, stdout, stderr };

    return { success: true, output: "Command executed successfully" };
  } catch (error) {
    console.error("Error executing command:", error);
    return { success: false, error: String(error) };
  }
}

// Create Xray user/subscription
export async function createXrayUser(input: {
  email: string;
  inbound?: string;
  duration?: string;
  subscriptionId?: string;
}) {
  try {
    const auth = await getAuth({ required: true });
    const user = await db.user.findUnique({ where: { id: auth.userId } });

    if (!user?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Get active Xray configuration
    const xrayConfig = await getActiveXrayConfig();

    // Generate UUID for Xray user
    const uuid = crypto.randomUUID();

    // Use provided values or defaults from config
    const inbound = input.inbound || xrayConfig.defaultInbound;
    const duration = input.duration || xrayConfig.defaultDuration;

    // Create Xray user in our database
    const xrayUser = await db.xrayUser.create({
      data: {
        email: input.email,
        uuid,
        inbound,
        userId: auth.userId,
        subscriptionId: input.subscriptionId,
        traffic: {
          create: {}, // Create empty traffic record
        },
      },
      include: { traffic: true },
    });

    // In a real implementation, this would modify the Xray config.json and reload the configuration
    // For now, we'll just return the created user
    console.log(
      `Created Xray user: ${input.email} with UUID: ${uuid} and inbound: ${inbound}`,
    );

    return xrayUser;
  } catch (error) {
    console.error("Error in createXrayUser:", error);
    throw new Error(
      `Failed to create Xray user: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

// Delete Xray user
export async function deleteXrayUser(input: { email: string }) {
  try {
    const auth = await getAuth({ required: true });
    const user = await db.user.findUnique({ where: { id: auth.userId } });

    if (!user?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Find the user in our database
    const xrayUser = await db.xrayUser.findUnique({
      where: { email: input.email },
      include: { traffic: true },
    });

    if (!xrayUser) {
      throw new Error(`Xray user with email ${input.email} not found`);
    }

    // Delete the traffic record first (if it exists)
    if (xrayUser.traffic) {
      await db.xrayTraffic.delete({
        where: { id: xrayUser.traffic.id },
      });
    }

    // Delete the Xray user from our database
    await db.xrayUser.delete({
      where: { email: input.email },
    });

    // In a real implementation, this would modify the Xray config.json and reload the configuration
    console.log(`Deleted Xray user: ${input.email}`);

    return { success: true, message: `Deleted Xray user: ${input.email}` };
  } catch (error) {
    console.error("Error in deleteXrayUser:", error);
    throw new Error(
      `Failed to delete Xray user: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

// Get all Xray users
export async function getXrayUsers() {
  try {
    const auth = await getAuth({ required: true });
    const user = await db.user.findUnique({ where: { id: auth.userId } });

    if (!user?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    return await db.xrayUser.findMany({
      include: { traffic: true, subscription: true },
    });
  } catch (error) {
    console.error("Error in getXrayUsers:", error);
    throw new Error(
      `Failed to get Xray users: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

// Get a specific Xray user
export async function getXrayUser(input: { email: string }) {
  try {
    const auth = await getAuth({ required: true });
    const user = await db.user.findUnique({ where: { id: auth.userId } });

    if (!user?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const xrayUser = await db.xrayUser.findUnique({
      where: { email: input.email },
      include: { traffic: true, subscription: true },
    });

    if (!xrayUser) {
      throw new Error(`Xray user with email ${input.email} not found`);
    }

    return xrayUser;
  } catch (error) {
    console.error("Error in getXrayUser:", error);
    throw new Error(
      `Failed to get Xray user: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

// Get traffic stats for a specific user
export async function getXrayUserStats(input: { email: string }) {
  try {
    const auth = await getAuth({ required: true });
    const user = await db.user.findUnique({ where: { id: auth.userId } });

    // Allow either admin or the owner of the subscription to view stats
    const xrayUser = await db.xrayUser.findUnique({
      where: { email: input.email },
      include: { user: true, traffic: true },
    });

    if (!xrayUser) {
      throw new Error(`Xray user with email ${input.email} not found`);
    }

    if (!user?.isAdmin && xrayUser.userId !== auth.userId) {
      throw new Error("Unauthorized: You can only view your own stats");
    }

    if (!xrayUser.traffic) {
      // Create traffic record if it doesn't exist
      await db.xrayTraffic.create({
        data: {
          xrayUserId: xrayUser.id,
        },
      });

      return {
        email: xrayUser.email,
        downloadGB: 0,
        uploadGB: 0,
        totalGB: 0,
        lastUpdated: new Date(),
      };
    }

    // Convert bytes to GB for easier reading
    const downloadGB =
      Number(xrayUser.traffic.downloadBytes) / (1024 * 1024 * 1024);
    const uploadGB =
      Number(xrayUser.traffic.uploadBytes) / (1024 * 1024 * 1024);
    const totalGB = Number(xrayUser.traffic.totalBytes) / (1024 * 1024 * 1024);

    return {
      email: xrayUser.email,
      downloadGB: parseFloat(downloadGB.toFixed(2)),
      uploadGB: parseFloat(uploadGB.toFixed(2)),
      totalGB: parseFloat(totalGB.toFixed(2)),
      lastUpdated: xrayUser.traffic.lastUpdated,
    };
  } catch (error) {
    console.error("Error in getXrayUserStats:", error);
    throw new Error(
      `Failed to get Xray user stats: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

// Get usage summary for all users
export async function getXrayUsageSummary() {
  try {
    const auth = await getAuth({ required: true });
    const user = await db.user.findUnique({ where: { id: auth.userId } });

    if (!user?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const xrayUsers = await db.xrayUser.findMany({
      include: { traffic: true },
    });

    // Calculate total usage
    let totalDownloadBytes = BigInt(0);
    let totalUploadBytes = BigInt(0);
    let totalBytes = BigInt(0);

    const userStats = xrayUsers.map((user) => {
      const download = user.traffic ? user.traffic.downloadBytes : BigInt(0);
      const upload = user.traffic ? user.traffic.uploadBytes : BigInt(0);
      const total = user.traffic ? user.traffic.totalBytes : BigInt(0);

      totalDownloadBytes += download;
      totalUploadBytes += upload;
      totalBytes += total;

      // Convert bytes to GB for easier reading
      const downloadGB = Number(download) / (1024 * 1024 * 1024);
      const uploadGB = Number(upload) / (1024 * 1024 * 1024);
      const totalGB = Number(total) / (1024 * 1024 * 1024);

      return {
        email: user.email,
        downloadGB: parseFloat(downloadGB.toFixed(2)),
        uploadGB: parseFloat(uploadGB.toFixed(2)),
        totalGB: parseFloat(totalGB.toFixed(2)),
        lastUpdated: user.traffic ? user.traffic.lastUpdated : user.updatedAt,
      };
    });

    // Convert total bytes to GB
    const totalDownloadGB = Number(totalDownloadBytes) / (1024 * 1024 * 1024);
    const totalUploadGB = Number(totalUploadBytes) / (1024 * 1024 * 1024);
    const totalUsageGB = Number(totalBytes) / (1024 * 1024 * 1024);

    return {
      users: userStats,
      summary: {
        userCount: xrayUsers.length,
        totalDownloadGB: parseFloat(totalDownloadGB.toFixed(2)),
        totalUploadGB: parseFloat(totalUploadGB.toFixed(2)),
        totalUsageGB: parseFloat(totalUsageGB.toFixed(2)),
      },
    };
  } catch (error) {
    console.error("Error in getXrayUsageSummary:", error);
    throw new Error(
      `Failed to get Xray usage summary: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

// Restart Xray service
export async function restartXrayService() {
  try {
    const auth = await getAuth({ required: true });
    const user = await db.user.findUnique({ where: { id: auth.userId } });

    if (!user?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Execute restart command
    // In a real implementation, this would restart the Xray service on the server
    const result = await executeCommand("systemctl restart xray");

    return result;
  } catch (error) {
    console.error("Error in restartXrayService:", error);
    throw new Error(
      `Failed to restart Xray service: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

// Reload Xray configuration
export async function reloadXrayConfig() {
  try {
    const auth = await getAuth({ required: true });
    const user = await db.user.findUnique({ where: { id: auth.userId } });

    if (!user?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Execute reload command
    // In a real implementation, this would reload the Xray configuration
    const result = await executeCommand("systemctl reload xray");

    return result;
  } catch (error) {
    console.error("Error in reloadXrayConfig:", error);
    throw new Error(
      `Failed to reload Xray configuration: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

// Get Xray configuration
export async function getXrayConfig() {
  try {
    const auth = await getAuth({ required: true });
    const user = await db.user.findUnique({ where: { id: auth.userId } });

    if (!user?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    // In a real implementation, this would read the Xray config file from the server
    // For now, return a placeholder
    return {
      success: true,
      config: {
        inbounds: [
          { tag: "default", protocol: "vmess" },
          { tag: "premium", protocol: "vless" },
        ],
        outbounds: [{ tag: "direct", protocol: "freedom" }],
        routing: {
          rules: [{ type: "field", outboundTag: "direct" }],
        },
      },
    };
  } catch (error) {
    console.error("Error in getXrayConfig:", error);
    throw new Error(
      `Failed to get Xray configuration: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

// Update Xray configuration
export async function updateXrayConfig(input: { config: Record<string, any> }) {
  try {
    const auth = await getAuth({ required: true });
    const user = await db.user.findUnique({ where: { id: auth.userId } });

    if (!user?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    // In a real implementation, this would write the updated config to the server
    // and reload the configuration
    console.log(
      "Updating Xray configuration - inbound count:",
      input.config.inbounds?.length || 0,
    );

    // Simulate successful update
    const reloadResult = await executeCommand("systemctl reload xray");

    return {
      success: true,
      message: "Configuration updated successfully",
      reloadResult,
    };
  } catch (error) {
    console.error("Error in updateXrayConfig:", error);
    throw new Error(
      `Failed to update Xray configuration: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

// Xray config management
export async function manageXrayServerConfig(input: {
  serverUrl: string;
  accessToken: string;
  configPath?: string;
  defaultInbound?: string;
  defaultDuration?: string;
}) {
  try {
    const auth = await getAuth({ required: true });
    const user = await db.user.findUnique({ where: { id: auth.userId } });

    if (!user?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Deactivate all existing configs
    await db.xrayConfig.updateMany({
      data: { isActive: false },
    });

    // Create new active config
    const newConfig = await db.xrayConfig.create({
      data: {
        serverUrl: input.serverUrl,
        accessToken: input.accessToken,
        configPath: input.configPath || "/etc/xray/config.json",
        defaultInbound: input.defaultInbound || "default",
        defaultDuration: input.defaultDuration || "1month",
        isActive: true,
      },
    });

    return newConfig;
  } catch (error) {
    console.error("Error in manageXrayServerConfig:", error);
    throw new Error(
      `Failed to manage Xray server config: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

// Admin Functions
export async function addSubscription(input: {
  userId: string;
  planName: string;
  status: string;
  startDate: string;
  endDate: string;
  ipAddress?: string;
  bandwidth?: number;
}) {
  try {
    const auth = await getAuth({ required: true });
    const user = await db.user.findUnique({ where: { id: auth.userId } });

    if (!user?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    return await db.subscription.create({
      data: {
        userId: input.userId,
        planName: input.planName,
        status: input.status,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        ipAddress: input.ipAddress,
        bandwidth: input.bandwidth || 0,
      },
    });
  } catch (error) {
    console.error("Error in addSubscription:", error);
    throw new Error("Failed to add subscription");
  }
}

// Seed data for development
export async function _seedNewsAndVpnOptions() {
  try {
    // Check if we already have news items
    const existingNewsCount = await db.news.count();
    if (existingNewsCount === 0) {
      // Create sample news items
      await db.news.createMany({
        data: [
          {
            title: "Welcome to X-Ray Core VPN",
            content:
              "Thank you for choosing X-Ray Core VPN for your secure browsing needs. We're committed to providing you with the best VPN experience possible.",
            publishDate: new Date(),
            isPublished: true,
          },
          {
            title: "New Server Locations Added",
            content:
              "We've added new server locations in Europe and Asia to provide you with better connectivity and lower latency.",
            publishDate: new Date(new Date().setDate(new Date().getDate() - 7)), // 7 days ago
            isPublished: true,
          },
          {
            title: "Upcoming Maintenance",
            content:
              "We will be performing scheduled maintenance on our servers on the upcoming weekend. Service disruptions may occur for short periods.",
            publishDate: new Date(new Date().setDate(new Date().getDate() + 3)), // 3 days in future
            isPublished: true,
          },
        ],
      });
    }

    // Check if we already have VPN options
    const existingVpnOptionsCount = await db.vpnOption.count();
    if (existingVpnOptionsCount === 0) {
      // Create sample VPN options
      await db.vpnOption.createMany({
        data: [
          {
            name: "Basic Protection",
            price: 4.99,
            description: "Standard VPN protection with basic features",
            isActive: true,
          },
          {
            name: "Advanced Security",
            price: 9.99,
            description: "Enhanced security features with faster speeds",
            isActive: true,
          },
          {
            name: "Premium Package",
            price: 14.99,
            description:
              "Our best package with all features and priority support",
            isActive: true,
          },
        ],
      });
    }

    return { message: "News and VPN options seeded successfully" };
  } catch (error) {
    console.error("Error in _seedNewsAndVpnOptions:", error);
    return { message: "Failed to seed news and VPN options" };
  }
}

// Offer Management

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
  try {
    const auth = await getAuth({ required: true });
    const user = await db.user.findUnique({ where: { id: auth.userId } });

    if (!user?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    return await db.offer.create({
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
  } catch (error) {
    console.error("Error in createOffer:", error);
    throw new Error("Failed to create offer");
  }
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
  try {
    const auth = await getAuth({ required: true });
    const user = await db.user.findUnique({ where: { id: auth.userId } });

    if (!user?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Prepare update data
    const updateData: any = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl;
    if (input.price !== undefined) updateData.price = input.price;
    if (input.isVisible !== undefined) updateData.isVisible = input.isVisible;
    if (input.priority !== undefined) updateData.priority = input.priority;
    if (input.startDate !== undefined) updateData.startDate = input.startDate ? new Date(input.startDate) : null;
    if (input.endDate !== undefined) updateData.endDate = input.endDate ? new Date(input.endDate) : null;

    return await db.offer.update({
      where: { id: input.id },
      data: updateData,
    });
  } catch (error) {
    console.error("Error in updateOffer:", error);
    throw new Error("Failed to update offer");
  }
}

export async function deleteOffer(input: { id: string }) {
  try {
    const auth = await getAuth({ required: true });
    const user = await db.user.findUnique({ where: { id: auth.userId } });

    if (!user?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    await db.offer.delete({
      where: { id: input.id },
    });

    return { success: true };
  } catch (error) {
    console.error("Error in deleteOffer:", error);
    throw new Error("Failed to delete offer");
  }
}

export async function getAllOffers(input?: { includeHidden?: boolean }) {
  try {
    const auth = await getAuth();
    const isAdmin = auth.status === "authenticated" ? 
      await db.user.findUnique({ where: { id: auth.userId }, select: { isAdmin: true } }) : 
      null;

    // Non-admins can only see visible offers
    let where: any = !isAdmin?.isAdmin && !input?.includeHidden ? 
      { isVisible: true } : 
      {};

    // Add date filtering for non-admins
    if (!isAdmin?.isAdmin) {
      const now = new Date();
      where.AND = [
        { OR: [
          { startDate: null },
          { startDate: { lte: now } }
        ]},
        { OR: [
          { endDate: null },
          { endDate: { gte: now } }
        ]}
      ];
    }

    return await db.offer.findMany({
      where,
      orderBy: [
        { priority: "desc" },
        { createdAt: "desc" }
      ],
    });
  } catch (error) {
    console.error("Error in getAllOffers:", error);
    return [];
  }
}

// Email Authentication Preparation
// These functions will need to be implemented with your email service

export async function initiateEmailVerification(input: { email: string }) {
  try {
    // Generate a secure verification token
    const token = crypto.randomBytes(32).toString("hex");
    
    // Set expiration to 48 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + EMAIL_VERIFICATION_EXPIRY_HOURS);
    
    // Check if a user with this email already exists
    const existingUser = await db.user.findUnique({
      where: { email: input.email },
    });
    
    // Create or update verification record
    await db.emailVerification.upsert({
      where: { email: input.email },
      update: {
        token,
        expiresAt,
        isUsed: false,
        userId: existingUser?.id
      },
      create: {
        email: input.email,
        token,
        expiresAt,
        userId: existingUser?.id
      },
    });
    
    // TODO: Integration point - Send verification email
    // This is where you would integrate with your email service
    // The email should include a link with the token:
    // https://yourdomain.com/verify-email?token={token}
    
    return { success: true, message: "Verification email sent" };
  } catch (error) {
    console.error("Error in initiateEmailVerification:", error);
    throw new Error("Failed to initiate email verification");
  }
}

export async function verifyEmail(input: { token: string }) {
  try {
    // Find the verification record
    const verification = await db.emailVerification.findUnique({
      where: { token: input.token },
    });
    
    if (!verification) {
      return { success: false, message: "Invalid verification token" };
    }
    
    if (verification.isUsed) {
      return { success: false, message: "Token already used" };
    }
    
    if (verification.expiresAt < new Date()) {
      return { success: false, message: "Token expired" };
    }
    
    // Mark token as used
    await db.emailVerification.update({
      where: { id: verification.id },
      data: { isUsed: true },
    });
    
    // If user exists, update their email verification status
    if (verification.userId) {
      await db.user.update({
        where: { id: verification.userId },
        data: { emailVerified: true },
      });
      return { success: true, message: "Email verified successfully", userId: verification.userId };
    }
    
    // If no user yet, create a new one
    const newUser = await db.user.create({
      data: {
        email: verification.email,
        emailVerified: true,
      },
    });
    
    return { success: true, message: "Email verified and account created", userId: newUser.id };
  } catch (error) {
    console.error("Error in verifyEmail:", error);
    throw new Error("Failed to verify email");
  }
}

export async function sendAdminNewsletter(input: {
  subject: string;
  content: string;
  targetRole?: string;
}) {
  try {
    const auth = await getAuth({ required: true });
    const user = await db.user.findUnique({ where: { id: auth.userId } });

    if (!user?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Find users who opted in to newsletters
    const where: any = { newsletterOptIn: true };
    if (input.targetRole) {
      where.role = input.targetRole;
    }

    const users = await db.user.findMany({
      where,
      select: { id: true, email: true },
    });

    // Filter users with verified emails
    const validUsers = users.filter(u => u.email);

    let sentCount = 0;

    // TODO: Integration point - Send newsletter emails
    // This is where you would integrate with your email service
    // For now, we'll just use the sendEmail function for users with IDs
    for (const user of validUsers) {
      if (user.id) {
        try {
          await sendEmail({
            toUserId: user.id,
            subject: input.subject,
            markdown: input.content,
          });
          sentCount++;
        } catch (error) {
          console.error(`Failed to send newsletter to user ${user.id}:`, error);
        }
      }
    }

    return { 
      success: true, 
      sentCount, 
      totalCount: validUsers.length,
      message: `Newsletter sent to ${sentCount} of ${validUsers.length} users`
    };
  } catch (error) {
    console.error("Error in sendAdminNewsletter:", error);
    throw new Error("Failed to send newsletter");
  }
}

// Documentation functions
export async function getApiDocumentation() {
  return {
    userManagement: {
      getUsers:
        "GET /users - Get a list of users with optional role filtering (admin only)",
      sendAdminMessage:
        "POST /admin/message - Send a message to users by role or specific user IDs (admin only)",
      setDiscount:
        "POST /admin/discount - Create a discount code with optional targeting by role or user (admin only)",
      updateVpnOption:
        "PUT /admin/vpn-option - Create or update VPN options (name, price, description) (admin only)",
    },
    offerManagement: {
      createOffer: "POST /admin/offers - Create a new offer (admin only)",
      updateOffer: "PUT /admin/offers/:id - Update an existing offer (admin only)",
      deleteOffer: "DELETE /admin/offers/:id - Delete an offer (admin only)",
      getAllOffers: "GET /offers - Get all visible offers (or all offers for admins)",
    },
    emailAuthentication: {
      initiateEmailVerification: "POST /auth/email/initiate - Send verification email",
      verifyEmail: "POST /auth/email/verify - Verify email with token",
      sendAdminNewsletter: "POST /admin/newsletter - Send newsletter to users (admin only)",
    },
    newsManagement: {
      createNews: "POST /news - Create a news item (admin only)",
      getNews:
        "GET /news - Get list of news items (published only for regular users, all for admins)",
      deleteNews: "DELETE /news/{id} - Delete a news item (admin only)",
    },
    vpnManagement: {
      createXrayUser: "Create X-Ray VPN user with subscription details",
      deleteXrayUser: "Delete an X-Ray VPN user",
      getXrayUsers: "Get all X-Ray VPN users",
      getXrayUserStats: "Get traffic statistics for an X-Ray VPN user",
      getXrayUsageSummary: "Get usage summary for all X-Ray VPN users",
      restartXrayService: "Restart the X-Ray VPN service",
      reloadXrayConfig: "Reload the X-Ray VPN configuration",
      getXrayConfig: "Get the current X-Ray VPN configuration",
      updateXrayConfig: "Update the X-Ray VPN configuration",
      manageXrayServerConfig: "Manage X-Ray server configuration settings",
    },
    clientEndpoints: {
      getUserMessages: "GET /user/messages - Get messages for the current user",
      markMessageAsRead: "POST /user/message/read - Mark a message as read",
      getUserDiscounts:
        "GET /user/discounts - Get available discounts for the current user",
      applyDiscountCode: "POST /user/discount/apply - Apply a discount code",
      getUserSubscriptions: "Get the current user's subscriptions",
      getSubscriptionStats:
        "Get statistics about the current user's subscriptions",
      getVpnOptions: "Get available VPN options",
    },
  };
}

export async function getDependencies() {
  return {
    backend: [
      "@prisma/client",
      "axios",
      "crypto",
      "fs",
      "nanoid",
      "util",
      "zod",
      "bcrypt", // For password hashing
      "jsonwebtoken", // For JWT tokens
    ],
    frontend: [
      "react",
      "react-dom",
      "react-router-dom",
      "@tanstack/react-query",
      "lucide-react",
      "framer-motion",
      "tailwindcss",
    ],
  };
}

export async function _seedXrayConfig() {
  try {
    // Check if we already have a config
    const existingCount = await db.xrayConfig.count();
    if (existingCount > 0) {
      return { message: "Xray configuration already seeded" };
    }

    // Create default Xray configuration
    await db.xrayConfig.create({
      data: {
        serverUrl: "http://localhost:10085", // Placeholder URL
        accessToken: "placeholder-token", // Placeholder token
        configPath: "/etc/xray/config.json",
        defaultInbound: "default",
        defaultDuration: "1month",
        isActive: true,
      },
    });

    return { message: "Xray configuration seeded successfully" };
  } catch (error) {
    console.error("Error in _seedXrayConfig:", error);
    return { message: "Failed to seed Xray configuration" };
  }
}

// Get active VPN options
export async function getVpnOptions() {
  try {
    return await db.vpnOption.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
    });
  } catch (error) {
    console.error("Error in getVpnOptions:", error);
    return [];
  }
}

// Get available discounts for the current user
export async function getUserDiscounts() {
  try {
    const auth = await getAuth({ required: true });
    const user = await db.user.findUnique({
      where: { id: auth.userId },
      select: { role: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const now = new Date();

    // Find discounts that are either:
    // 1. Specifically for this user, or
    // 2. For the user's role, or
    // 3. General (no userId or targetRole)
    // And are active and not expired
    return await db.discount.findMany({
      where: {
        isActive: true,
        AND: [
          {
            OR: [
              { userId: auth.userId },
              { targetRole: user.role },
              {
                AND: [{ userId: null }, { targetRole: null }],
              },
            ],
          },
          {
            OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
          },
        ],
      },
    });
  } catch (error) {
    console.error("Error in getUserDiscounts:", error);
    return [];
  }
}

// Apply a discount code
export async function applyDiscountCode(input: {
  code: string;
  subscriptionId?: string;
}) {
  try {
    const auth = await getAuth({ required: true });
    const user = await db.user.findUnique({
      where: { id: auth.userId },
      select: { role: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const now = new Date();

    // Find the discount with the given code
    const discount = await db.discount.findUnique({
      where: { code: input.code },
    });

    if (!discount) {
      return { success: false, message: "Invalid discount code" };
    }

    if (!discount.isActive) {
      return {
        success: false,
        message: "This discount code is no longer active",
      };
    }

    if (discount.expiresAt && discount.expiresAt < now) {
      return { success: false, message: "This discount code has expired" };
    }
    
    // Check if the discount has reached its maximum usage count
    if (discount.maxUsageCount && discount.usageCount >= discount.maxUsageCount) {
      return { success: false, message: "This discount code has reached its maximum usage limit" };
    }

    // Check if the discount is for a specific user or role
    if (discount.userId && discount.userId !== auth.userId) {
      return {
        success: false,
        message: "This discount code is not valid for your account",
      };
    }

    if (discount.targetRole && discount.targetRole !== user.role) {
      return {
        success: false,
        message: "This discount code is not valid for your account type",
      };
    }

    // The discount is valid!

    // Increment usage count
    await db.discount.update({
      where: { id: discount.id },
      data: { usageCount: { increment: 1 } },
    });

    // If a subscription ID was provided, apply the discount to that subscription
    if (input.subscriptionId) {
      const subscription = await db.subscription.findUnique({
        where: { id: input.subscriptionId },
        include: { payment: true },
      });

      if (subscription && subscription.payment) {
        // Calculate discounted amount
        const discountAmount = subscription.price * (discount.percentage / 100);
        const newPrice = Math.max(0, subscription.price - discountAmount);

        // Update the subscription and payment
        await db.subscription.update({
          where: { id: input.subscriptionId },
          data: { price: newPrice },
        });

        await db.payment.update({
          where: { id: subscription.payment.id },
          data: { amount: newPrice },
        });
      }
    }

    return {
      success: true,
      discount: {
        id: discount.id,
        code: discount.code,
        percentage: discount.percentage,
        isGift: discount.isGift,
        giftDetails: discount.giftDetails,
        description: discount.description,
      },
    };
  } catch (error) {
    console.error("Error in applyDiscountCode:", error);
    throw new Error("Failed to apply discount code");
  }
}

export async function _seedSubscriptionPlans() {
  try {
    // Check if we already have plans
    const existingCount = await db.subscriptionPlan.count();
    if (existingCount > 0) {
      return { message: "Subscription plans already seeded" };
    }

    // Create standard subscription plans
    await db.subscriptionPlan.createMany({
      data: [
        {
          name: "Trial",
          duration: "7days",
          price: 0,
          description: "7-day free trial to test our VPN service",
        },
        {
          name: "Basic Monthly",
          duration: "1month",
          price: 9.99,
          description: "Basic VPN protection for 1 month",
        },
        {
          name: "Standard Quarterly",
          duration: "3months",
          price: 24.99,
          description: "Standard VPN protection for 3 months",
        },
        {
          name: "Premium 6-Month",
          duration: "6months",
          price: 44.99,
          description: "Premium VPN protection for 6 months",
        },
        {
          name: "Ultimate Annual",
          duration: "12months",
          price: 79.99,
          description: "Ultimate VPN protection for 12 months",
        },
      ],
    });

    return { message: "Subscription plans seeded successfully" };
  } catch (error) {
    console.error("Error in _seedSubscriptionPlans:", error);
    return { message: "Failed to seed subscription plans" };
  }
}

export async function _seedSubscriptions() {
  try {
    // Check if we already have subscriptions
    const existingCount = await db.subscription.count();
    if (existingCount > 0) {
      return { message: "Subscriptions already seeded" };
    }

    // Get all users
    const users = await db.user.findMany();

    if (users.length === 0) {
      // Create a demo user if none exists
      const demoUser = await db.user.create({
        data: { name: "Demo User" },
      });
      users.push(demoUser);
    }

    // Create sample subscriptions for each user
    const now = new Date();

    for (const user of users) {
      // Active subscription
      await db.subscription.create({
        data: {
          userId: user.id,
          planName: "X-Ray Core VPN Premium",
          status: "active",
          startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          endDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
          ipAddress: "192.168.1.1",
          bandwidth: 45.7,
        },
      });

      // Expired subscription
      await db.subscription.create({
        data: {
          userId: user.id,
          planName: "X-Ray Core VPN Basic",
          status: "expired",
          startDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
          endDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          ipAddress: "192.168.1.2",
          bandwidth: 120.3,
        },
      });

      // Another active subscription
      await db.subscription.create({
        data: {
          userId: user.id,
          planName: "X-Ray Core VPN Business",
          status: "active",
          startDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
          endDate: new Date(now.getTime() + 350 * 24 * 60 * 60 * 1000), // 350 days from now
          ipAddress: "192.168.1.3",
          bandwidth: 78.2,
        },
      });
    }

    return { message: "Subscriptions seeded successfully" };
  } catch (error) {
    console.error("Error in _seedSubscriptions:", error);
    return { message: "Failed to seed subscriptions" };
  }
}
