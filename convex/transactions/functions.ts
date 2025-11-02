import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";

export const createExpectedTransaction = mutation({
  args: {
    projectId: v.string(),
    date: v.number(),
    amount: v.number(),
    description: v.string(),
    counterparty: v.string(),
    categoryId: v.string(),
    status: v.literal("expected"),
    donorId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    await ctx.db.insert("transactions", {
      projectId: args.projectId,
      date: args.date,
      amount: args.amount,
      description: args.description,
      counterparty: args.counterparty,
      categoryId: args.categoryId,
      donorId: args.donorId || "",
      importedBy: user._id,
      status: args.status,
      organizationId: user.organizationId,
    });
  },
});

// Todo: simpler

export const createImportedTransaction = mutation({
  args: {
    date: v.number(),
    importedTransactionId: v.string(),
    importSource: v.union(
      v.literal("sparkasse"),
      v.literal("volksbank"),
      v.literal("moss"),
    ),
    amount: v.number(),
    description: v.string(),
    counterparty: v.string(),
    accountName: v.optional(v.string()),
  },
  returns: v.object({
    skipped: v.optional(v.boolean()),
    inserted: v.optional(v.boolean()),
  }),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthenticated");

    // const existingTransaction = await ctx.runQuery(
    //   api..transactions.getTransactionById.getTransactionById,
    //   {
    //     importedTransactionId: args.importedTransactionId,
    //   }
    // );

    // if (existingTransaction) return { skipped: true };

    await ctx.db.insert("transactions", {
      organizationId: user.organizationId,
      importedBy: user._id,
      date: args.date,
      amount: args.amount,
      description: args.description,
      counterparty: args.counterparty,
      importedTransactionId: args.importedTransactionId,
      importSource: args.importSource,
      status: "processed",
      projectId: "",
      categoryId: "",
      donorId: "",
      accountName: args.accountName,
    });

    return { inserted: true };
  },
});

export const updateProcessedTransaction = mutation({
  args: {
    transactionId: v.id("transactions"),
    projectId: v.optional(v.string()),
    categoryId: v.optional(v.string()),
    donorId: v.optional(v.string()),
    matchedTransactionId: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("User not found");

    const updateData: {
      projectId?: string;
      categoryId?: string;
      donorId?: string;
      matchedTransactionId?: string;
    } = {};
    if (
      args.projectId !== undefined &&
      args.categoryId !== undefined &&
      args.donorId !== undefined
    ) {
      updateData.projectId = args.projectId;
      updateData.categoryId = args.categoryId;
      updateData.donorId = args.donorId;
      updateData.matchedTransactionId = args.matchedTransactionId;
    }

    await ctx.db.patch(args.transactionId, updateData);
  },
});
