import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import ManageBookPage from "@/components/pages/ManageBookPage";
import "@/styles/pages/manage.css";

export const metadata: Metadata = {
  title: "Manage your listing — Book Undo",
  robots: { index: false, follow: false },
};

export default async function ManageRoute({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <>
      <PageHero
        num="—"
        emoji="📋"
        eyebrow="Your listing"
        title="Manage borrow requests"
        lead="Approve or decline requests, and mark the book as returned when you're done."
      />
      <section className="section">
        <div className="container narrow">
          <ManageBookPage token={token} />
        </div>
      </section>
    </>
  );
}
