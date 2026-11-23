import { Suspense, type ReactNode } from "react";
import type { PageData } from "@/lib/pages";
import { Analytics } from "@/components/head/Analytics";
import { SeoTags } from "@/components/head/SeoTags";
import { AppIcons, SiteIcons } from "@/components/head/SiteIcons";
import { ThemeStyles, WordPressStyles } from "@/components/head/Styles";
import { CookieBannerTemplate, CookieConsentHead } from "@/components/cookies/CookieConsent";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { Preloader } from "@/components/layout/Preloader";
import { SearchOverlay } from "@/components/layout/SearchOverlay";
import { VideoModal } from "@/components/layout/VideoModal";
import { SearchCatalog } from "@/components/scripts/SearchCatalog";
import { ThemeScripts } from "@/components/scripts/ThemeScripts";

/**
 * A whole page: its <head> and the shell every page shares (header, footer, menu, search, video, cookie
 * banner, scripts) around its content. The theme scripts change classes on <html> and <body>, hence
 * suppressHydrationWarning.
 */
export function PageDocument({ page, children }: { page: PageData; children: ReactNode }) {
  return (
    <html lang={page.lang} suppressHydrationWarning>
      <head>
        <SiteIcons />
        <SeoTags tags={page.seo} />
        <Analytics />
        <WordPressStyles styles={page.wordpressStyles} />
        <ThemeStyles styles={page.themeStyles} />
        <CookieConsentHead />
        <AppIcons />
      </head>
      <body className={page.bodyClass} suppressHydrationWarning>
        {page.preloader && <Preloader />}
        <div className="min-h-screen bg-background text-foreground">
          <Header />
          <div className="mega-scrim" id="mega-scrim"></div>
          {children}
          <Footer />
        </div>
        <SearchOverlay />
        <MobileMenu />
        <VideoModal />
        <CookieBannerTemplate />
        <SearchCatalog />
        {/* Its own boundary, last in the page: React hydrates boundaries in order, so the scripts start
            only after everything above them (Next's metadata included) has hydrated. */}
        <Suspense>
          <ThemeScripts scripts={page.scripts} />
        </Suspense>
      </body>
    </html>
  );
}

/**
 * A page's content, as the live site's markup. React never changes it after the server render; the
 * theme scripts animate it (inline styles) and may do so before React has checked it, hence
 * suppressHydrationWarning.
 */
export function PageMain({ page }: { page: PageData }) {
  return <main id="content" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: page.main }} />;
}
