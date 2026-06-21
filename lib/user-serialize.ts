import type { IUser } from "@/lib/models/User";

export type AdminUserResponse = {
  _id: string;
  userName: string;
  displayName: string;
  buId?: string;
  role: string;
  status: string;
  email: string;
  phone?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  hasPassword: boolean;
};

export function serializeAdminUser(
  user: IUser,
  passwordHash?: string | null,
): AdminUserResponse {
  const obj = user.toObject();
  delete (obj as { passwordHash?: string }).passwordHash;
  const hash = passwordHash ?? user.passwordHash;
  return {
    ...(obj as Omit<AdminUserResponse, "hasPassword">),
    hasPassword: !!hash,
  };
}
