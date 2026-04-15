export type UserRole = -1 | 0 | 1 | 2 | 'admin' | 1000

export interface UserClaims {
  name: string;
  email: string;
  roles: UserRole[];
}
