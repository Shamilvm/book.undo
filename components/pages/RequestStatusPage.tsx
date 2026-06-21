"use client";

import { useEffect, useState } from "react";
import {
  getBorrowRequestStatus,
  type RequestStatusData,
} from "@/lib/api";

interface RequestStatusPageProps {
  token: string;
}

function statusMessage(status: string): { title: string; body: string } {
  switch (status) {
    case "pending":
      return {
        title: "Waiting for the donor",
        body: "Your request was sent. The donor will approve or decline shortly.",
      };
    case "approved":
      return {
        title: "Approved — arrange pickup",
        body: "The donor approved your request. Use the contact details below to pick up the book.",
      };
    case "cancelled":
      return {
        title: "Request declined",
        body: "The donor couldn't lend this book right now. Try another listing on Borrow.",
      };
    case "returned":
      return {
        title: "Book returned",
        body: "This borrow is complete. Thanks for reading and returning!",
      };
    default:
      return { title: status, body: "" };
  }
}

export default function RequestStatusPage({ token }: RequestStatusPageProps) {
  const [data, setData] = useState<RequestStatusData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBorrowRequestStatus(token)
      .then(setData)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Could not load request"),
      )
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <p className="muted center">Loading your request…</p>;
  }

  if (error || !data) {
    return (
      <div className="card manage-card">
        <h2>Request not found</h2>
        <p className="muted">{error || "This link may be invalid."}</p>
      </div>
    );
  }

  const msg = statusMessage(data.status);
  const book = data.book;

  return (
    <div className="manage-layout">
      <article className="card manage-card reveal">
        <span className={`status-badge ${data.status}`}>{msg.title}</span>
        <p className="muted">{msg.body}</p>

        {book && (
          <div className="manage-book-head">
            <span className="cover">{book.coverEmoji}</span>
            <div>
              <h2>{book.title}</h2>
              <p className="muted author">{book.author}</p>
              <p className="muted small">
                Listed by {book.listedBy || "A neighbour"}
              </p>
            </div>
          </div>
        )}

        {data.status === "approved" && book && (
          <div className="pickup-details">
            {book.pickupLocation && (
              <p>
                <strong>Pickup area:</strong> {book.pickupLocation}
              </p>
            )}
            {book.pickupContact && (
              <p>
                <strong>Contact:</strong> {book.pickupContact}
              </p>
            )}
          </div>
        )}

        <p className="muted small manage-tip">
          Bookmark this page to check your request status anytime.
        </p>
      </article>
    </div>
  );
}
