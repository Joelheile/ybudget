"use client";

import { ChevronRight, Plus } from "lucide-react";
import { useState } from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { CreateProjectSheet } from "../Sheets/CreateProjectSheet";
import { mockProjects } from "../data/mockProjects";

export function ProjectNav() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const parentProjects = mockProjects.filter((p) => !p.parentId);

  const items = parentProjects.map((project) => {
    const childProjects = mockProjects.filter((p) => p.parentId === project.id);

    return {
      title: project.name,
      url: `/projects/${project.id}`,
      isActive: project.isActive,
      items:
        childProjects.length > 0
          ? childProjects.map((child) => ({
              title: child.name,
              url: `/projects/${child.id}`,
            }))
          : undefined,
    };
  });

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Projekte</SidebarGroupLabel>
      <SidebarGroupAction onClick={() => setSheetOpen(true)}>
        <Plus />
        <span className="sr-only">Projekt hinzufügen</span>
      </SidebarGroupAction>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
            <SidebarMenuItem>
              {item.items?.length ? (
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <a href={item.url}>
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              ) : (
                <SidebarMenuButton asChild tooltip={item.title}>
                  <a href={item.url}>
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              )}
              {item.items?.length ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="data-[state=open]:rotate-90">
                      <ChevronRight />
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <a href={subItem.url}>
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
      <CreateProjectSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </SidebarGroup>
  );
}
