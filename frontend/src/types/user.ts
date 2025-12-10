export interface User {
  id: string;
  name: string;
  role: string; // Role ID
  avatar: string; // URL to avatar image
  color: string; // Tailwind bg-* class, e.g., 'bg-blue-500'
}
