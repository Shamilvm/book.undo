import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import FeedbackForm from "@/components/pages/FeedbackForm";
import "@/styles/pages/feedback.css";

export const metadata: Metadata = {
  title: "Feedback — Book Undo",
  description:
    "Share suggestions, ask questions, or report issues. We'd love to hear from you.",
};

const topics = [
  {
    icon: "💡",
    title: "Suggestions",
    desc: "Ideas to improve Book Undo — new features, better flows, or community ideas.",
  },
  {
    icon: "❓",
    title: "Questions",
    desc: "Anything unclear about donating, borrowing, libraries, or how the network works.",
  },
  {
    icon: "🐛",
    title: "Report an issue",
    desc: "Spotted a bug, broken link, or something not working as expected?",
  },
];

export default function FeedbackRoute() {
  return (
    <>
      <PageHero
        num="08"
        emoji="💬"
        eyebrow="Feedback"
        title="Tell us what's on your mind"
        lead="Your ideas and questions help us build a better book-sharing network for Kerala and beyond."
      />

      <section className="section">
        <div className="container split">
          <div className="reveal">
            <span className="eyebrow">How we use your message</span>
            <h2>Every note reaches our team</h2>
            <p className="muted">
              We read every submission. For questions we&apos;ll get back to you using
              the contact details you provide. Suggestions help shape what we build
              next.
            </p>
            <div className="topic-list">
              {topics.map((t) => (
                <div key={t.title} className="topic">
                  <span className="topic-icon">{t.icon}</span>
                  <div>
                    <h3>{t.title}</h3>
                    <p className="muted">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <FeedbackForm />
        </div>
      </section>
    </>
  );
}
