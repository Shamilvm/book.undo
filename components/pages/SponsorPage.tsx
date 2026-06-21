"use client";

import { useState } from "react";
import ListSchoolDialog from "@/components/pages/ListSchoolDialog";
import SponsorSchoolDialog from "@/components/pages/SponsorSchoolDialog";
import type { Sponsorship } from "@/lib/api";
import { sponsorshipProgressPct } from "@/lib/parse-books";

interface SponsorPageProps {
  schools: Sponsorship[];
}

export default function SponsorPage({ schools }: SponsorPageProps) {
  const [listOpen, setListOpen] = useState(false);
  const [sponsorSchool, setSponsorSchool] = useState<Sponsorship | null>(null);

  return (
    <>
      <section className="section">
        <div className="container">
          <div className="section-head section-head--wide">
            <span className="eyebrow">Schools & colleges</span>
            <h2>Institutions looking for books</h2>
          </div>
          {schools.length > 0 ? (
            <div className="grid grid-3">
              {schools.map((s) => {
                const booksFunded = s.booksFunded ?? 0;
                const booksNeeded = s.booksNeeded ?? 0;
                const pct = sponsorshipProgressPct(booksFunded, booksNeeded);

                return (
                <article
                  key={s._id}
                  className="card school reveal school-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => setSponsorSchool(s)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSponsorSchool(s);
                    }
                  }}
                >
                  <div className="school-emoji">{s.coverEmoji}</div>
                  <h3>{s.schoolName}</h3>
                  <p className="muted">📍 {s.district}</p>
                  {s.gradeRange && (
                    <p className="muted small">Grades {s.gradeRange}</p>
                  )}
                  <p className="need">
                    Needs: <strong>{s.description}</strong>
                  </p>
                  {s.subjects.length > 0 && (
                    <p className="muted small">
                      Subjects: {s.subjects.join(", ")}
                    </p>
                  )}
                  {booksNeeded > 0 && (
                    <>
                      <p className="muted small">~{booksNeeded} books needed</p>
                      <div className="bar">
                        <span style={{ width: `${pct}%` }} />
                      </div>
                      <p className="muted small">
                        {booksFunded} of {booksNeeded} books · {pct}% sponsored
                      </p>
                    </>
                  )}
                  <span className="school-card-cta">
                    Sponsor books or money →
                  </span>
                </article>
                );
              })}
            </div>
          ) : (
            <p className="muted center">
              No schools listed yet. Be the first to add yours.
            </p>
          )}
        </div>
      </section>

      <section className="section divider-top list-school">
        <div className="container center sponsor-narrow">
          <span className="eyebrow">Add your institution</span>
          <h2>Does your school or college need books?</h2>
          <p className="lead" style={{ marginInline: "auto" }}>
            List your school or college here so donors and volunteers can find
            you. We review every submission before it goes live.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setListOpen(true)}
          >
            List your school
          </button>
        </div>
      </section>

      <ListSchoolDialog open={listOpen} onClose={() => setListOpen(false)} />

      <SponsorSchoolDialog
        school={sponsorSchool}
        open={sponsorSchool !== null}
        onClose={() => setSponsorSchool(null)}
      />
    </>
  );
}
