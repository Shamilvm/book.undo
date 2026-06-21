"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import {
  adminLogout,
  syncAdminSession,
  type AdminSession,
} from "@/lib/admin-api";

const nav = [
  { href: "/admin", label: "Overview", id: "overview" },
  { href: "/admin/books", label: "Books", id: "books" },
  { href: "/admin/libraries", label: "Libraries", id: "libraries" },
  {
    href: "/admin/digital-books",
    label: "Digital Library",
    id: "digital-books",
  },
  { href: "/admin/borrows", label: "Borrow requests", id: "borrows" },
  {
    href: "/admin/textbook-exchange",
    label: "Textbook exchange",
    id: "textbook-exchange",
  },
  { href: "/admin/sponsorships", label: "School listings", id: "sponsorships" },
  {
    href: "/admin/sponsor-requests",
    label: "Sponsor requests",
    id: "sponsor-requests",
  },
  { href: "/admin/feedback", label: "Feedback", id: "feedback" },
  { href: "/admin/users", label: "Users", id: "users" },
];

function activeId(pathname: string) {
  if (pathname === "/admin" || pathname === "/admin/") return "overview";
  const match = nav.find(
    (item) => item.href !== "/admin" && pathname.startsWith(item.href),
  );
  return match?.id ?? "";
}

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";
  const [navOpen, setNavOpen] = useState(false);
  const [session, setSession] = useState<AdminSession | null>(null);
  const active = activeId(pathname);

  useEffect(() => {
    if (isLogin) return;
    let cancelled = false;
    syncAdminSession().then((data) => {
      if (cancelled) return;
      if (!data) router.replace("/admin/login");
      else setSession(data);
    });
    return () => {
      cancelled = true;
    };
  }, [isLogin, router]);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isLogin) return;
    document.body.classList.toggle("admin-nav-open", navOpen);
    return () => document.body.classList.remove("admin-nav-open");
  }, [isLogin, navOpen]);

  if (isLogin) {
    return <>{children}</>;
  }

  if (!session) {
    return (
      <div className="admin-body admin-body--loading" aria-busy="true">
        <p className="admin-loading">Loading admin panel…</p>
      </div>
    );
  }

  return (
    <div className={`admin-body${navOpen ? " is-nav-open" : ""}`}>
      <header className="admin-topbar">
        <button
          type="button"
          className="admin-menu-btn"
          aria-expanded={navOpen}
          aria-controls="admin-sidebar"
          onClick={() => setNavOpen((open) => !open)}
        >
          <span className="admin-menu-bars" aria-hidden="true">
            <i />
            <i />
          </span>
          <span className="admin-menu-label">{navOpen ? "Close" : "Menu"}</span>
        </button>
        <div className="admin-topbar-user">
          <AdminHeader session={session} compact />
        </div>
        <button
          type="button"
          className="admin-topbar-logout btn btn-ghost btn-sm"
          onClick={() => adminLogout()}
        >
          Sign out
        </button>
      </header>

      <button
        type="button"
        className="admin-sidebar-backdrop"
        aria-label="Close navigation"
        onClick={() => setNavOpen(false)}
      />

      <aside className="admin-sidebar" id="admin-sidebar">
        <Link href="/" className="admin-brand">
          📖 Book Undo
        </Link>
        <span className="admin-badge">Admin Panel</span>
        <nav className="admin-nav">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-link${active === item.id ? " active" : ""}`}
              onClick={() => setNavOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          className="admin-logout btn btn-ghost"
          onClick={() => adminLogout()}
        >
          Sign out
        </button>
      </aside>

      <main className="admin-main admin-page">
        <AdminHeader session={session} />
        {children}
      </main>
    </div>
  );
}
