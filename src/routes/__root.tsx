import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { SITE } from "@/lib/site";
import { localeInfo, type Locale } from "@/lib/i18n/locales";
import { LocaleProvider } from "@/lib/i18n/context";
import { A } from "@/components/common/A";

/**
 * Somewhere useful to land, not a dead end. This used to render a bare "404 / Go home" card with
 * no header or footer and a single link, so anyone who mistyped a URL — or followed a stale link
 * to a doctor or hospital that has since gone — had nowhere to go but back.
 */
const NOT_FOUND_LINKS = [
  { to: "/doctors", label: "Find a surgeon", hint: "Browse by city and speciality" },
  { to: "/specialities", label: "Specialities", hint: "All 21 surgical specialities" },
  { to: "/treatments", label: "Treatments", hint: "Procedures we cover" },
  { to: "/cost", label: "Surgery cost", hint: "What a procedure involves" },
  { to: "/hospitals", label: "Hospitals", hint: "Where our surgeons practise" },
  { to: "/contact", label: "Talk to our team", hint: "Tell us what you need" },
] as const;

function NotFoundComponent() {
  // The route never matched, so no head() ran and the tab inherited the generic site-wide title.
  // 404s aren't indexed, so setting it on the client is enough to stop it reading like a real page.
  useEffect(() => {
    document.title = `Page not found | ${SITE.name}`;
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6">
        <p className="text-sm font-bold uppercase tracking-wide text-primary">404</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">Page not found</h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          The page you're looking for doesn't exist, or it has moved. Here's where most people go
          next.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {NOT_FOUND_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-xl border border-border bg-background p-4 transition-colors hover:border-primary/40 hover:bg-muted"
            >
              <span className="block text-sm font-semibold text-foreground">{l.label}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{l.hint}</span>
            </Link>
          ))}
        </div>
        <div className="mt-8">
          <Link to="/" className="text-sm font-semibold text-primary underline">
            Back to the {SITE.name} home page
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <A
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </A>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient; locale: Locale }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Go Surgery | Modern Healthcare & Medical Support" },
      { name: "description", content: "Connect with trusted specialists, modern hospitals and a dedicated care team for clear guidance from consultation through recovery." },
      { name: "author", content: "Go Surgery" },
      { property: "og:title", content: "Go Surgery | Modern Healthcare & Medical Support" },
      { property: "og:description", content: "Connect with trusted specialists, modern hospitals and a dedicated care team for clear guidance from consultation through recovery." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Go Surgery" },
      { property: "og:image", content: `${SITE.url}/og-default.png` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: `${SITE.url}/og-default.png` },
      { name: "theme-color", content: "#0e201a" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Sora:wght@500;600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "icon", href: "/icon-32.png", type: "image/png", sizes: "32x32" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const { locale } = Route.useRouteContext();
  return (
    // lang matters for screen readers and for search engines to trust the hreflang set.
    <html lang={localeInfo(locale).htmlLang}>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient, locale } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider locale={locale}>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
        <Toaster position="top-center" richColors />
      </LocaleProvider>
    </QueryClientProvider>
  );
}
