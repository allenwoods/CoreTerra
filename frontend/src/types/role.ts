export interface Role {
  id: string;
  name: string;
}

// Predefined role IDs used in the system
export const ROLE_IDS = {
  BACKEND_ENGINEER: 'backend-engineer',
  FRONTEND_ENGINEER: 'frontend-engineer',
  UI_DESIGNER: 'ui-designer',
  DEVOPS_ENGINEER: 'devops-engineer',
  PRODUCT_MANAGER: 'product-manager',
} as const;
