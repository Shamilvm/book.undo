import Link from "next/link";
import type { Metadata } from "next";
import { fetchStats } from "@/lib/data";
import "@/styles/pages/index.css";

export const metadata: Metadata = {
  title: "Book Undo",
  description:
    "Book Undo is a community book circulation and donation network. Donate, borrow, and share books, and sponsor textbooks for schools.",
};

const fallbackStats = [
  { count: "12400", suffix: "+", label: "Books in circulation" },
  { count: "320", suffix: "", label: "Libraries on the map" },
  { count: "85", suffix: "", label: "schools sponsored" },
  { count: "9.6", suffix: "t", label: "Paper waste avoided" },
];

const featureGroups = [
  {
    label: "Pass it on",
    items: [
      {
        num: "01",
        icon: "🎁",
        title: "Donate books",
        desc: "List the books gathering dust. A neighbour or classroom gives them a second life.",
        href: "/donate",
      },
      {
        num: "02",
        icon: "🤝",
        title: "Borrow locally",
        desc: "Find books shared near you. Borrow, read, return — or pass it forward.",
        href: "/borrow",
      },
      {
        num: "03",
        icon: "🔁",
        title: "Textbook exchange",
        desc: "List textbooks to give or textbooks you need.",
        href: "/exchange",
      },
    ],
  },
  {
    label: "Fund access",
    featured: {
      num: "04",
      icon: "🌾",
      title: "Sponsor schools",
      desc: "Fund a box of books for a school with none — and track exactly where it lands.",
      href: "/sponsor",
    },
  },
  {
    label: "Read & discover",
    items: [
      {
        num: "05",
        icon: "💻",
        title: "Virtual library",
        desc: "Read public-domain books in your browser. No card required.",
        href: "/read",
      },
      {
        num: "06",
        icon: "🗺️",
        title: "Library map",
        desc: "Discover libraries around you.",
        href: "/map",
      },
    ],
  },
] as const;

const steps = [
  {
    n: "01",
    title: "List or find a book",
    desc: "Add a book you're done with, or search for one you want to read near you.",
    icon: "✍️",
  },
  {
    n: "02",
    title: "Connect & hand over",
    desc: "Arrange a local pickup nearby. A book changes hands.",
    icon: "🤝",
  },
  {
    n: "03",
    title: "Pass it forward",
    desc: "Finished reading? Return it or share it with a stranger. The story keeps moving.",
    icon: "🔄",
  },
];

const readingQuotes = [
  {
    text: "A reader lives a thousand lives before he dies.",
    author: "George R.R. Martin",
  },
  {
    text: "The more that you read, the more things you will know.",
    author: "Dr. Seuss",
  },
  { text: "Books are a uniquely portable magic.", author: "Stephen King" },
  {
    text: "Reading is to the mind what exercise is to the body.",
    author: "Joseph Addison",
  },
  {
    text: "A book is a dream that you hold in your hand.",
    author: "Neil Gaiman",
  },
  {
    text: "There is no friend as loyal as a book.",
    author: "Ernest Hemingway",
  },
  {
    text: "Once you learn to read, you will be forever free.",
    author: "Frederick Douglass",
  },
  { text: "Not all those who wander are lost.", author: "J.R.R. Tolkien" },
];

const marqueeQuotes = [...readingQuotes, ...readingQuotes];

