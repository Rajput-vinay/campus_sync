"use client";

import * as React from "react";
import { ChevronsUpDown, Building2, Check } from "lucide-react";
import { useAuth } from "@/hooks/AuthProvider";
import type { Institute } from "@/types";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function TeamSwitcher({
  teams,
  yearName,
}: {
  teams: {
    name: string;
    logo: React.ElementType;
  }[];
  yearName: string;
}) {
  const { isMobile } = useSidebar();
  const { user, activeInstitute, setActiveInstitute, institutes } = useAuth();
  const isSuperAdmin = user?.role === "super_admin";

  const displayName = isSuperAdmin
    ? activeInstitute?.name || "Select Campus"
    : activeInstitute?.name || teams[0]?.name || "NSTI Portal";

  const displayCode = isSuperAdmin
    ? activeInstitute?.code || "NATIONWIDE"
    : yearName || activeInstitute?.code || "";

  const Logo = teams[0]?.logo || Building2;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              disabled={!isSuperAdmin}
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Logo className="size-4" />
              </div>
              {/* <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{displayName}</span>
                <span className="truncate text-xs text-muted-foreground">{displayCode}</span>
              </div> */}

              <div className="grid flex-1 min-w-0 text-left text-sm leading-tight">
                <span className="font-semibold break-words">
                  {displayName}
                </span>
                <span className="text-xs text-muted-foreground break-words">
                  {displayCode}
                </span>
              </div>
              {isSuperAdmin && <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-60" />}
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          {isSuperAdmin && (
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-64 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-muted-foreground text-xs uppercase tracking-wider px-2">
                Switch Campus
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {institutes.length === 0 && (
                <div className="px-3 py-2 text-sm text-muted-foreground">No institutes found</div>
              )}
              {institutes.map((inst: Institute) => (
                <DropdownMenuItem
                  key={inst._id}
                  onClick={() => setActiveInstitute(inst)}
                  className={cn("gap-2 p-2 cursor-pointer", !inst.isActive && "opacity-50")}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border bg-muted shrink-0">
                    <Building2 className="size-3.5 shrink-0" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{inst.name}</p>
                    <p className="text-xs text-muted-foreground">{inst.code}</p>
                  </div>
                  {activeInstitute?._id === inst._id && (
                    <Check className="size-4 text-primary shrink-0" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
