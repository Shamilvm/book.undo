export function splitContact(contact?: string): { email: string; phone: string } {
  if (!contact) return { email: "", phone: "" };
  const parts = contact.split(" · ").map((s) => s.trim()).filter(Boolean);
  return {
    email: parts.find((p) => p.includes("@")) ?? "",
    phone: parts.find((p) => !p.includes("@")) ?? "",
  };
}

export function joinContact(email: string, phone: string): string | undefined {
  const parts = [email.trim(), phone.trim()].filter(Boolean);
  return parts.length ? parts.join(" · ") : undefined;
}
