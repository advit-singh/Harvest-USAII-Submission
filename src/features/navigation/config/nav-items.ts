import {
  BarChart3,
  Bot,
  FileText,
  HeartHandshake,
  LayoutDashboard,
  Settings,
  TrendingUp,
  Upload,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Operational awareness at a glance",
  },
  {
    title: "Uploads",
    href: "/uploads",
    icon: Upload,
    description: "Convert raw data into intelligence",
  },
  {
    title: "AI Assistant",
    href: "/assistant",
    icon: Bot,
    description: "Natural-language intelligence access",
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    description: "Understand historical operations",
  },
  {
    title: "Predictions",
    href: "/predictions",
    icon: TrendingUp,
    description: "Prevent waste before it occurs",
  },
  {
    title: "Rescue Network",
    href: "/rescue",
    icon: HeartHandshake,
    description: "Manage surplus redistribution",
  },
  {
    title: "Reports",
    href: "/reports",
    icon: FileText,
    description: "Generate organizational reporting",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Configure platform behavior",
  },
];
