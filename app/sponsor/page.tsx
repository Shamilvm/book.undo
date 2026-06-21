import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import SponsorPage from "@/components/pages/SponsorPage";
import { fetchSponsorships } from "@/lib/data";
import type { Sponsorship } from "@/lib/api";
import "@/styles/pages/sponsor.css";

export const metadata: Metadata = {
  title: "Schools & colleges — Book Undo",
  description:
    "Schools and colleges with empty shelves can list themselves here. Find institutions that need books in your area.",
};

const fallbackSchools: Sponsorship[] = [
  {
    _id: "demo-1",
    schoolName: "Govt. Primary, Lalpur",
    district: "Rajasthan",
    description: "Picture & early-reader books",
    booksNeeded: 100,
    booksFunded: 0,
    coverEmoji: "🏫",
    subjects: ["English", "Hindi"],
    gradeRange: "1–3",
    status: "open",
    approvalStatus: "approved",
  },
];

export default async function SponsorRoute() {
  let schools: Sponsorship[] = fallbackSchools;
  try {
    const all = await fetchSponsorships();
    schools = JSON.parse(JSON.stringify(all)) as Sponsorship[];
  } catch {
    /* API unavailable */
  }

  return (
    <>
      <PageHero
        num="04"
        emoji="🌾"
        eyebrow="Schools & colleges"
        title="Connect schools that need books"
        lead="Schools and colleges with empty shelves can list themselves here. Browse institutions looking for books, or add your own — we review every listing before it goes live."
      />
      <SponsorPage schools={schools} />
    </>
  );
}
