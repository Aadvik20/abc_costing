import { LucideIcon } from 'lucide-react';
import { UserRole } from './auth';

export type NavItem = {
  title: string;
  url?: string;
  icon?: LucideIcon;
  roles: Number[];
  children?: NavItem[];
};
