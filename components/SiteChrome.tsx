"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteEffects from "@/components/SiteEffects";
import ToastHost from "@/components/ToastHost";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hidePublicChrome = pathname.startsWith("/admin");

  if (hidePublicChrome) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="cursor-ring" aria-hidden="true"></div>
      <div className="cursor-dot" aria-hidden="true"></div>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <SiteEffects />
      <ToastHost />
    </>
  );
}
