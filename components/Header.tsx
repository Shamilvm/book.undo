"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect } from "react";

const links = [
  { href: "/", label: "Home", num: "01" },
  { href: "/donate", label: "Donate", num: "02" },
  { href: "/borrow", label: "Borrow", num: "03" },
  { href: "/exchange", label: "Textbook Exchange", num: "04" },
  { href: "/sponsor", label: "Sponsor", num: "05" },
  { href: "/read", label: "Virtual Library", num: "06" },
  { href: "/map", label: "Map", num: "07" },
  { href: "/feedback", label: "Feedback", num: "08" },
];

function isActive(pathname: string, href: string) {
  return href === "/"
    ? pathname === "/" || pathname === ""
    : pathname === href || pathname === href + "/";
}

export default function Header() {
  const pathname = usePathname();

  const setOpen = useCallback((open: boolean) => {
    const root = document.querySelector<HTMLElement>(".nav-root");
    if (!root) return;
    const btn = root.querySelector<HTMLButtonElement>(".menu-btn");
    const label = root.querySelector<HTMLElement>(".menu-label");
    const overlay = root.querySelector<HTMLElement>(".overlay");
    if (!btn || !overlay) return;

    root.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    overlay.setAttribute("aria-hidden", String(!open));
    if (label) label.textContent = open ? "Close" : "Menu";
    document.body.style.overflow = open ? "hidden" : "";
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const root = document.querySelector<HTMLElement>(".nav-root");
      if (e.key === "Escape" && root?.classList.contains("open")) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [setOpen]);

  return (
    <div className="nav-root">
      <header className="site-header">
        <div className="container header-inner">
          <Link href="/" className="brand" aria-label="BookUndo home">
            <span className="brand-name">Book Undo</span>
          </Link>
          <button
            className="menu-btn"
            type="button"
            aria-label="Open menu"
            aria-expanded="false"
            aria-controls="site-overlay"
            onClick={() => {
              const root = document.querySelector<HTMLElement>(".nav-root");
              setOpen(!root?.classList.contains("open"));
            }}
          >
            <span className="menu-label">Menu</span>
            <span className="menu-bars">
              <i></i>
              <i></i>
            </span>
          </button>
        </div>
      </header>

      <div className="overlay" id="site-overlay" aria-hidden="true">
        <div className="overlay-bg" aria-hidden="true">
          <span className="overlay-watermark">Menu</span>
          <span className="overlay-ring"></span>
        </div>
        <div className="overlay-shell">
          <div className="container overlay-inner">
            <div className="overlay-head">
              <p className="overlay-eyebrow">Navigate</p>
              <p className="overlay-count" aria-label={`${links.length} destinations`}>
                <span className="overlay-count-num">
                  {String(links.length).padStart(2, "0")}
                </span>
                <span className="overlay-count-label">destinations</span>
              </p>
            </div>
            <nav className="overlay-nav" aria-label="Primary">
              <div className="overlay-list">
                {links.map((l, i) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`overlay-link${isActive(pathname, l.href) ? " active" : ""}`}
                    style={{ "--i": i } as React.CSSProperties}
                    onClick={() => setOpen(false)}
                  >
                    <span className="o-num">{l.num}</span>
                    <span className="o-label">{l.label}</span>
                    <span className="o-arrow" aria-hidden="true">
                      ↗
                    </span>
                  </Link>
                ))}
              </div>
            </nav>
            <div className="overlay-foot">
              <div className="overlay-quote">
                <p className="display-italic">&ldquo;Every book deserves another reader.&rdquo;</p>
                <span className="overlay-tag">BookUndo · Community network</span>
              </div>
              <Link href="/donate" className="btn btn-accent overlay-cta" onClick={() => setOpen(false)}>
                Give a book
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
