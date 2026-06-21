"use client";

import { FormEvent, useEffect, useState } from "react";
import AdminFormDialog from "@/components/admin/AdminFormDialog";
import SelectField from "@/components/SelectField";
import { updateAdminBorrow, type AdminBorrow } from "@/lib/admin-api";
import { borrowStatuses } from "@/lib/form-options";

type Props = {
  item?: AdminBorrow | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export default function BorrowDialog({ item, open, onClose, onSaved }: Props) {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!item?._id;

  useEffect(() => {
    if (open) setError("");
  }, [open, item?._id]);

  if (!isEdit) return null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!item?._id) return;
    setError("");
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);

    try {
      await updateAdminBorrow(item._id, {
        borrowerName: String(fd.get("borrowerName")),
        borrowerContact: String(fd.get("borrowerContact")),
        message: String(fd.get("message") || "") || undefined,
        status: String(fd.get("status")),
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update borrow request",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminFormDialog
      open={open}
      formId={item!._id}
      title="Edit borrow request"
      submitLabel="Save changes"
      onClose={onClose}
      onSubmit={handleSubmit}
      error={error}
      submitting={submitting}
    >
      <label>
        Borrower name
        <input
          type="text"
          name="borrowerName"
          defaultValue={item!.borrowerName}
          required
        />
      </label>
      <label>
        Phone or email
        <input
          type="text"
          name="borrowerContact"
          defaultValue={item!.borrowerContact}
          required
        />
      </label>
      <label>
        Message
        <input
          type="text"
          name="message"
          defaultValue={item!.message ?? ""}
        />
      </label>
      <label>
        Status
        <SelectField name="status" defaultValue={item!.status}>
          {borrowStatuses.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </SelectField>
      </label>
    </AdminFormDialog>
  );
}
