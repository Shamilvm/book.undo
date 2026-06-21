import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import RequestStatusPage from "@/components/pages/RequestStatusPage";
import "@/styles/pages/manage.css";

export const metadata: Metadata = {
  title: "Borrow request status — Book Undo",
  robots: { index: false, follow: false },
};

export default async function RequestRoute({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <>
      <PageHero
        num="—"
        emoji="📬"
        eyebrow="Your request"
        title="Borrow request status"
        lead="Track whether the donor has approved your request and get pickup details."
      />
      <section className="section">
        <div className="container narrow">
          <RequestStatusPage token={token} />
        </div>
      </section>
    </>
  );
}
