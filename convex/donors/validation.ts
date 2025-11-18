import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export async function validateDonorForCategory(
  ctx: QueryCtx | MutationCtx,
  donorId: Id<"donors"> | undefined,
  categoryId: Id<"categories"> | undefined,
  organizationId?: Id<"organizations">,
): Promise<void> {
  if (!donorId) {
    return;
  }

  if (!categoryId) {
    return;
  }

  const donor = await ctx.db.get(donorId);
  if (!donor) {
    throw new Error("Donor not found");
  }

  if (organizationId && donor.organizationId !== organizationId) {
    throw new Error("Access denied");
  }

  const category = await ctx.db.get(categoryId);
  if (!category) {
    throw new Error("Category not found");
  }

  if (!donor.allowedTaxSpheres || donor.allowedTaxSpheres.length === 0) {
    return;
  }

  if (!donor.allowedTaxSpheres.includes(category.taxsphere)) {
    throw new Error(
      `Donor "${donor.name}" cannot be used for category "${category.name}" (tax sphere: ${category.taxsphere}). ` +
        `Allowed tax spheres: ${donor.allowedTaxSpheres.join(", ")}`,
    );
  }
}
