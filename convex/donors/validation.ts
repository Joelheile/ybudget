import { Id } from "../_generated/dataModel";
import { QueryCtx } from "../_generated/server";

export async function validateDonorForCategory(
  ctx: QueryCtx,
  donorId: Id<"donors"> | undefined,
  categoryId: Id<"categories"> | undefined,
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

  const category = await ctx.db.get(categoryId);
  if (!category) {
    throw new Error("Category not found");
  }

  // Check if the donor's allowed tax spheres include the category's tax sphere
  if (!donor.allowedTaxSpheres.includes(category.taxsphere)) {
    const taxSphereNames: Record<string, string> = {
      "non-profit": "Ideeller Bereich",
      "asset-management": "Vermögensverwaltung",
      "purpose-operations": "Zweckbetrieb",
      "commercial-operations": "Wirtschaftlicher Geschäftsbetrieb",
    };

    throw new Error(
      `Förderer "${donor.name}" darf nicht für "${taxSphereNames[category.taxsphere]}" verwendet werden. ` +
        `Erlaubte Bereiche: ${donor.allowedTaxSpheres.map((ts) => taxSphereNames[ts]).join(", ")}`,
    );
  }
}
