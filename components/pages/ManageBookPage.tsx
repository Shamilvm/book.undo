"use client";

import { useCallback, useEffect, useState } from "react";
import {
  formatCategory,
  formatCondition,
  getManageBook,
  markBookReturned,
  updateManageBorrow,
  type BorrowRequest,
  type ManageBookData,
} from "@/lib/api";
import { showToast } from "@/lib/toast";

interface ManageBookPageProps {
  token: string;
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: "Pending",
    approved: "Approved",
    returned: "Returned",
    cancelled: "Declined",
  };
  return map[status] || status;
}

export default function ManageBookPage({ token }: ManageBookPageProps) {
  const [data, setData] = useState<ManageBookData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const next = await getManageBook(token);
      setData(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load listing");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAction(
    request: BorrowRequest,
    status: "approved" | "cancelled",
  ) {
    setActing(request._id);
    try {
      await updateManageBorrow(token, request._id, status);
      showToast(
        status === "approved" ? "Request approved" : "Request declined",
        "success",
      );
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Action failed", "error");
    } finally {
      setActing(null);
    }
  }

  async function handleReturn() {
    setActing("return");
    try {
      await markBookReturned(token);
      showToast("Book marked as available again", "success");
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Action failed", "error");
    } finally {
      setActing(null);
    }
  }

  if (loading) {
    return <p className="muted center">Loading your listing…</p>;
  }

  if (error || !data) {
    return (
      <div className="card manage-card">
        <h2>Listing not found</h2>
        <p className="muted">
          {error || "This manage link may be invalid or expired."}
        </p>
      </div>
    );
  }

  const { book, requests } = data;
  const pending = requests.filter((r) => r.status === "pending");

  return (
    <div className="manage-layout">
      <article className="card manage-card reveal">
        <div className="manage-book-head">
          <span className="cover">{book.coverEmoji}</span>
          <div>
            <span className="tag">{formatCategory(book.category)}</span>
            <h2>{book.title}</h2>
            <p className="muted author">{book.author}</p>
            <p className="muted small">
              📍 {book.location}, {book.district} ·{" "}
              {formatCondition(book.condition)}
            </p>
            <p className="muted small">
              Status: <strong>{book.status}</strong>
            </p>
          </div>
        </div>
        <p className="muted small manage-tip">
          Bookmark this page — it&apos;s your private dashboard for this listing.
        </p>
        {book.status === "borrowed" && (
          <button
            type="button"
            className="btn btn-primary"
            disabled={acting === "return"}
            onClick={handleReturn}
          >
            {acting === "return" ? "Saving…" : "Mark book as returned"}
          </button>
        )}
      </article>

      <section className="manage-requests reveal">
        <h3>Borrow requests</h3>
        {requests.length === 0 ? (
          <p className="muted">No requests yet. Share your listing on Borrow.</p>
        ) : (
          <div className="manage-request-list">
            {requests.map((req) => (
              <article key={req._id} className="card manage-request">
                <div className="manage-request-head">
                  <strong>{req.borrowerName}</strong>
                  <span className={`status-badge ${req.status}`}>
                    {statusLabel(req.status)}
                  </span>
                </div>
                <p className="muted small">{req.borrowerContact}</p>
                {req.location && (
                  <p className="muted small">
                    📍 {req.location}
                    {req.district ? `, ${req.district}` : ""}
                  </p>
                )}
                {req.message && (
                  <p className="muted small">“{req.message}”</p>
                )}
                {req.status === "pending" && (
                  <div className="manage-request-actions">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      disabled={acting === req._id}
                      onClick={() => handleAction(req, "approved")}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      disabled={acting === req._id}
                      onClick={() => handleAction(req, "cancelled")}
                    >
                      Decline
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
        {pending.length > 0 && (
          <p className="muted small">
            When you approve, the borrower gets your contact details to arrange
            pickup.
          </p>
        )}
      </section>
    </div>
  );
}
