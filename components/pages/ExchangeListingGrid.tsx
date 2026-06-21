import type { TextbookExchangeListing } from "@/lib/api";

function ExchangeListingCard({ item }: { item: TextbookExchangeListing }) {
  const isOffer = item.listingType === "offer";

  return (
    <article
      className={`card exchange-card reveal exchange-card--${isOffer ? "offer" : "need"}`}
    >
      <div className="exchange-lead">
        <span className="exchange-emoji-chip" aria-hidden="true">
          {item.coverEmoji}
        </span>
        <div className="exchange-card-copy">
          <h3 className="exchange-title">{item.textbookDetails}</h3>
          {(item.grade || item.subject || item.board) && (
            <div className="exchange-chips">
              {item.grade && (
                <span className="exchange-chip">Class {item.grade}</span>
              )}
              {item.subject && (
                <span className="exchange-chip">{item.subject}</span>
              )}
              {item.board && <span className="exchange-chip">{item.board}</span>}
            </div>
          )}
        </div>
      </div>

      <p className="exchange-location">
        <span aria-hidden="true">📍</span>
        {item.location}, {item.district}
      </p>

      <footer className="exchange-foot">
        <div className="exchange-foot-row">
          <span className="exchange-name">{item.contactName}</span>
          <a className="exchange-phone" href={`tel:${item.contactPhone}`}>
            {item.contactPhone}
          </a>
        </div>
        <p className="exchange-address">{item.address}</p>
      </footer>
    </article>
  );
}

export default function ExchangeListingGrid({
  listings,
  emptyMessage,
}: {
  listings: TextbookExchangeListing[];
  emptyMessage: string;
}) {
  if (listings.length === 0) {
    return <p className="muted exchange-empty">{emptyMessage}</p>;
  }

  return (
    <div className="grid grid-2 exchange-list">
      {listings.map((item) => (
        <ExchangeListingCard key={item._id} item={item} />
      ))}
    </div>
  );
}
