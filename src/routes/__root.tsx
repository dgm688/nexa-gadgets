import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "sonner";

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFound,
});

function RootComponent() {
  return (
    <>
      <Outlet />
      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          style: {
            background: "var(--color-elevated)",
            border: "1px solid var(--color-hairline-strong)",
            color: "var(--color-ink)",
          },
        }}
      />
    </>
  );
}

function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="eyebrow">404</p>
        <h1 className="mt-4 text-4xl tracking-[-0.03em]">This page doesn't exist</h1>
        <p className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-[var(--color-ink-dim)]">
          The link may be out of date, or the product has moved.
        </p>
        <a
          href="/"
          className="mt-8 inline-flex rounded-full bg-[var(--color-ink)] px-6 py-3 text-[14px] font-semibold text-[#08090a] transition-colors hover:bg-white"
        >
          Back to the store
        </a>
      </div>
    </div>
  );
}
