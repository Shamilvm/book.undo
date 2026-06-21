"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { type AdminStats, getAdminStats } from "@/lib/admin-api";

const queueItems = [
  {
    key: "pendingBooks" as const,
    href: "/admin/books?filter=pending",
    label: "Books",
    desc: "Donated listings awaiting approval",
    tone: "amber",
  },
  {
    key: "pendingLibraries" as const,
    href: "/admin/libraries?filter=pending",
    label: "Libraries",
    desc: "Registrations and map reports awaiting approval",
    tone: "green",
  },
  {
    key: "pendingDigitalBooks" as const,
    href: "/admin/digital-books?filter=pending",
    label: "Digital Library",
    desc: "Virtual library submissions",
    tone: "blue",
  },
  {
    key: "pendingBorrows" as const,
    href: "/admin/borrows?filter=pending",
    label: "Borrow requests",
    desc: "Pending borrow approvals",
    tone: "violet",
  },
  {
    key: "pendingSponsorRequests" as const,
    href: "/admin/sponsor-requests?filter=pending",
    label: "Sponsor requests",
    desc: "Offers to sponsor schools awaiting approval",
    tone: "green",
  },
  {
    key: "newFeedback" as const,
    href: "/admin/feedback?filter=new",
    label: "Feedback",
    desc: "New suggestions and reports",
    tone: "rose",
  },
];

const platformMetrics = [
  { key: "totalBooks" as const, href: "/admin/books", label: "Physical books" },
  {
    key: "totalLibraries" as const,
    href: "/admin/libraries",
    label: "Libraries",
  },
  {
    key: "totalDigitalBooks" as const,
    href: "/admin/digital-books",
    label: "Digital titles",
  },
  { key: "totalFeedback" as const, href: "/admin/feedback", label: "Feedback" },
];

function formatToday() {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function MetricSkeleton() {
  return (
    <div className="dash-stat">
      <div className="dash-skeleton dash-skeleton-label" />
      <div className="dash-skeleton dash-skeleton-num" />
    </div>
  );
}

function QueueSkeleton() {
  return (
    <div className="dash-card dash-card--loading">
      <div className="dash-skeleton dash-skeleton-title" />
      <div className="dash-skeleton dash-skeleton-label" />
      <div className="dash-skeleton dash-skeleton-badge" />
    </div>
  );
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAdminStats()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load stats");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loading = !stats && !error;
  const totalPending = stats?.totalPending ?? 0;
  const firstPendingHref =
    queueItems.find((item) => (stats?.[item.key] ?? 0) > 0)?.href ??
    "/admin/books?filter=pending";

  return (
    <div className="dash">
      <header className="dash-top">
        <div>
          <h1>Dashboard</h1>
          <p className="dash-lead">
            Monitor platform activity and clear the review queue.
          </p>
        </div>
        <time className="dash-date" dateTime={new Date().toISOString()}>
          {formatToday()}
        </time>
      </header>

      {error && (
        <div className="dash-error" role="alert">
          {error}
        </div>
      )}

      <section className="dash-hero" aria-label="Review summary">
        <div
          className={`dash-hero-panel${totalPending > 0 ? " is-active" : " is-clear"}`}
        >
          <p className="dash-hero-kicker">Review queue</p>
          {loading ? (
            <>
              <div className="dash-skeleton dash-skeleton-hero" />
              <div className="dash-skeleton dash-skeleton-copy" />
            </>
          ) : (
            <>
              <div className="dash-hero-value">
                <span className="dash-hero-num">{totalPending}</span>
                <span className="dash-hero-unit">
                  {totalPending === 1 ? "item pending" : "items pending"}
                </span>
              </div>
              <p className="dash-hero-copy">
                {totalPending > 0
                  ? "Submissions are waiting for your decision."
                  : "You're all caught up. No submissions need review right now."}
              </p>
              {totalPending > 0 && (
                <Link
                  href={firstPendingHref}
                  className="btn btn-primary btn-sm"
                >
                  Start reviewing
                </Link>
              )}
            </>
          )}
        </div>

        <div className="dash-stat-grid">
          {loading
            ? platformMetrics.map((metric) => (
                <MetricSkeleton key={metric.key} />
              ))
            : platformMetrics.map((metric) => (
                <Link
                  key={metric.key}
                  href={metric.href}
                  className="dash-stat dash-stat--link"
                >
                  <span className="dash-stat-label">{metric.label}</span>
                  <span className="dash-stat-num">
                    {stats?.[metric.key] ?? 0}
                  </span>
                </Link>
              ))}
        </div>
      </section>

      <section className="dash-section" aria-labelledby="dash-queue-heading">
        <div className="dash-section-head">
          <h2 id="dash-queue-heading">Needs attention</h2>
          <p>Open each section to approve, reject, or manage submissions.</p>
        </div>

        <div className="dash-card-grid">
          {loading
            ? queueItems.map((item) => <QueueSkeleton key={item.key} />)
            : queueItems.map((item) => {
                const count = stats?.[item.key] ?? 0;
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={`dash-card dash-card--${item.tone}${count > 0 ? " is-pending" : ""}`}
                  >
                    <div className="dash-card-top">
                      <span className="dash-card-label">{item.label}</span>
                      <span
                        className={`dash-card-badge${count > 0 ? " is-hot" : ""}`}
                      >
                        {count}
                      </span>
                    </div>
                    <p className="dash-card-desc">{item.desc}</p>
                    <span className="dash-card-action">
                      {count > 0 ? "Review" : "View all"}
                      <span aria-hidden="true">→</span>
                    </span>
                  </Link>
                );
              })}
        </div>
      </section>
    </div>
  );
}
