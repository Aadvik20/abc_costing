export type UserRole = -1;

export interface UserClaims {
  name: string;
  email: string;
  roles: UserRole[];
}
