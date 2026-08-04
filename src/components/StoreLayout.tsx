import type { ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { pageTransition } from "@/lib/motion";

export function StoreLayout({ children }: { children: ReactNode }) {
  // Keying on pathname replays the entrance on every navigation, which gives a
  // route transition without holding the outgoing tree mounted.
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-[var(--color-ink)] focus:px-5 focus:py-2.5 focus:text-[13px] focus:font-semibold focus:text-[#08090a]"
      >
        Skip to content
      </a>

      <Header />

      <motion.main
        id="main"
        key={pathname}
        variants={pageTransition}
        initial="hidden"
        animate="show"
        className="flex-1"
      >
        {children}
      </motion.main>

      <Footer />
    </div>
  );
}
