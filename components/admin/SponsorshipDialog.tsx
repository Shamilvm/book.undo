"use client";

import { FormEvent, useEffect, useState } from "react";
import AdminFormDialog from "@/components/admin/AdminFormDialog";
import SelectField from "@/components/SelectField";
import { updateAdminSponsorship, type AdminSponsorship } from "@/lib/admin-api";
import { sponsorshipStatuses } from "@/lib/form-options";

type Props = {
  item?: AdminSponsorship | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export default function SponsorshipDialog({
  item,
  open,
  onClose,
  onSaved,
}: Props) {
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
      await updateAdminSponsorship(item._id, {
        schoolName: String(fd.get("schoolName")),
        district: String(fd.get("district")),
        description: String(fd.get("description")),
        gradeRange: String(fd.get("gradeRange")),
        contactName: String(fd.get("contactName")),
        contactPhone: String(fd.get("contactPhone") || "") || undefined,
        booksNeeded: parseInt(String(fd.get("booksNeeded")), 10),
        booksFunded: parseInt(String(fd.get("booksFunded")), 10),
        status: String(fd.get("status")),
        coverEmoji: String(fd.get("coverEmoji") || "🏫") || "🏫",
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update sponsorship",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminFormDialog
      open={open}
      formId={item!._id}
      title="Edit sponsorship"
      submitLabel="Save changes"
      onClose={onClose}
      onSubmit={handleSubmit}
      error={error}
      submitting={submitting}
    >
      <label>
        School name
        <input
          type="text"
          name="schoolName"
          defaultValue={item!.schoolName}
          required
        />
      </label>
      <div className="row">
        <label>
          District
          <input
            type="text"
            name="district"
            defaultValue={item!.district}
            required
          />
        </label>
        <label>
          Grade range
          <input
            type="text"
            name="gradeRange"
            defaultValue={item!.gradeRange}
            required
          />
        </label>
      </div>
      <label>
        Description
        <textarea
          name="description"
          rows={3}
          defaultValue={item!.description}
          required
        />
      </label>
      <div className="row">
        <label>
          Contact name
          <input
            type="text"
            name="contactName"
            defaultValue={item!.contactName}
            required
          />
        </label>
        <label>
          Contact phone
          <input
            type="tel"
            name="contactPhone"
            defaultValue={item!.contactPhone ?? ""}
          />
        </label>
      </div>
      <div className="row">
        <label>
          Books needed
          <input
            type="number"
            name="booksNeeded"
            min={1}
            defaultValue={item!.booksNeeded}
            required
          />
        </label>
        <label>
          Books funded
          <input
            type="number"
            name="booksFunded"
            min={0}
            defaultValue={item!.booksFunded}
            required
          />
        </label>
      </div>
      <div className="row">
        <label>
          Status
          <SelectField name="status" defaultValue={item!.status}>
            {sponsorshipStatuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </SelectField>
        </label>
        <label>
          Cover emoji
          <input
            type="text"
            name="coverEmoji"
            defaultValue={item!.coverEmoji}
            maxLength={4}
          />
        </label>
      </div>
    </AdminFormDialog>
  );
}
