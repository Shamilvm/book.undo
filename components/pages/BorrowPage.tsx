"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import MapLocationDialog from "@/components/pages/MapLocationDialog";
import SelectField from "@/components/SelectField";
import {
  createBorrowRequest,
  formatCategory,
  formatCondition,
  getBooks,
  getNearbyBooks,
  type Book,
} from "@/lib/api";
import { showToast } from "@/lib/toast";

interface BorrowPageProps {
  initialListings?: Book[];
}

function formatDistance(km?: number): string {
  if (km == null) return "";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export default function BorrowPage({ initialListings }: BorrowPageProps) {
  const [listings, setListings] = useState<Book[]>(initialListings ?? []);
  const [loading, setLoading] = useState(!initialListings);
  const [emptyMsg, setEmptyMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [userCoords, setUserCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [borrowCoords, setBorrowCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const activeBookId = useRef("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const borrowFormRef = useRef<HTMLFormElement>(null);
  const searchFormRef = useRef<HTMLFormElement>(null);

  const renderBooks = useCallback((books: Book[]) => {
    setListings(books);
    setEmptyMsg(
      books.length === 0 ? "No books found. Try a different search." : "",
    );
  }, []);

  const loadBooks = useCallback(
    async (
      search: string,
      radius: string,
      coords: { lat: number; lng: number } | null,
    ) => {
      setLoading(true);
      try {
        if (coords) {
          const books = await getNearbyBooks(
            coords.lat,
            coords.lng,
            parseFloat(radius) || 10,
            search || undefined,
          );
          renderBooks(books);
          return;
        }
        const books = await getBooks({
          status: "available",
          search: search || undefined,
          limit: 50,
          isTextbook: false,
        });
        renderBooks(books);
      } catch {
        setEmptyMsg("Could not reach the server. Try again later.");
      } finally {
        setLoading(false);
      }
    },
    [renderBooks],
  );

  useEffect(() => {
    if (initialListings) return;
    void loadBooks("", "10", null);
  }, [initialListings, loadBooks]);

  useEffect(() => {
    if (loading) return;

    const revealVisible = () => {
      const vh = window.innerHeight;
      document
        .querySelectorAll("#book-list .reveal:not(.is-visible)")
        .forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.top < vh * 0.9 && r.bottom > vh * 0.1) {
            el.classList.add("is-visible");
          }
        });
    };

    revealVisible();
    requestAnimationFrame(revealVisible);
  }, [loading, listings]);

  async function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const search = String(fd.get("search") || "");
    const radius = String(fd.get("radius") || "10");
    await loadBooks(search, radius, userCoords);
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      showToast("Location is not available in this browser.", "error");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserCoords(coords);
        showToast("Showing books near you", "success");
        const form = searchFormRef.current;
        if (form) {
          const fd = new FormData(form);
          void loadBooks(
            String(fd.get("search") || ""),
            String(fd.get("radius") || "10"),
            coords,
          );
        }
      },
      () => {
        showToast("Could not get your location.", "error");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function openDialog(bookId: string) {
    activeBookId.current = bookId;
    setBorrowCoords(userCoords);
    borrowFormRef.current?.reset();
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    borrowFormRef.current?.reset();
    setBorrowCoords(null);
    dialogRef.current?.close();
  }

  async function handleBorrowSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!borrowCoords) {
      showToast("Select your pickup area on the map first.", "error");
      return;
    }

    setSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const area = String(fd.get("area") || "").trim();
    const district = String(fd.get("district") || "").trim();

    if (!area) {
      showToast("Enter your area or neighbourhood.", "error");
      setSubmitting(false);
      return;
    }

    try {
      const result = await createBorrowRequest({
        bookId: activeBookId.current,
        borrowerName: String(fd.get("borrowerName")),
        borrowerContact: String(fd.get("borrowerContact")),
        location: area,
        district: district || undefined,
        latitude: borrowCoords.lat,
        longitude: borrowCoords.lng,
        message: String(fd.get("message") || "") || undefined,
      });
      const fullUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}${result.requestUrl}`
          : result.requestUrl;
      setListings((prev) =>
        prev.map((b) =>
          b._id === activeBookId.current
            ? ({ ...b, _borrowDone: true } as Book & { _borrowDone?: boolean })
            : b,
        ),
      );
      closeDialog();
      try {
        await navigator.clipboard.writeText(fullUrl);
        showToast(
          "Request sent! Status link copied — track your request anytime.",
          "success",
        );
      } catch {
        showToast(
          "Request sent! The donor has been notified.",
          "success",
        );
      }
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to send request",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <section className="section">
        <div className="container">
          <form
            ref={searchFormRef}
            className="searchbar reveal"
            id="borrow-search"
            onSubmit={handleSearch}
          >
            <input
              type="search"
              name="search"
              placeholder="Search by title, author, or subject…"
              aria-label="Search books"
            />
            <SelectField
              className="select-field--pill"
              name="radius"
              aria-label="Distance"
              defaultValue="10"
            >
              <option value="3">3 km</option>
              <option value="10">10 km</option>
              <option value="25">25 km</option>
            </SelectField>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={useMyLocation}
            >
              Near me
            </button>
            <button className="btn btn-primary" type="submit">
              Search
            </button>
          </form>

          <p className="muted result-count" id="result-count">
            {loading
              ? "Loading books…"
              : `Showing ${listings.length} books${userCoords ? " near you" : " shared locally"}`}
          </p>

          <div className="grid grid-3" id="book-list">
            {!loading &&
              listings.map((b) => {
              const done = (b as Book & { _borrowDone?: boolean })._borrowDone;
              return (
                <article
                  key={b._id}
                  className="card listing reveal"
                  data-book-id={b._id}
                >
                  <div className="listing-top">
                    <span className="cover">{b.coverEmoji}</span>
                    <span className="tag">{formatCategory(b.category)}</span>
                  </div>
                  <h3>{b.title}</h3>
                  <p className="muted author">{b.author}</p>
                  <div className="meta">
                    <span>📍 {b.location}</span>
                    {b.distance != null && (
                      <span>· {formatDistance(b.distance)}</span>
                    )}
                    <span>· {formatCondition(b.condition)}</span>
                  </div>
                  {b.listedBy && (
                    <p className="muted small">Listed by {b.listedBy}</p>
                  )}
                  <button
                    className="btn btn-ghost full borrow-btn"
                    type="button"
                    data-book-id={b._id}
                    disabled={done}
                    onClick={() => openDialog(b._id)}
                  >
                    {done ? "Request sent ✓" : "Request to borrow"}
                  </button>
                </article>
              );
            })}
          </div>
          {!loading && emptyMsg && (
            <p className="muted empty-msg" id="empty-msg">
              {emptyMsg}
            </p>
          )}
        </div>
      </section>

      <dialog className="borrow-dialog" id="borrow-dialog" ref={dialogRef}>
        <form
          method="dialog"
          id="borrow-form"
          ref={borrowFormRef}
          onSubmit={handleBorrowSubmit}
        >
          <h3>Request to borrow</h3>
          <label>
            Your name
            <input type="text" name="borrowerName" required />
          </label>
          <label>
            Phone or email
            <input type="text" name="borrowerContact" required />
          </label>
          <label>
            Your area / neighbourhood
            <input
              type="text"
              name="area"
              placeholder="Where you can pick up the book"
              required
            />
          </label>
          <label>
            District
            <input
              type="text"
              name="district"
              placeholder="e.g. Ernakulam"
            />
          </label>
          <div className="location-picker-field">
            <span className="location-picker-label">Your location on map</span>
            <p className="muted small location-picker-hint">
              Pin where you can meet to pick up the book.
            </p>
            <div className="report-actions">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setPickerOpen(true)}
              >
                {borrowCoords ? "Change location" : "Select on map"}
              </button>
              {borrowCoords && (
                <span className="muted small">
                  Pin set · {borrowCoords.lat.toFixed(5)},{" "}
                  {borrowCoords.lng.toFixed(5)}
                </span>
              )}
            </div>
          </div>
          <label>
            Message (optional)
            <input
              type="text"
              name="message"
              placeholder="When can you pick up?"
            />
          </label>
          <div className="dialog-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={closeDialog}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Sending…" : "Send request"}
            </button>
          </div>
        </form>
      </dialog>

      <MapLocationDialog
        open={pickerOpen}
        value={borrowCoords}
        onClose={() => setPickerOpen(false)}
        onConfirm={(next) => {
          setBorrowCoords(next);
          setPickerOpen(false);
        }}
      />

      <section className="section divider-top how-borrow">
        <div className="container">
          <div className="section-head center">
            <h2>Borrowing, the honest way</h2>
            <p className="lead">
              No deposits, no late fines. Just readers trusting readers.
            </p>
          </div>
          <div className="grid grid-3">
            <div className="mini reveal">
              <strong>1. Request</strong>
              <p className="muted">
                Tap to ask. The owner gets a friendly ping.
              </p>
            </div>
            <div className="mini reveal">
              <strong>2. Meet</strong>
              <p className="muted">
                Pick it up locally from a nearby reader.
              </p>
            </div>
            <div className="mini reveal">
              <strong>3. Return or relay</strong>
              <p className="muted">
                Bring it back, or pass it to the next reader in the queue.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
