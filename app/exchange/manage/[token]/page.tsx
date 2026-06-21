import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import ExchangeManagePage from "@/components/pages/ExchangeManagePage";
import "@/styles/pages/manage.css";

export const metadata: Metadata = {
  title: "Manage textbook listing — Book Undo",
  robots: { index: false, follow: false },
};

export default async function ExchangeManageRoute({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <>
      <PageHero
        num="—"
        emoji="🔁"
        eyebrow="Your listing"
        title="Manage textbook exchange"
        lead="Remove your listing when you've found a match or no longer need it."
      />
      <section className="section">
        <div className="container narrow">
          <ExchangeManagePage token={token} />
        </div>
      </section>
    </>
  );
}
