"use client";

import {
  FormEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

type AdminFormDialogProps = {
  open: boolean;
  title: string;
  submitLabel: string;
  formId?: string;
  onClose: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void | Promise<void>;
  children: ReactNode;
  error?: string;
  submitting?: boolean;
};

export default function AdminFormDialog({
  open,
  title,
  submitLabel,
  formId = "new",
  onClose,
  onSubmit,
  children,
  error,
  submitting,
}: AdminFormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;

    if (open && !dlg.open) {
      dlg.showModal();
    } else if (!open && dlg.open) {
      dlg.close();
    }
  }, [open]);

  useEffect(() => {
    if (open) setFormKey((k) => k + 1);
  }, [open, formId]);

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

  return (
    <dialog
      ref={dialogRef}
      className="admin-dialog"
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <form
        key={formKey}
        className="admin-form"
        onSubmit={onSubmit}
        onClick={(e) => e.stopPropagation()}
      >
        <h3>{title}</h3>
        {children}
        <div className="dialog-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitLabel}
          </button>
        </div>
        {error ? <p className="form-error muted">{error}</p> : null}
      </form>
    </dialog>
  );
}
