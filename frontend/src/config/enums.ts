/**
 * Centralized enum configuration loader.
 * Imports enum definitions from /config/enums.json
 */
import enumsConfig from '../../../config/enums.json';

export interface PriorityConfig {
  value: string;
  label: string;
  label_en: string;
  color: string;
  tailwind_class: string;
  icon_color: string;
  description: string;
}

export interface StatusConfig {
  value: string;
  label: string;
  label_en: string;
  color: string;
  description: string;
}

export interface RoleConfig {
  value: string;
  label: string;
  label_en: string;
  color: string;
  icon: string;
}

export interface TaskTypeConfig {
  value: string;
  label: string;
  label_en: string;
  description: string;
}

export interface EnumsConfig {
  version: string;
  priorities: PriorityConfig[];
  statuses: StatusConfig[];
  roles: RoleConfig[];
  task_types: TaskTypeConfig[];
  defaults: {
    priority: string;
    status: string;
    task_type: string;
  };
}

// Load config
export const ENUMS_CONFIG: EnumsConfig = enumsConfig as EnumsConfig;

// Helper constants
export const PRIORITIES = ENUMS_CONFIG.priorities;
export const STATUSES = ENUMS_CONFIG.statuses;
export const ROLES = ENUMS_CONFIG.roles;
export const TASK_TYPES = ENUMS_CONFIG.task_types;

export const DEFAULT_PRIORITY = ENUMS_CONFIG.defaults.priority;
export const DEFAULT_STATUS = ENUMS_CONFIG.defaults.status;
export const DEFAULT_TASK_TYPE = ENUMS_CONFIG.defaults.task_type;

// Type definitions (derived from config values)
export type TaskPriority = typeof PRIORITIES[number]['value'];
export type TaskStatus = typeof STATUSES[number]['value'];
export type RoleValue = typeof ROLES[number]['value'];
export type TaskTypeValue = typeof TASK_TYPES[number]['value'];

// Lookup helper functions
export const getPriorityConfig = (value: string): PriorityConfig | undefined => {
  return PRIORITIES.find(p => p.value === value);
};

export const getStatusConfig = (value: string): StatusConfig | undefined => {
  return STATUSES.find(s => s.value === value);
};

export const getRoleConfig = (value: string): RoleConfig | undefined => {
  return ROLES.find(r => r.value === value);
};

export const getTaskTypeConfig = (value: string): TaskTypeConfig | undefined => {
  return TASK_TYPES.find(t => t.value === value);
};

// Legacy PRIORITY_COLORS for backward compatibility
export const PRIORITY_COLORS: Record<string, string> = Object.fromEntries(
  PRIORITIES.map(p => [p.value, p.tailwind_class])
);

// Helper to get priority label
export const getPriorityLabel = (value: string): string => {
  return getPriorityConfig(value)?.label || `P${value}`;
};

// Helper to get status label
export const getStatusLabel = (value: string): string => {
  return getStatusConfig(value)?.label || value;
};
