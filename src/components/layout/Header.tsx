import { PORTAL_LOGIN_URL } from "@/config/links";
import { isMenu, NAVIGATION, type NavLink, type NavMenu } from "@/config/navigation";

/** The fixed site header: logo, main navigation (mega menu), search, Patient Portal, booking and the menu button. */
export function Header() {
  return (
    <header className="fixed top-0 inset-x-0 z-[80] isolate text-foreground">
      <div
        className="relative transition-all duration-700"
        style={{
          background: "color-mix(in oklab, var(--background) 94%, transparent)",
          backdropFilter: "blur(28px) saturate(1.25)",
          borderBottom: "1px solid color-mix(in oklab, var(--foreground) 8%, transparent)",
          boxShadow: "0 10px 38px color-mix(in oklab, var(--foreground) 5%, transparent)",
        }}
      >
        <nav
          className="mx-auto flex max-w-[1440px] items-center justify-between px-6 md:px-12 transition-all duration-700"
          style={{ paddingTop: "1.4rem", paddingBottom: "1.4rem" }}
        >
          <a href="/" className="flex items-center gap-4 group" aria-label="The Schoeman Clinic home">
            <img
              src="/wp-content/themes/schoeman-clinic/assets/Logo.avif"
              alt="The Schoeman Clinic"
              className="w-auto transition-all duration-700"
              style={{ height: "3.2rem" }}
            />
          </a>
          <div className="tsc-header-nav hidden items-center gap-9 whitespace-nowrap text-[0.7rem] uppercase tracking-[0.26em] xl:flex">
            {NAVIGATION.map((item) =>
              isMenu(item) ? <MegaTrigger key={item.key} menu={item} /> : <NavLinkItem key={item.href} link={item} />,
            )}
          </div>
          <div className="flex items-center gap-3 md:gap-5">
            <button
              type="button"
              aria-label="Search"
              className="hidden md:grid place-items-center h-9 w-9 rounded-full transition-colors duration-500 hover:text-[color:var(--bronze)]"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="7"></circle>
                <path d="m20 20-3.5-3.5"></path>
              </svg>
            </button>
            <a
              href={PORTAL_LOGIN_URL}
              aria-label="Patient Portal"
              className="tsc-header-portal group inline-flex h-9 items-center gap-2 whitespace-nowrap text-[0.65rem] uppercase tracking-[0.28em] transition-colors duration-500 hover:text-[color:var(--bronze)]"
            >
              <svg
                aria-hidden="true"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              >
                <circle cx="12" cy="8" r="4"></circle>
                <path d="M4 20c1.6-3.6 4.6-5.5 8-5.5s6.4 1.9 8 5.5"></path>
              </svg>
              <span className="hidden md:inline">Patient Portal</span>
            </a>
            <a
              href="/book/"
              aria-label="Book a Discovery Call"
              className="tsc-header-cta group relative inline-flex items-center overflow-hidden whitespace-nowrap border px-5 py-3 md:px-6 md:py-3.5 text-[0.65rem] uppercase tracking-[0.28em]"
              style={{ borderColor: "color-mix(in oklab, var(--foreground) 55%, transparent)" }}
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 -translate-y-full transition-transform duration-[700ms] ease-[cubic-bezier(0.7,0,0.15,1)] group-hover:translate-y-0"
                style={{ background: "var(--bronze)" }}
              ></span>
              <span className="relative z-10 transition-colors duration-500 group-hover:text-[color:var(--background)]">
                <span className="tsc-header-cta__book hidden md:inline">Book a </span>
                Discovery Call
              </span>
            </a>
            <button
              type="button"
              aria-label="Menu"
              className="grid xl:hidden place-items-center h-9 w-9 transition-colors duration-500 hover:text-[color:var(--bronze)]"
            >
              <span className="grid grid-cols-3 gap-[3px]">
                <span className="block h-[3px] w-[3px] rounded-full bg-current"></span>
                <span className="block h-[3px] w-[3px] rounded-full bg-current"></span>
                <span className="block h-[3px] w-[3px] rounded-full bg-current"></span>
                <span className="block h-[3px] w-[3px] rounded-full bg-current"></span>
                <span className="block h-[3px] w-[3px] rounded-full bg-current"></span>
                <span className="block h-[3px] w-[3px] rounded-full bg-current"></span>
                <span className="block h-[3px] w-[3px] rounded-full bg-current"></span>
                <span className="block h-[3px] w-[3px] rounded-full bg-current"></span>
                <span className="block h-[3px] w-[3px] rounded-full bg-current"></span>
              </span>
            </button>
          </div>
        </nav>
        <div id="mega" className="mega" role="region" aria-label="Site menu">
          <div className="mega-inner">
            {NAVIGATION.filter(isMenu).map((menu) => (
              <MegaPanel key={menu.key} menu={menu} />
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

const underline =
  "absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-700 group-hover:scale-x-100";

/** A top-level menu: opens its mega panel (site.js matches data-mega-trigger to data-mega-panel). */
function MegaTrigger({ menu }: { menu: NavMenu }) {
  return (
    <button
      aria-expanded="false"
      aria-haspopup="true"
      className="group relative inline-flex items-center gap-1.5 uppercase tracking-[0.26em]"
      data-mega-trigger={menu.key}
      type="button"
    >
      <span className="mega-trigger-label transition-colors duration-500 group-hover:text-[color:var(--bronze)]">
        {menu.label}
      </span>
      <svg aria-hidden="true" className="mega-caret" fill="none" height="9" viewBox="0 0 10 10" width="9">
        <path
          d="M2 3.5 5 6.5 8 3.5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.2"
        ></path>
      </svg>
      <span aria-hidden="true" className={`mega-underline ${underline}`} style={{ background: "var(--bronze)" }}></span>
    </button>
  );
}

/** A top-level link without a dropdown. */
function NavLinkItem({ link }: { link: NavLink }) {
  return (
    <a className="group relative inline-flex items-center" href={link.href}>
      <span className="transition-colors duration-500 group-hover:text-[color:var(--bronze)]">{link.label}</span>
      <span aria-hidden="true" className={underline} style={{ background: "var(--bronze)" }}></span>
    </a>
  );
}

/** A menu's mega panel: its heading, then a column of links per group. */
function MegaPanel({ menu }: { menu: NavMenu }) {
  return (
    <div className="mega-panel" data-mega-panel={menu.key}>
      <div className="mega-grid">
        <div className="mega-col mega-lead">
          <span className="mega-eyebrow">{menu.label}</span>
          <h3 className="mega-title">
            {menu.title[0]}
            <br /> {menu.title[1]}
          </h3>
        </div>
        {menu.columns.map((column) => (
          <div key={column.heading} className="mega-col mega-list">
            <span className="mega-eyebrow">{column.heading}</span>
            {column.links.map((link) => (
              <a
                key={link.href}
                className="mega-link"
                href={link.href}
                {...(link.external ? { target: "_blank", rel: "noopener" } : {})}
              >
                <span className="mega-link-label">{link.label}</span>
                <span aria-hidden="true" className="mega-arrow">
                  →
                </span>
              </a>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
