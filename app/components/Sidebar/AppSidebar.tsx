"use client";

import {
  Coins,
  LayoutDashboard,
  SquareCheckBig,
  Upload,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { StartTourButton } from "@/components/Onboarding/StartTourButton";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex-helpers/react/cache";
import { MainNav } from "./MainNav";
import { ProjectNav } from "./ProjectNav";
import { NavUser } from "./UserNav";

const NAV_ITEMS = [
  { name: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { name: "Transaktionen", url: "/transactions", icon: SquareCheckBig },
  { name: "Import", url: "/import", icon: Upload, adminOnly: true },
  { name: "Förderer", url: "/donors", icon: Users },
  { name: "Auslagenerstattung", url: "/reimbursement", icon: Coins },
];

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const user = useQuery(api.users.queries.getCurrentUserProfile);
  const isAdmin = user?.role === "admin";
  const navItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  return (
    <Sidebar variant="sidebar" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <Image
                  src="/AppIcon.png"
                  alt="YBudget"
                  width={32}
                  height={32}
                />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">YBudget</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <MainNav items={navItems} id="tour-main-nav" />
        <ProjectNav id="tour-project-nav" />
      </SidebarContent>
      <SidebarFooter className="flex flex-row items-center justify-between">
        <NavUser user={user} />
        <StartTourButton />
      </SidebarFooter>
    </Sidebar>
  );
}
