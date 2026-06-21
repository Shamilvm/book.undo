import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import ReadPage from "@/components/pages/ReadPage";
import { fetchDigitalBooks } from "@/lib/data";
import type { DigitalBook } from "@/lib/api";
import "@/styles/pages/read.css";

export const metadata: Metadata = {
  title: "Virtual library — Book Undo",
  description:
    "Read openly-licensed and public-domain books right in your browser. No card, no cost.",
};

export default async function ReadRoute() {
  let books: DigitalBook[] = [];
  let loadError = false;

  try {
    const raw = await fetchDigitalBooks();
    books = JSON.parse(JSON.stringify(raw)) as DigitalBook[];
  } catch {
    loadError = true;
  }

  return (
    <>
      <PageHero
        num="05"
        emoji="💻"
        eyebrow="Virtual library"
        title="A reading room that never closes"
        lead="Hundreds of openly-licensed and public-domain books, free to read in your browser. Perfect for students and anyone between physical books."
      />
      <ReadPage books={books} loadError={loadError} />
    </>
  );
}
