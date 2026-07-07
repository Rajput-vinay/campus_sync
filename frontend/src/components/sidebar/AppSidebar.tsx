"use client";

import {
  Settings2,
  School,
  GraduationCap,
  Users,
  LayoutDashboard,
  Banknote,
  type LucideIcon,
  LogOut,
  Building2,
} from "lucide-react";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavUser } from "@/components/sidebar/nav-user";
import { TeamSwitcher } from "@/components/sidebar/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import type { UserRole } from "@/types";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "@/hooks/AuthProvider";
import { useMemo } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToogle } from "./ThemeToogle";

export interface NavItem {
  title: string;
  url: string; // Used for linking and active state matching
  icon?: LucideIcon;
  isActive?: boolean; // Default open state for collapsibles
  roles?: UserRole[]; // Who can see this section? (undefined = everyone)
  items?: {
    title: string;
    url: string;
    roles?: UserRole[]; // Who can see this specific link?
  }[];
}

// This is sample data.
export const sidebardata = {
  teams: [
    {
      name: "NSTI Kanpur",
      logo: School,
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
      roles: ["super_admin", "admin", "teacher", "student", "parent"],
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          roles: ["super_admin", "admin", "teacher", "student", "parent"],
        },
        {
          title: "Activities Log",
          url: "/activies-log",
          roles: ["admin", "super_admin"], // Restricted to Admin
        },
      ],
    },
    {
      title: "Academics",
      url: "#", // Parent item, no link
      icon: School,
      roles: ["admin", "teacher", "student"],
      items: [
        {
          title: "Trades",
          url: "/trades",
          roles: [ "admin", "teacher"],
        },
        {
          title: "Subjects",
          url: "/subjects",
          roles: ["admin", "teacher"],
        },
        {
          title: "Timetable",
          url: "/timetable",
          // Everyone needs to see the schedule
        },
        {
          title: "Attendance",
          url: "/attendance",
          // Parents want to see if their kid was present
        },
      ],
    },
    {
      title: "Learning (LMS)",
      url: "#",
      icon: GraduationCap,
      roles: ["teacher", "student", "admin"], // Parents usually don't need deep LMS access
      items: [
        { title: "Exams", url: "/lms/exams" },
        { title: "Exam Results", url: "/lms/results", roles: ["student"] },
      ],
    },
    {
      title: "Staff",
      url: "#",
      icon: Users,
      roles: ["super_admin", "admin", "teacher"],
      items: [
        { title: "Students", url: "/users/students", roles: ["admin", "teacher"] },
        {
          title: "Teachers",
          url: "/users/teachers",
          roles: [ "admin"], // Only Admin & Super Admin can see Teachers
        },
        {
          title: "Admins",
          url: "/users/admins",
          roles: ["super_admin", "admin"], // Super Admin can see Admins
        },
      ],
    },
    {
      title: "Hostel",
      url: "#",
      icon: Building2,
      roles: ["admin", "teacher", "student"],
      items: [
        { title: "Apply for Hostel", url: "/hostel/apply", roles: ["student"] },
        { title: "Hostel List", url: "/hostel/list", roles: ["admin", "teacher"] },
      ],
    },
    // {
    //   title: "Finance",
    //   url: "#",
    //   icon: Banknote,
    //   roles: ["admin"],
    //   items: [
    //     { title: "Fee Collection", url: "/finance/fees" },
    //     { title: "Expenses", url: "/finance/expenses" },
    //     { title: "Salary", url: "/finance/salary" },
    //   ],
    // },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      roles: ["super_admin", "admin", "teacher", "student", "parent"],
      items: [
        { title: "Change Password", url: "/settings/change-password" },
        { title: "Academic Years", url: "/settings/academic-years", roles: ["super_admin", "admin"] },
        { title: "Institutes", url: "/settings/institutes", roles: ["super_admin"] },
      ],
    },
  ] as NavItem[],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, year, setUser, activeInstitute } = useAuth();
  const location = useLocation(); // <--- Get current URL
  const pathname = location.pathname; // e.g., "/dashboard/analytics"
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const navigate = useNavigate();

  const userData = {
    name: user?.name || "User",
    email: user?.email || "",
    avatar: "",
  };

  const userRole = (user?.role || "student") as UserRole;

  const filteredNav = useMemo(() => {
    return sidebardata.navMain
      .filter((item) => !item.roles || item.roles.includes(userRole))
      .map((item) => {
        const isChildActive = item.items?.some((sub) => sub.url === pathname);
        const isMainActive = item.url === pathname;
        return {
          ...item,
          isActive: isMainActive || isChildActive,
          items: item.items
            ?.filter(
              (subItem) => !subItem.roles || subItem.roles.includes(userRole),
            )
            .map((subItem) => ({
              ...subItem,
              isActive: subItem.url === pathname,
            })),
        };
      });
  }, [pathname, userRole]);

  const logout = async () => {
    try {
      await api.post("/users/logout").finally(() => {
        setUser(null);
        navigate("/login");
        toast.success("Logged out successfully");
      });
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  const teams = useMemo(() => [
    {
      name: activeInstitute?.name || "NSTI Kanpur",
      logo: School,
    },
  ], [activeInstitute]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} yearName={year?.name!} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNav} />
      </SidebarContent>
      <SidebarFooter>
        <div
          className={cn(
            "gap-2",
            isCollapsed ? "flex-row space-y-2" : "flex justify-between",
          )}
        >
          <SidebarMenuItem title="Logout">
            <Button onClick={logout} variant={"ghost"} size="icon-sm">
              <LogOut />
            </Button>
          </SidebarMenuItem>
          <ThemeToogle />
        </div>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
