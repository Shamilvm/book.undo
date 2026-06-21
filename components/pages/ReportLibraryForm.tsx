"use client";

import { FormEvent, useRef, useState } from "react";
import MapLocationDialog from "@/components/pages/MapLocationDialog";
import { reportLibrary } from "@/lib/api";
import { resetEnhancedForm } from "@/lib/select-fields";
import { showToast } from "@/lib/toast";

export default function ReportLibraryForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [pickerOpen, setPickerOpen] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!coords) {
      showToast("Select the library location on the map first.", "error");
      return;
    }

    setSubmitting(true);

    const form = formRef.current;
    if (!form) {
      setSubmitting(false);
      return;
    }

    const fd = new FormData(form);
    const address = String(fd.get("address"));

    try {
      await reportLibrary({
        name: String(fd.get("name")),
        location: address,
        address,
        district: String(fd.get("district")),
        state: String(fd.get("state") || "Kerala"),
        reporterName: String(fd.get("reporterName")),
        reporterContact: String(fd.get("contact") || "") || undefined,
        latitude: coords.lat,
        longitude: coords.lng,
      });
      resetEnhancedForm(form);
      setCoords(null);
      showToast(
        "Thanks! We'll review your report and add it to the map once approved.",
        "success",
      );
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to submit report",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <form ref={formRef} onSubmit={handleSubmit}>
        <div className="row">
          <label>
            Library name
            <input
              type="text"
              name="name"
              placeholder="e.g. District Public Library"
              required
            />
          </label>
          <label>
            State
            <input
              type="text"
              name="state"
              defaultValue="Kerala"
              placeholder="Kerala"
              required
            />
          </label>
        </div>
        <label>
          Address / area
          <input
            type="text"
            name="address"
            placeholder="Street, neighbourhood, or landmark"
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
          <span className="location-picker-label">Library location on map</span>
          <p className="muted small location-picker-hint">
            Open the map and click to drop a pin at the library.
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

        <div className="row">
          <label>
            Your name
            <input
              type="text"
              name="reporterName"
              placeholder="Your name"
              required
            />
          </label>
          <label>
            Contact (email or phone)
            <input type="text" name="contact" placeholder="you@example.com" />
          </label>
        </div>
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Sending…" : "Report this library"}
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
