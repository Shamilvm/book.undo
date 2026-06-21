"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getManageExchange,
  unlistExchange,
  type TextbookExchangeListing,
} from "@/lib/api";
import { showToast } from "@/lib/toast";

interface ExchangeManagePageProps {
  token: string;
}

export default function ExchangeManagePage({ token }: ExchangeManagePageProps) {
  const [listing, setListing] = useState<TextbookExchangeListing | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getManageExchange(token);
      setListing(data.listing);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load listing");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleUnlist() {
    if (!confirm("Remove this listing from the public exchange page?")) return;
    setActing(true);
    try {
      await unlistExchange(token);
      showToast("Listing removed", "success");
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Action failed", "error");
    } finally {
      setActing(false);
    }
  }

  if (loading) {
    return <p className="muted center">Loading your listing…</p>;
  }

  if (error || !listing) {
    return (
      <div className="card manage-card">
        <h2>Listing not found</h2>
        <p className="muted">{error || "This manage link may be invalid."}</p>
      </div>
    );
  }

  return (
    <div className="manage-layout">
      <article className="card manage-card reveal">
        <span className="tag">
          {listing.listingType === "offer" ? "Giving" : "Need"}
        </span>
        <h2>{listing.textbookDetails}</h2>
        <p className="muted small">
          📍 {listing.location}, {listing.district}
        </p>
        <p className="muted small">
          Status: <strong>{listing.status}</strong>
        </p>
        <p className="muted small manage-tip">
          Bookmark this page to manage your textbook listing.
        </p>
        {listing.status === "listed" && (
          <button
            type="button"
            className="btn btn-ghost"
            disabled={acting}
            onClick={handleUnlist}
          >
            {acting ? "Removing…" : "Remove from exchange"}
          </button>
        )}
      </article>
    </div>
  );
}
