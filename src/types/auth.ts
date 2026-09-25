export type UserRole = 'User' | 'Admin';

export interface UserClaims {
  name: string;
  email: string;
  roles: UserRole[];
}
