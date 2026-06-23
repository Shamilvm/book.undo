import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import BorrowPage from "@/components/pages/BorrowPage";
import "@/styles/pages/borrow.css";
import "@/styles/pages/map.css";

export const metadata: Metadata = {
  title: "Borrow locally — Book Undo",
  description:
    "Borrow books shared by people near you. Read, return, or pass it forward to the next reader.",
};

export default function BorrowRoute() {
  return (
    <>
      <PageHero
        num="02"
        emoji="🤝"
        eyebrow="Borrow locally"
        title="The book you want is closer than you think"
        lead="Search what neighbours are sharing, borrow for free, and return it when you're done — or hand it on to the next reader yourself."
      />
      <BorrowPage />
    </>
  );
}
