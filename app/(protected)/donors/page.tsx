"use client";

import { DonorCard } from "@/components/Donors/DonorCard";
import { PageHeader } from "@/components/Layout/PageHeader";
import { AccessDenied } from "@/components/Settings/AccessDenied";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { useIsAdmin } from "@/lib/hooks/useCurrentUserRole";
import { useQuery } from "convex/react";

export default function DonorsPage() {
  const isAdmin = useIsAdmin();
  const donors = useQuery(api.donors.queries.getAllDonors) as
    | Doc<"donors">[]
    | undefined;

  if (!isAdmin) return <AccessDenied title="Förderer" />;

  return (
    <div>
      <PageHeader title="Förderer" />

      <div className="space-y-6">
        <p className="text-muted-foreground">
          Verwalte deine Förderer und tracke deren finanzielle Beiträge
        </p>

        {donors?.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold">Keine Förderer vorhanden</h3>
            <p className="text-muted-foreground mt-2">
              Erstelle deinen ersten Förderer, um zu beginnen.
            </p>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            id="tour-donors-grid"
          >
            {donors?.map((donor, index) => (
              <div
                key={donor._id}
                id={index === 0 ? "tour-donor-card" : undefined}
              >
                <DonorCard donorId={donor._id} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
