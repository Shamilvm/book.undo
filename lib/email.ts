import { splitContact } from "@/lib/admin-form-utils";

export interface BorrowNotificationPayload {
  donorContact?: string;
  borrowerContact: string;
  bookTitle: string;
  borrowerName: string;
  message?: string;
  manageUrl: string;
  requestUrl: string;
}

export interface BorrowStatusNotificationPayload {
  contact: string;
  bookTitle: string;
  status: "approved" | "cancelled" | "returned";
  pickupLocation?: string;
  pickupContact?: string;
  requestUrl: string;
}

function appOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

function fullUrl(path: string): string {
  return `${appOrigin()}${path.startsWith("/") ? path : `/${path}`}`;
}

function logEmail(to: string, subject: string, body: string) {
  if (process.env.NODE_ENV === "production" && !process.env.EMAIL_PROVIDER) {
    console.warn("[email] No EMAIL_PROVIDER configured — notification skipped.");
    return;
  }
  console.log(`[email] To: ${to}\nSubject: ${subject}\n${body}\n---`);
}

export async function sendBorrowRequestNotification(
  payload: BorrowNotificationPayload,
): Promise<void> {
  const manageLink = fullUrl(payload.manageUrl);
  const requestLink = fullUrl(payload.requestUrl);
  const donor = splitContact(payload.donorContact);
  const borrower = splitContact(payload.borrowerContact);

  const subject = `Borrow request for "${payload.bookTitle}"`;
  const body = [
    `${payload.borrowerName} wants to borrow your book "${payload.bookTitle}".`,
    payload.message ? `Message: ${payload.message}` : "",
    "",
    `Approve or decline: ${manageLink}`,
    `Borrower status link: ${requestLink}`,
  ]
    .filter(Boolean)
    .join("\n");

  if (donor.email) logEmail(donor.email, subject, body);
  if (donor.phone) {
    logEmail(
      donor.phone,
      subject,
      `${payload.borrowerName} wants to borrow "${payload.bookTitle}". Manage: ${manageLink}`,
    );
  }

  if (borrower.email) {
    logEmail(
      borrower.email,
      `Request sent for "${payload.bookTitle}"`,
      `Your borrow request was sent. Track status: ${requestLink}`,
    );
  }
}

export async function sendBorrowStatusNotification(
  payload: BorrowStatusNotificationPayload,
): Promise<void> {
  const requestLink = fullUrl(payload.requestUrl);
  const { email, phone } = splitContact(payload.contact);

  let body = "";
  if (payload.status === "approved") {
    body = [
      `Your borrow request for "${payload.bookTitle}" was approved!`,
      payload.pickupLocation ? `Pickup area: ${payload.pickupLocation}` : "",
      payload.pickupContact ? `Contact: ${payload.pickupContact}` : "",
      "",
      `View details: ${requestLink}`,
    ]
      .filter(Boolean)
      .join("\n");
  } else if (payload.status === "cancelled") {
    body = `Your borrow request for "${payload.bookTitle}" was declined. View: ${requestLink}`;
  } else {
    body = `"${payload.bookTitle}" was marked as returned. Thanks for borrowing! ${requestLink}`;
  }

  const subject =
    payload.status === "approved"
      ? `Approved: borrow "${payload.bookTitle}"`
      : payload.status === "cancelled"
        ? `Declined: borrow "${payload.bookTitle}"`
        : `Returned: "${payload.bookTitle}"`;

  if (email) logEmail(email, subject, body);
  if (phone) logEmail(phone, subject, body);
}
