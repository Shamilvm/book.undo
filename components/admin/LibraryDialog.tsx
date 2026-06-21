"use client";

import { FormEvent, useEffect, useState } from "react";
import AdminFormDialog from "@/components/admin/AdminFormDialog";
import SelectField from "@/components/SelectField";
import {
  createAdminLibrary,
  updateAdminLibrary,
  type AdminLibrary,
} from "@/lib/admin-api";
import { libraryTypes } from "@/lib/form-options";
import type { LibraryType } from "@/lib/types";

type Props = {
  item?: AdminLibrary | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export default function LibraryDialog({
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
    const address = String(fd.get("address"));
    const latStr = String(fd.get("latitude"));
    const lngStr = String(fd.get("longitude"));

    const payload = {
      name: String(fd.get("name")),
      description: String(fd.get("spotType") || "") || undefined,
      curatorName: String(fd.get("curatorName")),
      curatorContact: String(fd.get("email") || "") || undefined,
      location: address,
      district: String(fd.get("district")),
      state: String(fd.get("state") || "Kerala"),
      address,
      latitude: latStr ? parseFloat(latStr) : undefined,
      longitude: lngStr ? parseFloat(lngStr) : undefined,
      libraryType: String(fd.get("libraryType")) as LibraryType,
      coverEmoji: String(fd.get("coverEmoji") || "🏠") || "🏠",
    };

    try {
      if (isEdit && item) {
        await updateAdminLibrary(item._id, payload);
      } else {
        await createAdminLibrary(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEdit
            ? "Failed to update library"
            : "Failed to add library",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminFormDialog
      open={open}
      formId={item?._id ?? "new"}
      title={isEdit ? "Edit library" : "Add library"}
      submitLabel={isEdit ? "Save changes" : "Add library"}
      onClose={onClose}
      onSubmit={handleSubmit}
      error={error}
      submitting={submitting}
    >
      <div className="row">
        <label>
          Library name
          <input
            type="text"
            name="name"
            defaultValue={item?.name ?? ""}
            placeholder="The Banyan Shelf"
            required
          />
        </label>
        <label>
          Type of spot
          <input
            type="text"
            name="spotType"
            defaultValue={item?.description ?? ""}
            placeholder="Café, lobby, yard…"
          />
        </label>
      </div>
      <label>
        Address / area
        <input
          type="text"
          name="address"
          defaultValue={item?.location ?? ""}
          placeholder="Street and neighbourhood"
          required
        />
      </label>
      <div className="row">
        <label>
          District
          <input
            type="text"
            name="district"
            defaultValue={item?.district ?? ""}
            placeholder="e.g. Ernakulam"
            required
          />
        </label>
        <label>
          State
          <input
            type="text"
            name="state"
            defaultValue={item?.state ?? "Kerala"}
            placeholder="Kerala"
            required
          />
        </label>
      </div>
      <div className="row">
        <label>
          Latitude
          <input
            type="number"
            name="latitude"
            step="any"
            defaultValue={item?.latitude ?? ""}
            placeholder="9.9312"
          />
        </label>
        <label>
          Longitude
          <input
            type="number"
            name="longitude"
            step="any"
            defaultValue={item?.longitude ?? ""}
            placeholder="76.2673"
          />
        </label>
      </div>
      <div className="row">
        <label>
          Curator name
          <input
            type="text"
            name="curatorName"
            defaultValue={item?.curatorName ?? ""}
            placeholder="Curator name"
            required
          />
        </label>
        <label>
          Curator email
          <input
            type="email"
            name="email"
            defaultValue={item?.curatorContact ?? ""}
            placeholder="curator@example.com"
          />
        </label>
      </div>
      <div className="row">
        <label>
          Library type
          <SelectField name="libraryType" defaultValue={item?.libraryType ?? "public"}>
            {libraryTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </SelectField>
        </label>
        <label>
          Cover emoji
          <input
            type="text"
            name="coverEmoji"
            defaultValue={item?.coverEmoji ?? "🏠"}
            maxLength={4}
          />
        </label>
      </div>
    </AdminFormDialog>
  );
}
