import type { Role } from '@/types/role';
import type { User } from '@/types/user';
import type { TasksByStatus } from '@/types/task';

// Roles & Users
export const roles: Role[] = [
  { id: 'backend-engineer', name: 'Backend Engineer' },
  { id: 'frontend-engineer', name: 'Frontend Engineer' },
  { id: 'ui-designer', name: 'UI Designer' },
  { id: 'devops-engineer', name: 'DevOps Engineer' },
  { id: 'product-manager', name: 'Product Manager' },
];

export const initialUsers: User[] = [
  { id: 'u1', name: 'Alex', role: 'frontend-engineer', avatar: 'https://i.pravatar.cc/150?u=alex', color: 'bg-blue-500' },
  { id: 'u2', name: 'Brenda', role: 'devops-engineer', avatar: 'https://i.pravatar.cc/150?u=brenda', color: 'bg-purple-500' },
  { id: 'u3', name: 'Charles', role: 'backend-engineer', avatar: 'https://i.pravatar.cc/150?u=charles', color: 'bg-red-500' },
  { id: 'u4', name: 'David', role: 'backend-engineer', avatar: 'https://i.pravatar.cc/150?u=david', color: 'bg-green-500' },
  { id: 'u5', name: 'Sarah', role: 'ui-designer', avatar: 'https://i.pravatar.cc/150?u=sarah', color: 'bg-yellow-500' },
];

// Initial Tasks
export const initialTasks: TasksByStatus = {
  inbox: [
    {
      id: 'CT-128',
      status: 'inbox',
      title: 'Design New User Onboarding Flow',
      priority: 'p2',
      priorityColor: 'bg-yellow-100 text-yellow-800',
      role_owner: 'ui-designer',
      creator: 'u5',
      reviewer: 'u1',
      collaborator: 'u5',
      due_date: '',
      timestamp_capture: '2023-10-26T10:00:00Z',
      project: 'Mobile App',
      assignee: { initial: 'UI', color: 'bg-gray-500', name: 'UI Designer' },
      body: 'Design the new onboarding flow for mobile users.\n\n```{subtasks}\n- [ ] [Sketch wireframes](./sub-1)\n- [ ] [Review with product](./sub-2)\n- [ ] [Finalize high-fidelity mocks](./sub-3)\n```',
    },
    {
      id: 'CT-131',
      status: 'inbox',
      title: 'Fix Database Connection Leak',
      priority: 'p1',
      priorityColor: 'bg-red-100 text-red-800',
      role_owner: 'backend-engineer',
      creator: 'u3',
      reviewer: 'u4',
      collaborator: null,
      due_date: '2023-11-01',
      timestamp_capture: '2023-10-27T09:30:00Z',
      project: 'Core Backend',
      assignee: { initial: 'C', color: 'bg-red-600', name: 'Charles' },
      body: 'Investigate connection pool exhaustion in the worker service.',
    },
  ],
  next: [
    {
      id: 'CT-124',
      status: 'next',
      title: 'Refactor Authentication Service',
      priority: 'p1',
      priorityColor: 'bg-red-100 text-red-800',
      role_owner: 'backend-engineer',
      creator: 'u4',
      reviewer: 'u3',
      collaborator: null,
      due_date: '2023-11-15',
      timestamp_capture: '2023-10-20T14:00:00Z',
      timestamp_commitment: '2023-10-25T09:00:00Z',
      project: 'Core Backend',
      assignee: { initial: 'D', color: 'bg-green-600', name: 'David' },
      body: 'Migrate legacy auth tokens to JWT.',
    },
  ],
  waiting: [
    {
      id: 'CT-132',
      status: 'waiting',
      title: 'Waiting for Design Review',
      priority: 'p2',
      priorityColor: 'bg-yellow-100 text-yellow-800',
      role_owner: 'ui-designer',
      creator: 'u5',
      reviewer: 'u1',
      collaborator: null,
      due_date: '2023-10-30',
      timestamp_capture: '2023-10-24T11:00:00Z',
      timestamp_commitment: '2023-10-24T12:00:00Z',
      project: 'Mobile App',
      assignee: { initial: 'UI', color: 'bg-gray-500', name: 'UI Designer' },
      body: 'Pending approval from the design lead. Blocking #CT-128',
    },
  ],
  done: [
    {
      id: 'CT-119',
      status: 'done',
      title: 'Update Deployment Scripts',
      priority: 'p2',
      priorityColor: 'bg-yellow-100 text-yellow-800',
      role_owner: 'devops-engineer',
      creator: 'u2',
      reviewer: 'u3',
      collaborator: null,
      due_date: '2023-10-20',
      timestamp_capture: '2023-10-18T10:00:00Z',
      timestamp_commitment: '2023-10-18T11:00:00Z',
      timestamp_completion: '2023-10-20T16:00:00Z',
      project: 'Infrastructure',
      assignee: { initial: 'B', color: 'bg-blue-600', name: 'Brenda' },
      body: 'Updated k8s manifests for the new cluster.',
    },
  ],
};

// Initial Activity Log
export const initialLogs: string[] = [
  "[10:45:12] Task #CT-124 moved to 'Next' by @david",
  "[10:44:50] New commit pushed to 'main' by @alex",
  "[10:42:10] System: PQI for 'Frontend' dropped to 72.",
  "[10:35:01] Task #CT-127 assigned to @brenda",
  "[10:33:45] User @charles changed status to 'Blocked'",
];
