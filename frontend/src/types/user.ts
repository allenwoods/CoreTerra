export interface User {
  id: string; // Mapped from user_id
  name: string;
  email: string;
  role: string; // Role ID
  avatar: string; // URL to avatar image
  color: string; // Tailwind bg-* class, e.g., 'bg-blue-500'
  level: number;
  experience: number;
}
