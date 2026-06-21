import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import BorrowPage from "@/components/pages/BorrowPage";
import { fetchBooks } from "@/lib/data";
import type { Book } from "@/lib/api";
import "@/styles/pages/borrow.css";
import "@/styles/pages/map.css";

export const metadata: Metadata = {
  title: "Borrow locally — Book Undo",
  description:
    "Borrow books shared by people near you. Read, return, or pass it forward to the next reader.",
};

const fallbackListings: Book[] = [
  {
    _id: "demo-1",
    title: "Sapiens",
    author: "Yuval Noah Harari",
    location: "Nearby",
    condition: "good",
    category: "non-fiction",
    coverEmoji: "📘",
    district: "",
    status: "available",
    isTextbook: false,
  },
];

export default async function BorrowRoute() {
  let listings: Book[] = fallbackListings;
  try {
    const books = await fetchBooks({
      status: "available",
      limit: 50,
      isTextbook: false,
    });
    listings = JSON.parse(JSON.stringify(books)) as Book[];
  } catch {
    /* API unavailable */
  }

  return (
    <>
      <PageHero
        num="02"
        emoji="🤝"
        eyebrow="Borrow locally"
        title="The book you want is closer than you think"
        lead="Search what neighbours are sharing, borrow for free, and return it when you're done — or hand it on to the next reader yourself."
      />
      <BorrowPage initialListings={listings} />
    </>
  );
}
