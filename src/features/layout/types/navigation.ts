import { LucideIcon } from "lucide-react";

export interface NavigationItem {
  title: string;
  href: string;
  icon: LucideIcon;

  /**
   * Required permission to display this menu item.
   * If omitted, the item is always visible.
   */
  permission?: string;
}

export interface NavigationSection {
  title: string;
  items: NavigationItem[];
}