import { PORTAL_LOGIN_URL } from "@/config/links";
import { isMenu, NAVIGATION, type NavMenu } from "@/config/navigation";

/** The full-screen menu opened by the header's menu button (site.js). */
export function MobileMenu() {
  return (
    <div id="tsc-menu" className="tsc-menu" role="dialog" aria-modal="true" aria-label="Menu" aria-hidden="true">
      <div className="tsc-menu__backdrop" id="tsc-menu-backdrop"></div>
      <div className="tsc-menu__panel">
        {" "}
        <button type="button" className="tsc-menu__close" id="tsc-menu-close" aria-label="Close menu">
          {" "}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          >
            <path d="M6 6l12 12M18 6L6 18"></path>
          </svg>{" "}
        </button>{" "}
        <img
          className="tsc-menu__logo"
          src="/wp-content/themes/schoeman-clinic/assets/Logo.avif"
          alt="The Schoeman Clinic"
        />{" "}
        <nav className="tsc-menu__nav" aria-label="Primary">
          {NAVIGATION.map((item) =>
            isMenu(item) ? (
              <MenuGroup key={item.key} menu={item} />
            ) : (
              <a key={item.href} className="tsc-menu__nav-link" href={item.href}>
                {item.label}
              </a>
            ),
          )}
          <a className="tsc-menu__nav-link" href={PORTAL_LOGIN_URL}>
            Patient Portal
          </a>
        </nav>
        <nav className="tsc-menu__social" aria-label="Social media">
          {" "}
          <a href="https://www.instagram.com/schoemanclinic" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <rect x="3" y="3" width="18" height="18" rx="5"></rect>
              <circle cx="12" cy="12" r="4"></circle>
              <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none"></circle>
            </svg>
            <span>Instagram</span>
          </a>{" "}
          <a href="https://www.facebook.com/profile.php?id=61573288663320" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.5 21v-7h2.3l.4-2.8h-2.7V9.3c0-.8.2-1.3 1.4-1.3H16V5.6c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v1.9H7.8V14h2.3v7h3.4z"></path>
            </svg>
            <span>Facebook</span>
          </a>{" "}
          <a href="https://www.linkedin.com/company/theschoemanclinic/" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.94 8.5V19H4V8.5h2.94zM5.47 4a1.7 1.7 0 1 1 0 3.4 1.7 1.7 0 0 1 0-3.4zM20 19h-2.94v-5.6c0-1.33-.48-2.24-1.67-2.24-.91 0-1.45.61-1.69 1.2-.09.21-.11.5-.11.79V19h-2.94s.04-9.5 0-10.5h2.94v1.49c.39-.6 1.09-1.46 2.65-1.46 1.94 0 3.76 1.27 3.76 4V19z"></path>
            </svg>
            <span>LinkedIn</span>
          </a>{" "}
        </nav>
        <div className="tsc-menu__contact">
          {" "}
          <a className="tsc-menu__phone" href="tel:+442030063224">
            +44 (0)20 3006 3224
          </a>{" "}
          <a className="tsc-menu__email" href="mailto:info@theschoemanclinic.com">
            info@theschoemanclinic.com
          </a>{" "}
          <p className="tsc-menu__addr">
            96 Harley Street, London W1G 7HY
            <br />
            Wimbledon, SW19
          </p>
        </div>{" "}
        <a className="tsc-menu__nav-link tsc-menu__search" href="/?s=">
          {" "}
          <span>Search</span>{" "}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7"></circle>
            <path d="m20 20-3.5-3.5"></path>
          </svg>{" "}
        </a>{" "}
      </div>
    </div>
  );
}

/** A menu that folds out (site.js toggles aria-expanded; one group open at a time). */
function MenuGroup({ menu }: { menu: NavMenu }) {
  const id = `tsc-menu-${menu.key}`;
  return (
    <div className="tsc-menu__group">
      <button aria-controls={id} aria-expanded="false" className="tsc-menu__toggle" type="button">
        <span>{menu.label}</span>
        <span aria-hidden="true" className="tsc-menu__plus"></span>
      </button>
      <div className="tsc-menu__sub" id={id}>
        <div className="tsc-menu__sub-inner">
          {menu.columns.flatMap((column) =>
            column.links.map((link) => (
              <a
                key={link.href}
                className="tsc-menu__sublink"
                href={link.href}
                {...(link.external ? { target: "_blank", rel: "noopener" } : {})}
              >
                {link.label}
              </a>
            )),
          )}
        </div>
      </div>
    </div>
  );
}
