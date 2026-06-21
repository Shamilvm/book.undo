"use client";

import { FormEvent, useEffect, useState } from "react";
import AdminFormDialog from "@/components/admin/AdminFormDialog";
import SelectField from "@/components/SelectField";
import {
  createAdminUser,
  updateAdminUser,
  type AdminUser,
  type UserRole,
  type UserStatus,
} from "@/lib/admin-api";
import { userRoles, userStatuses } from "@/lib/form-options";

type Props = {
  item?: AdminUser | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

type FormState = {
  userName: string;
  displayName: string;
  email: string;
  phone: string;
  buId: string;
  role: UserRole;
  status: UserStatus;
  password: string;
};

const emptyForm = (): FormState => ({
  userName: "",
  displayName: "",
  email: "",
  phone: "",
  buId: "",
  role: "default",
  status: "active",
  password: "",
});

function roleNeedsPassword(role: UserRole): boolean {
  return role === "admin" || role === "super_admin";
}

function toFormState(item: AdminUser): FormState {
  return {
    userName: item.userName,
    displayName: item.displayName,
    email: item.email,
    phone: item.phone ?? "",
    buId: item.buId ?? "",
    role: item.role,
    status: item.status,
    password: "",
  };
}

export default function UserDialog({ item, open, onClose, onSaved }: Props) {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const isEdit = !!item?._id;

  useEffect(() => {
    if (!open) return;
    setError("");
    setForm(item ? toFormState(item) : emptyForm());
  }, [open, item]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const password = form.password.trim();
    const role = form.role;

    try {
      if (isEdit && item) {
        await updateAdminUser(item._id, {
          userName: form.userName,
          displayName: form.displayName,
          buId: form.buId || undefined,
          role,
          status: form.status,
          email: form.email,
          phone: form.phone || undefined,
          password: password || undefined,
        });
      } else {
        if (roleNeedsPassword(role) && !password) {
          throw new Error("Password is required for admin users");
        }
        await createAdminUser({
          userName: form.userName,
          displayName: form.displayName,
          buId: form.buId || undefined,
          role,
          email: form.email,
          phone: form.phone || undefined,
          password: password || undefined,
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEdit
            ? "Failed to update user"
            : "Failed to add user",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminFormDialog
      open={open}
      formId={item?._id ?? "new"}
      title={isEdit ? "Edit user" : "Add user"}
      submitLabel={isEdit ? "Save changes" : "Add user"}
      onClose={onClose}
      onSubmit={handleSubmit}
      error={error}
      submitting={submitting}
    >
      <label>
        Username
        <input
          type="text"
          name="userName"
          value={form.userName}
          onChange={(e) => updateField("userName", e.target.value)}
          placeholder="jdoe"
          required
          autoComplete="username"
        />
      </label>
      <label>
        Display name
        <input
          type="text"
          name="displayName"
          value={form.displayName}
          onChange={(e) => updateField("displayName", e.target.value)}
          placeholder="Jane Doe"
          required
        />
      </label>
      <div className="row">
        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="jane@example.com"
            required
          />
        </label>
        <label>
          Phone
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            placeholder="+91 98765 XXXXX"
          />
        </label>
      </div>
      <label>
        BU ID
        <input
          type="text"
          name="buId"
          value={form.buId}
          onChange={(e) => updateField("buId", e.target.value)}
          placeholder="BU-001"
        />
      </label>
      <div className="row">
        <label>
          Role
          <SelectField
            name="role"
            value={form.role}
            onChange={(e) => updateField("role", e.target.value as UserRole)}
          >
            {userRoles.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </SelectField>
        </label>
        {isEdit ? (
          <label>
            Status
            <SelectField
              name="status"
              value={form.status}
              onChange={(e) =>
                updateField("status", e.target.value as UserStatus)
              }
            >
              {userStatuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </SelectField>
          </label>
        ) : null}
      </div>
      <label>
        {isEdit ? "New password" : "Password"}
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={(e) => updateField("password", e.target.value)}
          autoComplete="new-password"
          required={!isEdit && roleNeedsPassword(form.role)}
          placeholder={
            isEdit
              ? item?.hasPassword
                ? "Leave blank to keep current"
                : "Set a password for admin login"
              : roleNeedsPassword(form.role)
                ? ""
                : "Optional unless role is admin"
          }
        />
      </label>
    </AdminFormDialog>
  );
}
