import Link from "next/link";

const cols = [
  {
    title: "Circulate",
    links: [
      { href: "/donate", label: "Donate books" },
      { href: "/borrow", label: "Borrow locally" },
      { href: "/exchange", label: "Textbook exchange" },
    ],
  },
  {
    title: "Build",
    links: [
      { href: "/sponsor", label: "Sponsor a school" },
      { href: "/map", label: "Library map" },
    ],
  },
  {
    title: "Read",
    links: [
      { href: "/read", label: "Virtual library" },
      { href: "/#how", label: "How it works" },
      { href: "/#impact", label: "Our impact" },
      { href: "/feedback", label: "Feedback" },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="foot-top">
          <div className="foot-lead">
            <span className="eyebrow" style={{ color: "var(--paper)" }}>
              Join the network
            </span>
            <h2>
              Pass it
              <br />
              <span className="display-italic">forward.</span>
            </h2>
          </div>
          <div className="foot-cols">
            {cols.map((c) => (
              <div className="foot-col" key={c.title}>
                <h4>{c.title}</h4>
                <ul>
                  {c.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href}>{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="wordmark" aria-hidden="true">
        Book Undo
      </div>
      <div className="container foot-bottom">
        <span>© {year} Book Undo | All rights reserved</span>
        <span className="display-italic">Every book deserves another reader.</span>
        <span className="foot-credit">
          Made with ❤️ by{" "}
          <a
            className="foot-link"
            href="https://shamilvm.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Shamil Vm
          </a>
          <span className="foot-credit-sep" aria-hidden="true">
            |
          </span>
          <a
            className="foot-link"
            href="https://www.buymeacoffee.com/shamilvm"
            target="_blank"
            rel="noopener noreferrer"
          >
            ☕️ Buy me a coffee
          </a>
        </span>
      </div>
    </footer>
  );
}
