
import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";

export const createReimbursement = mutation({
  args: {
    amount: v.number(),
    iban: v.string(),
    bic: v.string(),
    accountHolder: v.string(),
    receipts: v.array(v.object({
      receiptNumber: v.string(),
      receiptDate: v.string(),
      companyName: v.string(),
      description: v.string(),
      netAmount: v.number(),
      taxRate: v.number(),
      grossAmount: v.number(),
      fileStorageId: v.id("_storage"),
    })),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const reimbursementId = await ctx.db.insert("reimbursements", {
      organizationId: user.organizationId,
      amount: args.amount,
      status: "pending",
      iban: args.iban,
      bic: args.bic,
      accountHolder: args.accountHolder,
      createdBy: user._id,
    });

    for (const receipt of args.receipts) {
      await ctx.db.insert("receipts", {
        reimbursementId,
        ...receipt,
      });
    }

    return reimbursementId;
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    await getCurrentUser(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});


export const addReceipt = mutation({
  args: {
    reimbursementId: v.id("reimbursements"),
    receiptNumber: v.string(),
    receiptDate: v.string(),
    companyName: v.string(),
    description: v.string(),
    netAmount: v.number(),
    taxRate: v.number(),
    grossAmount: v.number(),
    fileStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await getCurrentUser(ctx);

    return await ctx.db.insert("receipts", {
      reimbursementId: args.reimbursementId,
      receiptNumber: args.receiptNumber,
      receiptDate: args.receiptDate,
      companyName: args.companyName,
      description: args.description,
      netAmount: args.netAmount,
      taxRate: args.taxRate,
      grossAmount: args.grossAmount,
      fileStorageId: args.fileStorageId,
    });
  },
});

export const deleteReceipt = mutation({
  args: {
    receiptId: v.id("receipts"),
  },
  handler: async (ctx, args) => {
    await getCurrentUser(ctx);
    const receipt = await ctx.db.get(args.receiptId);
    if (receipt) {
      await ctx.storage.delete(receipt.fileStorageId);
      await ctx.db.delete(args.receiptId);
    }
  },
});

export const deleteReimbursement = mutation({
  args: {
    reimbursementId: v.id("reimbursements"),
  },
  handler: async (ctx, args) => {
    await getCurrentUser(ctx);
    const receipts = await ctx.db
      .query("receipts")
      .withIndex("by_reimbursement", (q) => q.eq("reimbursementId", args.reimbursementId))
      .collect();

    for (const receipt of receipts) {
      await ctx.storage.delete(receipt.fileStorageId);
      await ctx.db.delete(receipt._id);
    }

    await ctx.db.delete(args.reimbursementId);
  },
});

