"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { submitDigitalBook } from "@/lib/api";
import { showToast } from "@/lib/toast";

interface SuggestBookDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function SuggestBookDialog({
  open,
  onClose,
}: SuggestBookDialogProps) {
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
      await submitDigitalBook({
        title: String(fd.get("title")),
        author: String(fd.get("author")),
        genre: String(fd.get("genre")),
        url: String(fd.get("url")),
        submittedBy: String(fd.get("submittedBy") || "") || undefined,
      });
      form.reset();
      onClose();
      showToast(
        "Thanks! We'll review your suggestion for the shelf.",
        "success",
      );
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to submit suggestion",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="suggest-book-dialog"
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Suggest a title</h3>
        <p className="muted small">
          Share a freely-licensed or public-domain book link. We&apos;ll review
          it before adding it to the shelf.
        </p>
        <label>
          Book link
          <input
            type="url"
            name="url"
            placeholder="https://…"
            required
          />
        </label>
        <div className="row">
          <label>
            Title
            <input
              type="text"
              name="title"
              placeholder="Book title"
              required
            />
          </label>
          <label>
            Author
            <input
              type="text"
              name="author"
              placeholder="Author name"
              required
            />
          </label>
        </div>
        <label>
          Genre
          <input
            type="text"
            name="genre"
            placeholder="Fiction, Philosophy…"
            required
          />
        </label>
        <label>
          Your name (optional)
          <input type="text" name="submittedBy" placeholder="Your name" />
        </label>
        <div className="dialog-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Sending…" : "Submit suggestion"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
