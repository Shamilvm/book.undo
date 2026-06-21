"use client";

import { FormEvent, useEffect, useState } from "react";
import AdminFormDialog from "@/components/admin/AdminFormDialog";
import SelectField from "@/components/SelectField";
import {
  updateAdminFeedback,
  type AdminFeedback,
  type FeedbackStatus,
  type FeedbackType,
} from "@/lib/admin-api";
import { feedbackStatuses, feedbackTypes } from "@/lib/form-options";
import { joinContact, splitContact } from "@/lib/admin-form-utils";

type Props = {
  item?: AdminFeedback | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export default function FeedbackDialog({
  item,
  open,
  onClose,
  onSaved,
}: Props) {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!item?._id;
  const contact = splitContact(item?.contact);

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
    const email = String(fd.get("email") || "").trim();
    const phone = String(fd.get("phone") || "").trim();

    try {
      await updateAdminFeedback(item._id, {
        name: String(fd.get("name")),
        contact: joinContact(email, phone) ?? "",
        type: String(fd.get("type")) as FeedbackType,
        message: String(fd.get("message")),
        status: String(fd.get("status")) as FeedbackStatus,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update feedback");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminFormDialog
      open={open}
      formId={item!._id}
      title="Edit feedback"
      submitLabel="Save changes"
      onClose={onClose}
      onSubmit={handleSubmit}
      error={error}
      submitting={submitting}
    >
      <label>
        Name
        <input type="text" name="name" defaultValue={item!.name} required />
      </label>
      <div className="row">
        <label>
          Email
          <input type="email" name="email" defaultValue={contact.email} />
        </label>
        <label>
          Phone
          <input type="tel" name="phone" defaultValue={contact.phone} />
        </label>
      </div>
      <div className="row">
        <label>
          Type
          <SelectField name="type" defaultValue={item!.type}>
            {feedbackTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </SelectField>
        </label>
        <label>
          Status
          <SelectField name="status" defaultValue={item!.status}>
            {feedbackStatuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </SelectField>
        </label>
      </div>
      <label>
        Message
        <textarea
          name="message"
          rows={4}
          defaultValue={item!.message}
          required
        />
      </label>
    </AdminFormDialog>
  );
}
