import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import DonateForm from "@/components/pages/DonateForm";
import "@/styles/pages/donate.css";
import "@/styles/pages/map.css";

export const metadata: Metadata = {
  title: "Donate books — Book Undo",
  description:
    "Donate the books you've finished reading. Give them to a neighbour, a student, or a rural classroom.",
};

const accepted = [
  "Fiction & non-fiction",
  "Children's & picture books",
  "School & college textbooks",
  "Reference & exam prep",
  "Comics & graphic novels",
  "Regional-language titles",
];

export default function DonatePage() {
  return (
    <>
      <PageHero
        num="01"
        emoji="🎁"
        eyebrow="Donate books"
        title="Give your finished books a second life"
        lead="That novel you'll never reread? The textbook from last term? Someone nearby is looking for exactly that."
      />

      <section className="section">
        <div className="container split">
          <div className="reveal">
            <span className="eyebrow">What we welcome</span>
            <h2>Almost every book finds a reader</h2>
            <p className="muted">
              As long as it&apos;s readable and complete, we&apos;ll help it travel. Worn
              covers and pencil notes are part of the charm.
            </p>
            <ul className="check">
              {accepted.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>

          <DonateForm />
        </div>
      </section>
    </>
  );
}
