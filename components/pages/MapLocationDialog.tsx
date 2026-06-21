"use client";

import { useEffect, useRef, useState } from "react";
import MapLocationPicker from "@/components/pages/MapLocationPicker";
import { showToast } from "@/lib/toast";

interface MapLocationDialogProps {
  open: boolean;
  value: { lat: number; lng: number } | null;
  onClose: () => void;
  onConfirm: (coords: { lat: number; lng: number }) => void;
}

export default function MapLocationDialog({
  open,
  value,
  onClose,
  onConfirm,
}: MapLocationDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<{ lat: number; lng: number } | null>(value);
  const [locating, setLocating] = useState(false);
  const [pickerKey, setPickerKey] = useState(0);
  const [pickerVisible, setPickerVisible] = useState(false);

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
    if (!open) {
      setPickerVisible(false);
      return;
    }

    setDraft(value);
    setPickerKey((k) => k + 1);

    const timer = window.setTimeout(() => {
      setPickerVisible(true);
    }, 100);

    return () => {
      window.clearTimeout(timer);
      setPickerVisible(false);
    };
  }, [open, value]);

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

  function useMyLocation() {
    if (!navigator.geolocation) {
      showToast("Location is not available in this browser.", "error");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDraft({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocating(false);
      },
      () => {
        showToast(
          "Could not get your location. Click the map to pin the library instead.",
          "error",
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function handleConfirm() {
    if (!draft) {
      showToast("Click the map to mark where the library is located.", "error");
      return;
    }
    onConfirm(draft);
  }

  return (
    <dialog
      ref={dialogRef}
      className="location-dialog"
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="location-dialog-body" onClick={(e) => e.stopPropagation()}>
        <h3>Pin the library on the map</h3>
        <p className="muted small">
          Click the map to drop a pin at the library&apos;s exact location.
        </p>
        <div className="location-dialog-actions">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={useMyLocation}
            disabled={locating}
          >
            {locating ? "Locating…" : "Use my location"}
          </button>
          {draft && (
            <span className="muted small">
              {draft.lat.toFixed(5)}, {draft.lng.toFixed(5)}
            </span>
          )}
        </div>
        {pickerVisible && (
          <MapLocationPicker
            key={pickerKey}
            value={draft}
            onChange={setDraft}
          />
        )}
        <div className="dialog-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleConfirm}
          >
            Confirm location
          </button>
        </div>
      </div>
    </dialog>
  );
}