export default async function HomePage() {
  let stats = fallbackStats;
  try {
    stats = await fetchStats();
  } catch {
    /* API unavailable — use fallback */
  }

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span
              className="eyebrow reveal"
              style={{ "--d": "0ms" } as React.CSSProperties}
            >
              Community book network
            </span>

            <h1 className="hero-title">
              <span className="line reveal-mask">Every book</span>
              <span
                className="line reveal-mask"
                style={{ "--d": "80ms" } as React.CSSProperties}
              >
                deserves
              </span>
              <span
                className="line reveal-mask accent-line"
                style={{ "--d": "160ms" } as React.CSSProperties}
              >
                another <span className="display-italic">reader.</span>
              </span>
            </h1>

            <p
              className="lead hero-lead reveal"
              style={{ "--d": "240ms" } as React.CSSProperties}
            >
              Book Undo connects the books you&apos;ve finished with the people
              who need them next — donate, borrow, swap textbooks, and open
              reading to rural classrooms, all in one circulating network.
            </p>

            <div
              className="hero-actions reveal"
              style={{ "--d": "320ms" } as React.CSSProperties}
            >
              <Link href="/donate" className="btn" data-magnetic>
                Donate a book
              </Link>
              <Link href="/borrow" className="btn btn-ghost" data-magnetic>
                Borrow nearby
              </Link>
            </div>

            <nav
              className="hero-paths reveal"
              style={{ "--d": "400ms" } as React.CSSProperties}
              aria-label="Quick paths"
            >
              <Link href="/donate" className="hero-path">
                <span>01</span> Donate
              </Link>
              <Link href="/borrow" className="hero-path">
                <span>02</span> Borrow
              </Link>
              <Link href="/exchange" className="hero-path">
                <span>03</span> Swap
              </Link>
              <Link href="/sponsor" className="hero-path">
                <span>04</span> Sponsor
              </Link>
              <Link href="/read" className="hero-path">
                <span>05</span> Read
              </Link>
            </nav>
          </div>

          <div
            className="hero-visual reveal"
            style={{ "--d": "180ms" } as React.CSSProperties}
          >
            <div className="hero-stack">
              <article className="stack-book stack-book--back">
                <span className="stack-spine"></span>
                <div className="stack-face">
                  <span className="stack-genre">Fiction</span>
                  <strong>The Namesake</strong>
                  <span className="stack-author">Jhumpa Lahiri</span>
                </div>
              </article>
              <article className="stack-book stack-book--mid">
                <span className="stack-spine"></span>
                <div className="stack-face">
                  <span className="stack-genre">Textbook</span>
                  <strong>Physics Vol. II</strong>
                  <span className="stack-author">NCERT · 2024</span>
                </div>
              </article>
              <article className="stack-book stack-book--front">
                <span className="stack-spine stack-spine--accent"></span>
                <div className="stack-face">
                  <span className="stack-genre">Community</span>
                  <strong>Your next read</strong>
                  <span className="stack-author">Waiting nearby</span>
                </div>
              </article>
            </div>
          </div>
        </div>

        <div className="hero-rule" aria-hidden="true"></div>
      </section>

      <div className="marquee" aria-label="Reading quotes">
        <div className="marquee__track">
          {marqueeQuotes.map((q, i) => (
            <span key={i} className="marquee-quote">
              &ldquo;{q.text}&rdquo;
              <span className="marquee-author">— {q.author}</span>
              <span className="dot">✦</span>
            </span>
          ))}
        </div>
      </div>

      <section className="section features" id="features">
        <div className="container features-board">
          <header className="features-aside reveal">
            <span className="eyebrow">What you can do</span>
            <h2>
              One network,
              <br />
              <span className="display-italic">six ways</span>
              <br />
              to share a book.
            </h2>
            <p className="lead">
              Whether you have one book or a hundred, there&apos;s a way to keep
              it moving — and someone nearby who&apos;ll be glad you did.
            </p>
          </header>

          <div className="features-tracks">
            {featureGroups.map((group) => (
              <div key={group.label} className="features-track reveal">
                <span className="track-label">{group.label}</span>

                {"featured" in group && group.featured ? (
                  <Link
                    href={group.featured.href}
                    className="track-card track-card--featured"
                    data-magnetic
                  >
                    <span className="tc-num">{group.featured.num}</span>
                    <span className="tc-icon" aria-hidden="true">
                      {group.featured.icon}
                    </span>
                    <div className="tc-body">
                      <h3>{group.featured.title}</h3>
                      <p>{group.featured.desc}</p>
                    </div>
                    <span className="tc-go">Sponsor a school →</span>
                  </Link>
                ) : "items" in group ? (
                  <div className="track-grid">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="track-card"
                        data-magnetic
                      >
                        <div className="tc-top">
                          <span className="tc-icon" aria-hidden="true">
                            {item.icon}
                          </span>
                          <span className="tc-num">{item.num}</span>
                        </div>
                        <h3>{item.title}</h3>
                        <p className="muted">{item.desc}</p>
                        <span className="tc-go">Explore →</span>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section how" id="how">
        <div className="container how-grid">
          <div className="how-sticky">
            <span className="eyebrow">How it works</span>
            <h2>A book changes hands in three steps.</h2>
            <p className="lead">
              No fees. No waste. Just books finding their next reader.
            </p>
          </div>
          <div className="how-steps">
            {steps.map((s) => (
              <div key={s.n} className="how-step reveal">
                <span className="hs-num">{s.n}</span>
                <div>
                  <h3>
                    {s.icon}&nbsp; {s.title}
                  </h3>
                  <p className="muted">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="container grid grid-4">
          {stats.map((s) => (
            <div key={s.label} className="stat reveal">
              <div className="stat-value">
                <span data-count={s.count} data-suffix={s.suffix}>
                  0{s.suffix}
                </span>
              </div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section impact" id="impact">
        <div className="container impact-grid">
          <div className="reveal">
            <span className="eyebrow">Our impact</span>
            <h2>
              More access.
              <br />
              <span className="display-italic">Less waste.</span>
            </h2>
            <p className="lead">
              A book read once and shelved forever is a resource sitting idle.
              Book Undo turns private shelves into a shared, circulating library
              — reachable for everyone, and out of the bin.
            </p>
            <Link href="/sponsor" className="btn" data-magnetic>
              Sponsor a classroom
            </Link>
          </div>
          <ul className="impact-list reveal">
            <li>
              <span>📚</span> Make textbooks and reading affordable for every
              learner.
            </li>
            <li>
              <span>♻️</span> Cut paper waste by giving each book many readers.
            </li>
            <li>
              <span>🌍</span> Reach schools with little or no library access.
            </li>
            <li>
              <span>💛</span> Hand a finished book to a complete stranger.
            </li>
          </ul>
        </div>
      </section>

      <section className="quote-band">
        <div className="container">
          <blockquote className="reveal-mask">
            Every book
            <br />
            deserves{" "}
            <span className="display-italic accent">another reader.</span>
          </blockquote>
        </div>
      </section>

      <section className="section cta">
        <div className="container">
          <div className="cta-card">
            <div>
              <span className="eyebrow" style={{ color: "var(--paper)" }}>
                Your move
              </span>
              <h2>Got a shelf full of finished books?</h2>
            </div>
            <div className="cta-actions">
              <Link href="/donate" className="btn btn-accent" data-magnetic>
                Donate a book
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
