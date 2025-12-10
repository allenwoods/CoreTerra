import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Inbox,
  FolderKanban,
  Settings,
  HelpCircle,
  Search,
  PlusCircle,
  MoreHorizontal,
  FileEdit,
  Maximize2,
  X,
  Check,
  FileText,
  Calendar,
  User,
  Plus,
  Trash2,
  PanelLeftClose,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

/**
 * Icon mapping from Material Symbols Outlined to lucide-react
 *
 * This provides a centralized mapping for migrating from Google's Material Symbols
 * to lucide-react icons. Each key is the Material Symbols icon name used in the
 * prototype.html, and the value is the corresponding lucide-react component.
 */
export const iconMap: Record<string, LucideIcon> = {
  // Navigation
  'dashboard': LayoutDashboard,
  'inbox': Inbox,
  'folder_managed': FolderKanban,
  'settings': Settings,
  'help': HelpCircle,

  // Interactions
  'search': Search,
  'add_circle': PlusCircle,
  'more_horiz': MoreHorizontal,
  'edit_document': FileEdit,
  'open_in_full': Maximize2,
  'close': X,
  'check': Check,

  // Content
  'description': FileText,
  'event': Calendar,
  'person': User,
  'add': Plus,
  'delete': Trash2,
  'dock_to_left': PanelLeftClose,

  // Arrows/Chevrons
  'chevron_right': ChevronRight,
  'expand_more': ChevronDown,
};

/**
 * Get a lucide-react icon component by Material Symbols name
 *
 * @param name - Material Symbols icon name
 * @returns Lucide React icon component, or a fallback HelpCircle if not found
 */
export function getIcon(name: string): LucideIcon {
  return iconMap[name] || HelpCircle;
}

/**
 * Icon component names for direct imports
 * This can be useful for type-checking and autocomplete
 */
export type IconName = keyof typeof iconMap;
