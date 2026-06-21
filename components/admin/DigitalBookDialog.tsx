"use client";

import { FormEvent, useEffect, useState } from "react";
import AdminFormDialog from "@/components/admin/AdminFormDialog";
import {
  createAdminDigitalBook,
  updateAdminDigitalBook,
  type DigitalBook,
} from "@/lib/admin-api";

type Props = {
  item?: DigitalBook | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export default function DigitalBookDialog({
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

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const payload = {
      title: String(fd.get("title")),
      author: String(fd.get("author")),
      genre: String(fd.get("genre")),
      url: String(fd.get("url")),
      coverEmoji: String(fd.get("coverEmoji") || "📚") || "📚",
    };

    try {
      if (isEdit && item) {
        await updateAdminDigitalBook(item._id, payload);
      } else {
        await createAdminDigitalBook(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEdit
            ? "Failed to update digital title"
            : "Failed to add digital title",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminFormDialog
      open={open}
      formId={item?._id ?? "new"}
      title={isEdit ? "Edit digital title" : "Add digital title"}
      submitLabel={isEdit ? "Save changes" : "Add title"}
      onClose={onClose}
      onSubmit={handleSubmit}
      error={error}
      submitting={submitting}
    >
      <label>
        Title
        <input
          type="text"
          name="title"
          defaultValue={item?.title ?? ""}
          placeholder="Book title"
          required
        />
      </label>
      <label>
        Author
        <input
          type="text"
          name="author"
          defaultValue={item?.author ?? ""}
          placeholder="Author name"
          required
        />
      </label>
      <label>
        Genre
        <input
          type="text"
          name="genre"
          defaultValue={item?.genre ?? ""}
          placeholder="Fiction, Philosophy…"
          required
        />
      </label>
      <label>
        Read URL
        <input
          type="url"
          name="url"
          defaultValue={item?.url ?? ""}
          placeholder="https://…"
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
