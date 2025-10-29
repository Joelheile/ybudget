"use client";

import BudgetCard from "@/components/Dashboard/BudgetCard";
import { CategoryChart } from "@/components/Dashboard/CategoryChart";
import ProjectCard from "@/components/Dashboard/ProjectCard";
import { PageHeader } from "@/components/Layout/PageHeader";
import { DataTable } from "@/components/Tables/DataTable";
import { columns } from "@/components/Tables/columns";
import { SidebarInset } from "@/components/ui/sidebar";
import { useDateRange } from "@/contexts/DateRangeContext";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "../../../../convex/_generated/api";

export default function ProjectDetail() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { selectedDateRange } = useDateRange();

  const startDate = selectedDateRange.from.getTime();
  const endDate = selectedDateRange.to.getTime();

  const project = useQuery(api.queries.projectQueries.getProjectById, {
    projectId,
  });

  const children = useQuery(api.queries.projectQueries.getChildProjects, {
    parentId: projectId,
  });

  const transactions = useQuery(
    api.queries.transactionQueries.getTransactions,
    {
      startDate,
      endDate,
      projectId,
    }
  );

  const availableBudget = useQuery(
    api.queries.getAvailableBudget.getAvailableBudget,
    { startDate, endDate, projectId }
  );
  const allocatedBudget = useQuery(
    api.queries.getAllocatedBudget.getAllocatedBudget,
    { startDate, endDate, projectId }
  );
  const spentBudget = useQuery(api.queries.getSpentBudget.getSpentBudget, {
    startDate,
    endDate,
    projectId,
  });
  const receivedBudget = useQuery(
    api.queries.getReceivedBudget.getReceivedBudget,
    { startDate, endDate, projectId }
  );

  if (!project) {
    return (
      <SidebarInset>
        <div className="p-6">
          <p>Projekt nicht gefunden</p>
        </div>
      </SidebarInset>
    );
  }

  return (
    <SidebarInset>
      <div className="p-4 lg:px-6 pb-6 overflow-x-hidden w-full">
        <PageHeader title={project.name} />

        <div className="grid grid-cols-2 py-5 lg:grid-cols-4 gap-4 lg:gap-6">
          <BudgetCard
            title={"Offenes Budget"}
            amount={availableBudget ?? 0}
            description="Geplante Einnahmen + erhaltene Einnahmen - Ausgaben"
          />
          <BudgetCard
            title={"Verplant"}
            amount={allocatedBudget ?? 0}
            description="Summe aller erwarteten Transaktionen"
          />
          <BudgetCard
            title={"Ausgegeben"}
            amount={spentBudget ?? 0}
            description="Summe aller Ausgaben des Bankkontos"
          />
          <BudgetCard
            title={"Eingenommen"}
            amount={receivedBudget ?? 0}
            description="Summe aller Einnahmen des Bankkontos"
          />
        </div>

        {children && children.length > 0 && (
          <div className="flex flex-col lg:flex-row h-auto lg:h-[400px] w-full gap-4 lg:gap-6 mt-4 lg:mt-6">
            <div className="flex-1 flex flex-col">
              <h2 className="text-xl font-semibold mb-4">Projekte</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 flex-1">
                {children.map((child) => (
                  <ProjectCard
                    key={child._id}
                    title={child.name}
                    description={child.description}
                    progress={20}
                    projectId={child._id}
                  />
                ))}
              </div>
            </div>
            <CategoryChart />
          </div>
        )}

        <div className="mt-4 lg:mt-6">
          <h2 className="text-xl font-semibold mb-4">Transaktionen</h2>
          <DataTable columns={columns} data={transactions || []} />
        </div>
      </div>
    </SidebarInset>
  );
}
