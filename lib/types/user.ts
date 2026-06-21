export type UserRole = "admin" | "super_admin" | "default";
export type UserStatus = "active" | "inactive";

export interface UserInput {
  userName: string;
  displayName: string;
  buId?: string;
  role?: UserRole;
  status?: UserStatus;
  email: string;
  phone?: string;
  notes?: string;
  password?: string;
}

export interface UserUpdate {
  userName?: string;
  displayName?: string;
  buId?: string;
  role?: UserRole;
  status?: UserStatus;
  email?: string;
  phone?: string;
  notes?: string;
  password?: string;
}
