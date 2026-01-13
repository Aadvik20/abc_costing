export type UserRole =
  | 'user'
  | 'admin'
  | 'finance'
  | 'superAdmin'
  | 'CorporateAdmin'
  | 'EmployeeAssigningAuthority'
  | 'FinanceAdmin'
  | 'FinanceUser'
  | 'reporting'
  | 'reportingAuthrity'
  | 'Reporting'
  | 'Approving';

export interface UserClaims {
  name: string;
  email: string;
  roles: UserRole[];
}
