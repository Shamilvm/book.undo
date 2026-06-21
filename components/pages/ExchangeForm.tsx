"use client";

import { FormEvent, useRef, useState } from "react";
import MapLocationDialog from "@/components/pages/MapLocationDialog";
import {
  createTextbookExchangeListing,
  type ExchangeListingType,
} from "@/lib/api";
import { resetEnhancedForm } from "@/lib/select-fields";
import { showToast } from "@/lib/toast";

export default function ExchangeForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [listingType, setListingType] = useState<ExchangeListingType>("offer");
  const [submitting, setSubmitting] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [manageUrl, setManageUrl] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!coords) {
      showToast("Select your area on the map first.", "error");
      return;
    }

    setSubmitting(true);
    setManageUrl("");

    const form = formRef.current;
    if (!form) {
      setSubmitting(false);
      return;
    }

    const fd = new FormData(form);

    try {
      const result = await createTextbookExchangeListing({
        listingType,
        textbookDetails: String(fd.get("textbookDetails")),
        grade: String(fd.get("grade") || "") || undefined,
        subject: String(fd.get("subject") || "") || undefined,
        board: String(fd.get("board") || "") || undefined,
        contactName: String(fd.get("contactName")),
        contactPhone: String(fd.get("contactPhone")),
        address: String(fd.get("address")),
        location: String(fd.get("location")),
        district: String(fd.get("district")),
        latitude: coords.lat,
        longitude: coords.lng,
        coverEmoji: listingType === "offer" ? "📤" : "📥",
      });
      resetEnhancedForm(form);
      setCoords(null);
      setListingType("offer");
      setManageUrl(
        typeof window !== "undefined"
          ? `${window.location.origin}${result.manageUrl}`
          : result.manageUrl,
      );
      showToast("Listed! Save your manage link below.", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to post listing",
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
        id="exchange-form"
        onSubmit={handleSubmit}
      >
        <h3>List your textbook</h3>
        <div
          className="exchange-type-toggle"
          role="group"
          aria-label="Listing type"
        >
          <button
            type="button"
            className={`exchange-type-btn${listingType === "offer" ? " active" : ""}`}
            aria-pressed={listingType === "offer"}
            onClick={() => setListingType("offer")}
          >
            I have textbooks to give
          </button>
          <button
            type="button"
            className={`exchange-type-btn${listingType === "need" ? " active" : ""}`}
            aria-pressed={listingType === "need"}
            onClick={() => setListingType("need")}
          >
            I need a textbook
          </button>
        </div>
        <label>
          {listingType === "offer"
            ? "Textbooks you are giving"
            : "Textbook you need"}
          <textarea
            name="textbookDetails"
            rows={3}
            placeholder={
              listingType === "offer"
                ? "e.g. Class 9 full set — NCERT, good condition"
                : "e.g. Class 10 Maths — NCERT"
            }
            required
          />
        </label>
        <div className="grid grid-2">
          <label>
            Class / grade
            <input type="text" name="grade" placeholder="e.g. 9" />
          </label>
          <label>
            Subject
            <input type="text" name="subject" placeholder="e.g. Maths" />
          </label>
        </div>
        <label>
          School / board
          <input
            type="text"
            name="board"
            placeholder="School name or board (CBSE, State…)"
          />
        </label>
        <label>
          Your name
          <input
            type="text"
            name="contactName"
            placeholder="Your name"
            required
          />
        </label>
        <label>
          Phone number
          <input
            type="tel"
            name="contactPhone"
            placeholder="Phone or WhatsApp"
            required
          />
        </label>
        <label>
          Address
          <input
            type="text"
            name="address"
            placeholder="Street, landmark, pin code"
            required
          />
        </label>
        <div className="grid grid-2">
          <label>
            Area / town
            <input
              type="text"
              name="location"
              placeholder="Your area"
              required
            />
          </label>
          <label>
            District
            <input
              type="text"
              name="district"
              placeholder="District"
              required
            />
          </label>
        </div>

        <div className="location-picker-field">
          <span className="location-picker-label">Your area on map</span>
          <p className="muted small location-picker-hint">
            Pin your general area so nearby students can find your listing.
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

        <p className="muted exchange-privacy-note">
          Your name, phone, and address will appear on the public listing so
          others can reach you directly.
        </p>
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {listingType === "offer"
            ? "Post textbook to give"
            : "Post textbook need"}
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
