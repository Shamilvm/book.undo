"use client";

import { FormEvent, useRef, useState } from "react";
import MapLocationDialog from "@/components/pages/MapLocationDialog";
import SelectField from "@/components/SelectField";
import { createBook } from "@/lib/api";
import { bookCategories, bookConditions } from "@/lib/form-options";
import { resetEnhancedForm } from "@/lib/select-fields";
import { showToast } from "@/lib/toast";

export default function DonateForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [pickerOpen, setPickerOpen] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!coords) {
      showToast("Select your pickup area on the map first.", "error");
      return;
    }

    setSubmitting(true);

    const form = formRef.current;
    if (!form) {
      setSubmitting(false);
      return;
    }

    const fd = new FormData(form);
    const area = String(fd.get("area") || "").trim();
    const district = String(fd.get("district") || area).trim();
    const email = String(fd.get("email") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const anonymous = fd.get("anonymous") === "on";

    if (!email && !phone) {
      showToast(
        "Please provide an email or phone number so we can notify you about borrow requests.",
        "error",
      );
      setSubmitting(false);
      return;
    }

    try {
      await createBook({
        title: String(fd.get("title")),
        author: String(fd.get("author")),
        donorName: String(fd.get("donorName")),
        donorContact: [email, phone].filter(Boolean).join(" · "),
        anonymous,
        condition: String(fd.get("condition")),
        category: String(fd.get("category")),
        location: area,
        district,
        latitude: coords.lat,
        longitude: coords.lng,
      });
      resetEnhancedForm(form);
      setCoords(null);
      showToast("Listed! We'll match your book with a reader nearby.", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to list book",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <form
        ref={formRef}
        className="card form reveal"
        id="donate-form"
        onSubmit={handleSubmit}
      >
        <h3>List a book to donate</h3>
        <label>
          Book title
          <input
            type="text"
            name="title"
            placeholder="e.g. The Alchemist"
            required
          />
        </label>
        <label>
          Author
          <input
            type="text"
            name="author"
            placeholder="Paulo Coelho"
            required
          />
        </label>
        <label>
          Your name
          <input
            type="text"
            name="donorName"
            placeholder="Your name"
            required
          />
        </label>
        <label className="checkbox-label">
          <input type="checkbox" name="anonymous" />
          List anonymously (show as &ldquo;A neighbour&rdquo; publicly)
        </label>
        <div className="row">
          <label>
            Email
            <input type="email" name="email" placeholder="you@example.com" />
          </label>
          <label>
            Phone number
            <input type="tel" name="phone" placeholder="+91 98765 XXXXX" />
          </label>
        </div>
        <p className="form-privacy muted">
          Provide at least one — used only to notify you about borrow requests.
        </p>
        <div className="row">
          <label>
            Condition
            <SelectField name="condition" defaultValue="good">
              {bookConditions.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </SelectField>
          </label>
          <label>
            Category
            <SelectField name="category" defaultValue="fiction">
              {bookCategories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </SelectField>
          </label>
        </div>
        <label>
          Area / neighbourhood
          <input
            type="text"
            name="area"
            placeholder="Neighbourhood or landmark"
            required
          />
        </label>
        <label>
          District
          <input
            type="text"
            name="district"
            placeholder="e.g. Ernakulam"
            required
          />
        </label>

        <div className="location-picker-field">
          <span className="location-picker-label">Pickup area on map</span>
          <p className="muted small location-picker-hint">
            Pin where borrowers can pick up the book. Exact address stays
            private until you approve a request.
          </p>
          <div className="report-actions">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setPickerOpen(true)}
            >
              {coords ? "Change location" : "Select on map"}
            </button>
            {coords && (
              <span className="muted small">
                Pin set · {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
              </span>
            )}
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Listing…" : "List this book"}
        </button>
      </form>

      <MapLocationDialog
        open={pickerOpen}
        value={coords}
        onClose={() => setPickerOpen(false)}
        onConfirm={(next) => {
          setCoords(next);
          setPickerOpen(false);
        }}
      />
    </>
  );
}
