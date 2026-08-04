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
      <Toaster richColors position="top-center" />
    </>
  );
}

function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-sky/40 px-4 text-center">
      <div>
        <h1 className="font-display text-3xl text-navy">Page not found</h1>
        <p className="mt-2 text-muted-foreground">
          The page you were looking for has moved or never existed.
        </p>
        <a
          href="/"
          className="mt-6 inline-block rounded-xl bg-navy px-6 py-3 text-sm font-bold text-white"
        >
          Back to the store
        </a>
      </div>
    </div>
  );
}
