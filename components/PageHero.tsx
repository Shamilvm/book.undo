interface PageHeroProps {
  eyebrow?: string;
  title: string;
  lead?: string;
  emoji?: string;
  num?: string;
}

export default function PageHero({
  eyebrow,
  title,
  lead,
  emoji,
  num,
}: PageHeroProps) {
  return (
    <section className="page-hero">
      <div className="container">
        <div className="ph-top">
          {num && <span className="ph-num">{num}</span>}
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        </div>
        <h1 className="reveal-mask">
          {title} {emoji && <span className="ph-emoji">{emoji}</span>}
        </h1>
        {lead && (
          <p className="lead reveal" style={{ "--d": "120ms" } as React.CSSProperties}>
            {lead}
          </p>
        )}
      </div>
      <div className="ph-rule"></div>
    </section>
  );
}
