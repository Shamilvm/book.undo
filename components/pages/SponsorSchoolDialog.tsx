"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { submitSponsorRequest, type Sponsorship } from "@/lib/api";
import { showToast } from "@/lib/toast";

interface SponsorSchoolDialogProps {
  school: Sponsorship | null;
  open: boolean;
  onClose: () => void;
}

export default function SponsorSchoolDialog({
  school,
  open,
  onClose,
}: SponsorSchoolDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [offerType, setOfferType] = useState<"books" | "money">("books");

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

  useEffect(() => {
    if (open) {
      setOfferType("books");
      formRef.current?.reset();
    }
  }, [open, school?._id]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!school) return;

    setSubmitting(true);
    const form = formRef.current;
    if (!form) {
      setSubmitting(false);
      return;
    }

    const fd = new FormData(form);

    try {
      await submitSponsorRequest({
        sponsorshipId: school._id,
        sponsorName: String(fd.get("sponsorName")),
        sponsorContact: String(fd.get("sponsorContact")),
        offerType,
        details: String(fd.get("details") || "") || undefined,
        message: String(fd.get("message") || "") || undefined,
      });
      form.reset();
      onClose();
      showToast(
        "Thanks! We'll contact you to arrange the sponsorship — no payment taken here.",
        "success",
      );
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to submit request",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!school) return null;

  return (
    <dialog
      ref={dialogRef}
      className="list-school-dialog sponsor-school-dialog"
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Sponsor {school.schoolName}</h3>
        <p className="muted small">
          Share how you&apos;d like to help. We&apos;ll contact you to connect
          with the school — there is no direct payment on this site.
        </p>

        <div className="school-summary">
          <span className="school-summary-emoji">{school.coverEmoji}</span>
          <div>
            <strong>{school.schoolName}</strong>
            <p className="muted small">
              📍 {school.district}
              {school.gradeRange ? ` · Grades ${school.gradeRange}` : ""}
            </p>
            <p className="muted small">Needs: {school.description}</p>
          </div>
        </div>

        <fieldset className="offer-type-field">
          <legend>I want to sponsor with</legend>
          <div className="offer-type-options">
            <label className="offer-type-option">
              <input
                type="radio"
                name="offerType"
                value="books"
                checked={offerType === "books"}
                onChange={() => setOfferType("books")}
              />
              Books
            </label>
            <label className="offer-type-option">
              <input
                type="radio"
                name="offerType"
                value="money"
                checked={offerType === "money"}
                onChange={() => setOfferType("money")}
              />
              Money (for books)
            </label>
          </div>
        </fieldset>

        <label>
          {offerType === "books"
            ? "How many books can you provide? (optional)"
            : "Approximate amount (optional)"}
          <input
            type="text"
            name="details"
            placeholder={
              offerType === "books"
                ? "e.g. 20 storybooks"
                : "e.g. ₹2,000 for textbooks"
            }
          />
        </label>

        <div className="row">
          <label>
            Your name
            <input
              type="text"
              name="sponsorName"
              placeholder="Your name"
              required
            />
          </label>
          <label>
            Contact (email or phone)
            <input
              type="text"
              name="sponsorContact"
              placeholder="you@example.com"
              required
            />
          </label>
        </div>

        <label>
          Message (optional)
          <textarea
            name="message"
            rows={2}
            placeholder="Anything else we should know…"
          />
        </label>

        <div className="dialog-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Sending…" : "Request to sponsor"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
