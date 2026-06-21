"use client";

import { useMemo, useState } from "react";
import SelectField from "@/components/SelectField";
import SuggestBookDialog from "@/components/pages/SuggestBookDialog";
import type { DigitalBook } from "@/lib/api";

interface ReadPageProps {
  books: DigitalBook[];
  loadError: boolean;
}

export default function ReadPage({ books, loadError }: ReadPageProps) {
  const genres = useMemo(
    () => ["All", ...Array.from(new Set(books.map((b) => b.genre)))],
    [books],
  );
  const [activeGenre, setActiveGenre] = useState("All");
  const [search, setSearch] = useState("");
  const [suggestOpen, setSuggestOpen] = useState(false);

  const q = search.trim().toLowerCase();
  let shown = 0;

  return (
    <>
      <section className="section">
        <div className="container">
          {loadError && (
            <p className="muted load-error">
              Could not load the catalogue right now. Please try again later.
            </p>
          )}

          <div className="filter-bar reveal">
            <SelectField
              className="select-field--pill read-genre-filter"
              value={activeGenre}
              onChange={(e) => setActiveGenre(e.target.value)}
              aria-label="Filter by genre"
            >
              {genres.map((g) => (
                <option key={g} value={g}>
                  {g === "All" ? "All genres" : g}
                </option>
              ))}
            </SelectField>
            <input
              type="search"
              id="book-search"
              placeholder="Search title or author…"
              aria-label="Search books"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="grid grid-4" id="book-grid">
            {books.map((b) => {
              const matchGenre =
                activeGenre === "All" || b.genre === activeGenre;
              const matchText =
                !q || `${b.title} ${b.author}`.toLowerCase().includes(q);
              const show = matchGenre && matchText;
              if (show) shown++;
              return (
                <article
                  key={b._id}
                  className="card book reveal"
                  data-genre={b.genre}
                  data-text={`${b.title} ${b.author}`.toLowerCase()}
                  style={{ display: show ? "" : "none" }}
                >
                  <div className="book-cover">{b.coverEmoji}</div>
                  <span className="tag">{b.genre}</span>
                  <h3>{b.title}</h3>
                  <p className="muted author">{b.author}</p>
                  <div className="book-links">
                    <a
                      className="btn btn-primary full"
                      href={b.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Read now →
                    </a>
                    {b.pdfUrl && (
                      <a
                        className="btn btn-ghost full pdf-link"
                        href={b.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download PDF
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
          {shown === 0 && (
            <p className="muted empty" id="empty-state">
              No books match that search yet.
            </p>
          )}
        </div>
      </section>

      <section className="section divider-top contribute">
        <div className="container center narrow">
          <span className="eyebrow">Grow the shelf</span>
          <h2>Know a freely-licensed book we should add?</h2>
          <p className="lead" style={{ marginInline: "auto" }}>
            We curate public-domain and Creative Commons titles so everyone can
            read them, forever, for free. Suggest one and we&apos;ll review it
            for the room.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setSuggestOpen(true)}
          >
            Suggest a book
          </button>
        </div>
      </section>

      <SuggestBookDialog
        open={suggestOpen}
        onClose={() => setSuggestOpen(false)}
      />
    </>
  );
}
