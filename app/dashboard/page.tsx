"use client";
import BudgetCard from "@/components/Dashboard/BudgetCard";
import { BudgetChart } from "@/components/Dashboard/BudgetChart";
import { CategoryChart } from "@/components/Dashboard/CategoryChart";
import { DashboardDropdown } from "@/components/Dashboard/DashboardDropdown";
import ProjectCard from "@/components/Dashboard/ProjectCard";
import { RangeCalendarToggle } from "@/components/RangeCalendar/RangeCalendarToggle";
import { ImportCSVSheet } from "@/components/Sheets/ImportCSVSheet";
import { TransactionSheet } from "@/components/Sheets/TransactionSheet";
import { mockProjects } from "@/components/data/mockProjects";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useState } from "react";

export default function Dashboard() {
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isIncomeOpen, setIsIncomeOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  return (
    <SidebarInset>
      <div className="px-4 lg:px-6 pb-6">
        <header className="flex w-full h-16 items-center overflow-visible">
          <div className="flex w-full items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <div className="flex w-full items-center justify-between">
              <RangeCalendarToggle />
              <DashboardDropdown
                onOpenExpense={() => setIsExpenseOpen(true)}
                onOpenIncome={() => setIsIncomeOpen(true)}
                onOpenImport={() => setIsImportOpen(true)}
              />
            </div>
          </div>
        </header>

        <TransactionSheet
          type="expense"
          open={isExpenseOpen}
          onOpenChange={setIsExpenseOpen}
        />
        <TransactionSheet
          type="income"
          open={isIncomeOpen}
          onOpenChange={setIsIncomeOpen}
        />
        <ImportCSVSheet open={isImportOpen} onOpenChange={setIsImportOpen} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <BudgetCard
            title={"Offenes Budget"}
            amount={4019}
            changePercent={2.4}
          />
          <BudgetCard title={"Verplant"} amount={14920} changePercent={9.2} />
          <BudgetCard title={"Ausgegeben"} amount={3900} changePercent={-8.9} />
          <BudgetCard
            title={"Eingenommen"}
            amount={250}
            changePercent={-15.2}
          />
        </div>
        <div className="flex flex-col lg:flex-row h-auto lg:h-[400px] w-full gap-4 lg:gap-6 mt-4 lg:mt-6">
          <BudgetChart />
          <CategoryChart />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full gap-4 lg:gap-6 mt-4 lg:mt-6">
          {mockProjects.map((project) => (
            <ProjectCard
              key={project.id}
              title={project.name}
              description={project.description}
              progress={project.progress}
            />
          ))}
        </div>
      </div>
    </SidebarInset>
  );
}
