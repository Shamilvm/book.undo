"use client";

import { FormEvent, useEffect, useState } from "react";
import AdminFormDialog from "@/components/admin/AdminFormDialog";
import SelectField from "@/components/SelectField";
import {
  createAdminBook,
  updateAdminBook,
  type AdminBook,
} from "@/lib/admin-api";
import { joinContact, splitContact } from "@/lib/admin-form-utils";
import { bookCategories, bookConditions } from "@/lib/form-options";
import type { BookCategory, BookCondition } from "@/lib/types";

type Props = {
  item?: AdminBook | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export default function BookDialog({ item, open, onClose, onSaved }: Props) {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!item?._id;
  const contact = splitContact(item?.donorContact);

  useEffect(() => {
    if (open) setError("");
  }, [open, item?._id]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const area = String(fd.get("area") || "").trim();
    const payload = {
      title: String(fd.get("title")),
      author: String(fd.get("author")),
      donorName: String(fd.get("donorName")),
      donorContact: joinContact(email, phone),
      condition: String(fd.get("condition")) as BookCondition,
      category: String(fd.get("category")) as BookCategory,
      location: area,
      district: area,
      coverEmoji: String(fd.get("coverEmoji") || "📚") || "📚",
    };

    try {
      if (isEdit && item) {
        await updateAdminBook(item._id, payload);
      } else {
        await createAdminBook(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEdit
            ? "Failed to update book"
            : "Failed to add book",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminFormDialog
      open={open}
      formId={item?._id ?? "new"}
      title={isEdit ? "Edit book" : "Add book"}
      submitLabel={isEdit ? "Save changes" : "Add book"}
      onClose={onClose}
      onSubmit={handleSubmit}
      error={error}
      submitting={submitting}
    >
      <label>
        Book title
        <input
          type="text"
          name="title"
          defaultValue={item?.title ?? ""}
          placeholder="e.g. The Alchemist"
          required
        />
      </label>
      <label>
        Author
        <input
          type="text"
          name="author"
          defaultValue={item?.author ?? ""}
          placeholder="Paulo Coelho"
          required
        />
      </label>
      <label>
        Donor name
        <input
          type="text"
          name="donorName"
          defaultValue={item?.donorName ?? ""}
          placeholder="Donor name"
          required
        />
      </label>
      <div className="row">
        <label>
          Email
          <input
            type="email"
            name="email"
            defaultValue={contact.email}
            placeholder="donor@example.com"
          />
        </label>
        <label>
          Phone
          <input
            type="tel"
            name="phone"
            defaultValue={contact.phone}
            placeholder="+91 98765 XXXXX"
          />
        </label>
      </div>
      <div className="row">
        <label>
          Condition
          <SelectField
            name="condition"
            defaultValue={item?.condition ?? "good"}
          >
            {bookConditions.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </SelectField>
        </label>
        <label>
          Category
          <SelectField
            name="category"
            defaultValue={item?.category ?? "fiction"}
          >
            {bookCategories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </SelectField>
        </label>
      </div>
      <label>
        Area / district
        <input
          type="text"
          name="area"
          defaultValue={item?.location ?? ""}
          placeholder="Neighbourhood or district"
          required
        />
      </label>
      <label>
        Cover emoji
        <input
          type="text"
          name="coverEmoji"
          defaultValue={item?.coverEmoji ?? "📚"}
          maxLength={4}
        />
      </label>
    </AdminFormDialog>
  );
}
