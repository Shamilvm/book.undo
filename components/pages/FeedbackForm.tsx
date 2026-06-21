"use client";

import { FormEvent, useRef, useState } from "react";
import SelectField from "@/components/SelectField";
import { createFeedback, type FeedbackType } from "@/lib/api";
import { resetEnhancedForm } from "@/lib/select-fields";
import { showToast } from "@/lib/toast";

export default function FeedbackForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const form = formRef.current;
    if (!form) {
      setSubmitting(false);
      return;
    }

    const fd = new FormData(form);
    const email = String(fd.get("email") || "").trim();
    const phone = String(fd.get("phone") || "").trim();

    try {
      await createFeedback({
        name: String(fd.get("name")),
        contact: [email, phone].filter(Boolean).join(" · ") || undefined,
        type: String(fd.get("type")) as FeedbackType,
        message: String(fd.get("message")),
      });
      resetEnhancedForm(form);
      showToast(
        "Thank you! We've received your message and will get back to you soon.",
        "success",
      );
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to send message",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      ref={formRef}
      className="card form reveal"
      id="feedback-form"
      onSubmit={handleSubmit}
    >
      <h3>Send a message</h3>
      <label>
        Your name
        <input type="text" name="name" placeholder="Your name" required />
      </label>
      <div className="row">
        <label>
          Email (optional)
          <input type="email" name="email" placeholder="you@example.com" />
        </label>
        <label>
          Phone (optional)
          <input type="tel" name="phone" placeholder="+91 98765 XXXXX" />
        </label>
      </div>
      <label>
        Topic
        <SelectField name="type" defaultValue="suggestion">
          <option value="suggestion">Suggestion</option>
          <option value="query">Question / query</option>
          <option value="bug">Report an issue</option>
          <option value="other">Other</option>
        </SelectField>
      </label>
      <label>
        Message
        <textarea
          name="message"
          rows={5}
          placeholder="Share your idea, question, or describe the issue..."
          required
        ></textarea>
      </label>
      <p className="form-privacy muted">
        🔒 Your contact details are only used to respond to your message. They
        are never shown publicly.
      </p>
      <button type="submit" className="btn btn-primary" disabled={submitting}>
        Send message
      </button>
    </form>
  );
}
