"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initSelectFields } from "@/lib/select-fields";

function setupReveals() {
  const revealInView = (el: Element) => {
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    return r.top < vh * 0.9 && r.bottom > vh * 0.1;
  };

  const showReveals = () => {
    document.querySelectorAll(".reveal, .reveal-mask").forEach((el) => {
      if (!el.classList.contains("is-visible") && revealInView(el)) {
        el.classList.add("is-visible");
      }
    });
  };

  showReveals();
  requestAnimationFrame(() => showReveals());

  return showReveals;
}

function setupCountAnimations() {
  const nums = document.querySelectorAll("[data-count]:not([data-count-init])");
  let cio: IntersectionObserver | undefined;

  if (nums.length && "IntersectionObserver" in window) {
    cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target;
          if (!(el instanceof HTMLElement) || !el.dataset.count) return;
          cio?.unobserve(el);
          const target = parseFloat(el.dataset.count);
          const suffix = el.dataset.suffix || "";
          const decimals = (el.dataset.count.split(".")[1] || "").length;
          const dur = 1400;
          const t0 = performance.now();
          const tick = (t: DOMHighResTimeStamp) => {
            const p = Math.min((t - t0) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            const val = target * eased;
            el.textContent =
              (decimals
                ? val.toFixed(decimals)
                : Math.round(val).toLocaleString()) + suffix;
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.5 },
    );
    nums.forEach((n) => {
      if (n instanceof HTMLElement) n.dataset.countInit = "";
      cio?.observe(n);
    });
  }

  return () => cio?.disconnect();
}

function setupMagneticButtons() {
  const cleanups: Array<() => void> = [];

  document
    .querySelectorAll<HTMLElement>("[data-magnetic]:not([data-magnetic-init]), .btn:not([data-magnetic-init])")
    .forEach((el) => {
      el.dataset.magneticInit = "";
      const strength = 0.35;
      const onMove = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      };
      const onLeave = () => {
        el.style.transform = "";
      };
      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
      cleanups.push(() => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
        el.style.transform = "";
      });
    });

  return () => cleanups.forEach((fn) => fn());
}

export default function SiteEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const fine =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(max-width: 767px)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!fine || reduce) {
      document.querySelector(".cursor-dot")?.remove();
      document.querySelector(".cursor-ring")?.remove();
      return;
    }

    const dot = document.querySelector<HTMLElement>(".cursor-dot");
    const ring = document.querySelector<HTMLElement>(".cursor-ring");

    let rafId = 0;
    let rx = window.innerWidth / 2;
    let ry = window.innerHeight / 2;
    let mx = rx;
    let my = ry;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (dot)
        dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    };
    window.addEventListener("mousemove", onMove);

    const loop = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (ring)
        ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    const hoverable =
      "a, button, .card, input, select, textarea, .select-trigger, [data-cursor]";
    const onOver = (e: MouseEvent) => {
      const target = e.target;
      if (target instanceof Element && target.closest(hoverable))
        ring?.classList.add("is-hover");
    };
    const onOut = (e: MouseEvent) => {
      const target = e.target;
      if (target instanceof Element && target.closest(hoverable))
        ring?.classList.remove("is-hover");
    };
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    initSelectFields();
    const showReveals = setupReveals();
    const cleanupCounts = setupCountAnimations();
    const cleanupMagnetic = setupMagneticButtons();

    window.addEventListener("scroll", showReveals, { passive: true });
    window.addEventListener("resize", showReveals, { passive: true });

    return () => {
      window.removeEventListener("scroll", showReveals);
      window.removeEventListener("resize", showReveals);
      cleanupCounts();
      cleanupMagnetic();
    };
  }, [pathname]);

  return null;
}
