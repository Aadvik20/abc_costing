export type UserRole = 'User';

export interface UserClaims {
  name: string;
  email: string;
  roles: UserRole[];
}
