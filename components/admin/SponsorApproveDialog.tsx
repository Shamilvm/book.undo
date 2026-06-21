"use client";

import { FormEvent, useEffect, useState } from "react";
import AdminFormDialog from "@/components/admin/AdminFormDialog";
import {
  updateSponsorRequestStatus,
  type AdminSponsorRequest,
} from "@/lib/admin-api";
import { parseBooksFromDetails } from "@/lib/parse-books";

type Props = {
  item?: AdminSponsorRequest | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

function defaultBooks(item: AdminSponsorRequest) {
  return (
    item.booksCommitted ??
    parseBooksFromDetails(item.details) ??
    (item.offerType === "books" ? 5 : 10)
  );
}

export default function SponsorApproveDialog({
  item,
  open,
  onClose,
  onSaved,
}: Props) {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) setError("");
  }, [open, item?._id]);

  if (!item) return null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!item?._id) return;
    setError("");
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const booksCommitted = parseInt(String(fd.get("booksCommitted")), 10);
    const moneyAmount = String(fd.get("moneyAmount") || "").trim() || undefined;
    const approvalNote = String(fd.get("approvalNote") || "").trim() || undefined;

    if (!booksCommitted || booksCommitted < 1) {
      setError("Enter how many books to count toward progress.");
      setSubmitting(false);
      return;
    }

    try {
      await updateSponsorRequestStatus(item._id, {
        status: "approved",
        booksCommitted,
        moneyAmount,
        approvalNote,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to approve request",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminFormDialog
      open={open}
      formId={item._id}
      title={`Approve sponsor — ${item.schoolName}`}
      submitLabel="Approve sponsorship"
      onClose={onClose}
      onSubmit={handleSubmit}
      error={error}
      submitting={submitting}
    >
      <p className="muted small">
        {item.sponsorName} · {item.offerType === "books" ? "Books" : "Money"}
        {item.details ? ` · ${item.details}` : ""}
      </p>
      <label>
        Book count (for school progress)
        <input
          type="number"
          name="booksCommitted"
          min={1}
          defaultValue={defaultBooks(item)}
          required
        />
      </label>
      <label>
        Money amount (optional)
        <input
          type="text"
          name="moneyAmount"
          placeholder="e.g. ₹2,000"
        />
      </label>
      <label>
        Note (appended to message)
        <textarea
          name="approvalNote"
          rows={3}
          placeholder="Internal note or follow-up details…"
        />
      </label>
    </AdminFormDialog>
  );
}
