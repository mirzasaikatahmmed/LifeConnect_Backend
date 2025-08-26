export type UserRole = 'donor' | 'manager' | 'admin';

export interface RegistrationData {
  userType: UserRole;
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phoneNumber: string;
  bloodType?: string;
  roleId?: number;
  medicalLicense?: string;
  specialization?: string;
  hospitalAffiliation?: string;
  adminCode?: string;
}

export interface RegistrationStep {
  title: string;
  description: string;
}