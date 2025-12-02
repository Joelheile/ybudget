import { v } from "convex/values";
import { query } from "../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";

export const getUserBankDetails = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    return {
      iban: user.iban || "",
      bic: user.bic || "",
      accountHolder: user.accountHolder || user.name || "",
    };
  },
});

export const getReimbursement = query({
  args: { reimbursementId: v.id("reimbursements") },
  handler: async (ctx, args) => {
    await getCurrentUser(ctx);
    return await ctx.db.get(args.reimbursementId);
  },
});

export const getReceipts = query({
  args: { reimbursementId: v.id("reimbursements") },
  handler: async (ctx, args) => {
    await getCurrentUser(ctx);
    return await ctx.db
      .query("receipts")
      .withIndex("by_reimbursement", (q) => q.eq("reimbursementId", args.reimbursementId))
      .collect();
  },
});

export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await getCurrentUser(ctx);
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const getAllReimbursements = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    const isAdmin = user.role === "admin";

    const query = ctx.db
      .query("reimbursements")
      .withIndex("by_organization", (q) => q.eq("organizationId", user.organizationId));

    const reimbursements = isAdmin
      ? await query.collect()
      : await query.filter((q) => q.eq(q.field("createdBy"), user._id)).collect();

    return await Promise.all(
      reimbursements.map(async (r) => {
        const creator = await ctx.db.get(r.createdBy);
        const project = await ctx.db.get(r.projectId);
        return {
          ...r,
          creatorName: creator?.name || "Unknown",
          projectName: project?.name || "Unbekanntes Projekt",
        };
      })
    );
  },
});
