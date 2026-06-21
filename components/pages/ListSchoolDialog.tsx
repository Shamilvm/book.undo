"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { submitSchoolListing } from "@/lib/api";
import { showToast } from "@/lib/toast";

interface ListSchoolDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function ListSchoolDialog({
  open,
  onClose,
}: ListSchoolDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;

    if (open) {
      if (!dlg.open) dlg.showModal();
    } else if (dlg.open) {
      dlg.close();
    }
  }, [open]);

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;

    const onCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };

    dlg.addEventListener("cancel", onCancel);
    return () => dlg.removeEventListener("cancel", onCancel);
  }, [onClose]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const form = formRef.current;
    if (!form) {
      setSubmitting(false);
      return;
    }

    const fd = new FormData(form);

    try {
      await submitSchoolListing({
        schoolName: String(fd.get("schoolName")),
        district: String(fd.get("district")),
        description: String(fd.get("description")),
        gradeRange: String(fd.get("gradeRange")),
        booksNeeded: parseInt(String(fd.get("booksNeeded")), 10),
        contactName: String(fd.get("contactName")),
        contactPhone: String(fd.get("contactPhone") || "") || undefined,
        subjects: String(fd.get("subjects") || "") || undefined,
      });
      form.reset();
      onClose();
      showToast(
        "Thanks! We'll review your listing and add it once approved.",
        "success",
      );
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to submit listing",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="list-school-dialog"
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
      >
        <h3>List your school or college</h3>
        <p className="muted small">
          Tell us about your institution and what books you need. We&apos;ll
          review your listing before it appears in the directory.
        </p>
        <label>
          School / college name
          <input
            type="text"
            name="schoolName"
            placeholder="e.g. Govt. High School, Vellarada"
            required
          />
        </label>
        <div className="row">
          <label>
            District
            <input
              type="text"
              name="district"
              placeholder="e.g. Thiruvananthapuram"
              required
            />
          </label>
          <label>
            Grade range
            <input
              type="text"
              name="gradeRange"
              placeholder="e.g. 1–5, 11–12"
              required
            />
          </label>
        </div>
        <label>
          Books needed (approximate count)
          <input
            type="number"
            name="booksNeeded"
            min={1}
            placeholder="e.g. 50"
            required
          />
        </label>
        <label>
          What do you need?
          <textarea
            name="description"
            rows={3}
            placeholder="Storybooks, textbooks, subject areas…"
            required
          />
        </label>
        <label>
          Subjects (optional, comma-separated)
          <input
            type="text"
            name="subjects"
            placeholder="Malayalam, English, Science…"
          />
        </label>
        <div className="row">
          <label>
            Contact name
            <input
              type="text"
              name="contactName"
              placeholder="Teacher or coordinator"
              required
            />
          </label>
          <label>
            Contact phone (optional)
            <input type="text" name="contactPhone" placeholder="Phone number" />
          </label>
        </div>
        <p className="muted small privacy-note">
          Contact details are not shown publicly — we only use them to reach
          you about your listing.
        </p>
        <div className="dialog-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Sending…" : "Submit listing"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
