import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import ExchangeForm from "@/components/pages/ExchangeForm";
import ExchangeListingGrid from "@/components/pages/ExchangeListingGrid";
import { fetchTextbookExchangeListings } from "@/lib/data";
import type { TextbookExchangeListing } from "@/lib/api";
import "@/styles/pages/exchange.css";
import "@/styles/pages/map.css";

export const metadata: Metadata = {
  title: "School textbook exchange — Book Undo",
  description:
    "List textbooks you want to give away or textbooks you need. Free, local, and open to everyone.",
};

const fallbackOffers: TextbookExchangeListing[] = [
  {
    _id: "demo-offer-1",
    listingType: "offer",
    textbookDetails: "Class 9 full set — NCERT, good condition",
    grade: "9",
    subject: "Full set",
    board: "CBSE",
    contactName: "Ananya",
    contactPhone: "9876543210",
    address: "Near Govt. High School, Main Road",
    location: "Thrissur",
    district: "Thrissur",
    status: "listed",
    coverEmoji: "📤",
  },
];

const fallbackNeeds: TextbookExchangeListing[] = [
  {
    _id: "demo-need-1",
    listingType: "need",
    textbookDetails: "Class 10 Maths — NCERT",
    grade: "10",
    subject: "Maths",
    board: "State board",
    contactName: "Rahul",
    contactPhone: "9123456780",
    address: "Puthur junction, 680001",
    location: "Thrissur",
    district: "Thrissur",
    status: "listed",
    coverEmoji: "📥",
  },
];

export default async function ExchangeRoute() {
  let offers: TextbookExchangeListing[] = fallbackOffers;
  let needs: TextbookExchangeListing[] = fallbackNeeds;

  try {
    const [offerRows, needRows] = await Promise.all([
      fetchTextbookExchangeListings({ listingType: "offer", limit: 20 }),
      fetchTextbookExchangeListings({ listingType: "need", limit: 20 }),
    ]);
    offers = JSON.parse(JSON.stringify(offerRows)) as TextbookExchangeListing[];
    needs = JSON.parse(JSON.stringify(needRows)) as TextbookExchangeListing[];
  } catch {
    /* API unavailable */
  }

  return (
    <>
      <PageHero
        num="03"
        emoji="🔁"
        eyebrow="Textbook exchange"
        title="Give a textbook, find a textbook"
        lead="List textbooks you no longer need, or post what you're looking for. All listings are public with contact details so students can connect directly — free and local."
      />

      <section className="section">
        <div className="container split">
          <div className="reveal">
            <span className="eyebrow">How it works</span>
            <h2>Two lists, one community board</h2>
            <p className="muted">
              Finished a grade? List your textbooks for someone who needs them.
              Starting a new class? Post what you&apos;re looking for. Everyone
              sees name, phone, and address — no middleman, no fees.
            </p>
            <div className="grid grid-2 stat-mini">
              <div>
                <span className="big">Free</span>
                <p className="muted">always</p>
              </div>
              <div>
                <span className="big">2 lists</span>
                <p className="muted">give &amp; need</p>
              </div>
              <div>
                <span className="big">Public</span>
                <p className="muted">contact details</p>
              </div>
              <div>
                <span className="big">1 min</span>
                <p className="muted">to post</p>
              </div>
            </div>
          </div>

          <ExchangeForm />
        </div>
      </section>

      <section className="section divider-top">
        <div className="container">
          <div className="section-head section-head--wide">
            <span className="eyebrow">Available to give</span>
            <h2>Textbooks people are offering</h2>
          </div>
          <ExchangeListingGrid
            listings={offers}
            emptyMessage="No textbooks listed yet. Be the first to post one you want to give away."
          />
        </div>
      </section>

      <section className="section divider-top">
        <div className="container">
          <div className="section-head section-head--wide">
            <span className="eyebrow">Looking for books</span>
            <h2>Students who need textbooks</h2>
          </div>
          <ExchangeListingGrid
            listings={needs}
            emptyMessage="No requests yet. Post here if you're looking for a textbook."
          />
        </div>
      </section>
    </>
  );
}
