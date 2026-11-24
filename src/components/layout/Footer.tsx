import { PORTAL_LOGIN_URL, REPEAT_PRESCRIPTION_URL } from "@/config/links";
import type { NavLink } from "@/config/navigation";

/** The site footer. site.js turns its columns into accordions on small screens. */
export function Footer() {
  return (
    <footer className="border-t border-[color:var(--border)] bg-background">
      <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-12">
        <div className="tsc-foot__top">
          <div className="tsc-foot__brand">
            <img
              src="/wp-content/themes/schoeman-clinic/assets/Logo.avif"
              alt="The Schoeman Clinic"
              style={{ height: "3rem", width: "auto" }}
            />
            <p className="mt-5 text-[0.62rem] uppercase tracking-[0.32em] text-[color:var(--bronze)]">
              Harley Street · Wimbledon
            </p>
            <p className="mt-8 max-w-sm text-sm leading-[1.85] text-[color:var(--muted-foreground)]">
              Premium, evidence-based hormone, longevity and functional medicine for a stronger and healthier you.
            </p>
            <a
              href="/book/"
              className="group relative mt-8 inline-flex items-center overflow-hidden whitespace-nowrap border px-5 py-3 md:px-6 md:py-3.5 text-[0.65rem] uppercase tracking-[0.28em]"
              style={{ borderColor: "color-mix(in oklab, var(--foreground) 55%, transparent)" }}
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 -translate-y-full transition-transform duration-[700ms] ease-[cubic-bezier(0.7,0,0.15,1)] group-hover:translate-y-0"
                style={{ background: "var(--bronze)" }}
              ></span>
              <span className="relative z-10 transition-colors duration-500 group-hover:text-[color:var(--background)]">
                Book a Discovery Call
              </span>
            </a>
            <nav className="tsc-foot__social" aria-label="Social media">
              <a href="https://www.instagram.com/schoemanclinic" target="_blank" rel="noopener" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <rect x="3" y="3" width="18" height="18" rx="5"></rect>
                  <circle cx="12" cy="12" r="4"></circle>
                  <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none"></circle>
                </svg>
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61573288663320"
                target="_blank"
                rel="noopener"
                aria-label="Facebook"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.5 21v-7h2.3l.4-2.8h-2.7V9.3c0-.8.2-1.3 1.4-1.3H16V5.6c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v1.9H7.8V14h2.3v7h3.4z"></path>
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/theschoemanclinic/"
                target="_blank"
                rel="noopener"
                aria-label="LinkedIn"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6.94 8.5V19H4V8.5h2.94zM5.47 4a1.7 1.7 0 1 1 0 3.4 1.7 1.7 0 0 1 0-3.4zM20 19h-2.94v-5.6c0-1.33-.48-2.24-1.67-2.24-.91 0-1.45.61-1.69 1.2-.09.21-.11.5-.11.79V19h-2.94s.04-9.5 0-10.5h2.94v1.49c.39-.6 1.09-1.46 2.65-1.46 1.94 0 3.76 1.27 3.76 4V19z"></path>
                </svg>
              </a>
            </nav>
          </div>
          <div className="tsc-foot__col">
            <div className="text-[0.65rem] uppercase tracking-[0.32em] text-[color:var(--bronze)]">Services</div>
            <div className="tsc-foot__panel">
              <ul className="mt-6 space-y-3 text-sm text-[color:var(--muted-foreground)]">
                <li>
                  <a className="hover:text-[color:var(--bronze)] transition-colors" href="/hormone-health/">
                    Hormone Health {"&"} Optimisation
                  </a>
                </li>
                <li>
                  <a className="hover:text-[color:var(--bronze)] transition-colors" href="/longevity-functional/">
                    Longevity {"&"} Functional Medicine
                  </a>
                </li>
                <li>
                  <a className="hover:text-[color:var(--bronze)] transition-colors" href="/diagnostics/">
                    Diagnostics {"&"} Supportive Services
                  </a>
                </li>
                <li>
                  <a className="hover:text-[color:var(--bronze)] transition-colors" href="/hormonal-health/">
                    Hormonal Health
                  </a>
                </li>
                <li>
                  <a className="hover:text-[color:var(--bronze)] transition-colors" href="/metabolic-health/">
                    Metabolic Health
                  </a>
                </li>
                <li>
                  <a className="hover:text-[color:var(--bronze)] transition-colors" href="/digestive-health/">
                    Digestive Health
                  </a>
                </li>
                <li>
                  <a className="hover:text-[color:var(--bronze)] transition-colors" href="/neurological-health/">
                    Neurological Health
                  </a>
                </li>
                <li>
                  <a className="hover:text-[color:var(--bronze)] transition-colors" href="/longevity/">
                    Longevity
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <FooterColumn
            heading="About"
            links={[
              { label: "About Us", href: "/about/" },
              { label: "Our Methodology", href: "/methodology/" },
              { label: "Specialists", href: "/specialists/" },
              { label: "Patient Stories", href: "/testimonials/" },
              { label: "Harley Street", href: "/clinic/harley-street/" },
              { label: "Wimbledon", href: "/clinic/wimbledon/" },
              { label: "Virtual Appointments", href: "/clinic/virtual-appointments/" },
              { label: "Insights", href: "/journal/" },
            ]}
          />
          <FooterColumn
            heading="Patients"
            links={[
              { label: "New Patients", href: "/new-patients/" },
              { label: "Book a Follow-up", href: "/existing-patients/" },
              { label: "Pricing", href: "/pricing/" },
              { label: "FAQs", href: "/faqs/" },
              { label: "Repeat Prescription", href: REPEAT_PRESCRIPTION_URL, external: true },
              { label: "Patient Portal", href: PORTAL_LOGIN_URL },
              { label: "Contact", href: "/contact/" },
            ]}
          />
          <div className="tsc-foot__contact-col">
            <div className="text-[0.65rem] uppercase tracking-[0.32em] text-[color:var(--bronze)]">Contact</div>
            <div className="tsc-foot__contact">
              <address>
                96 Harley Street
                <br />
                London W1G 7HY
              </address>
              <address>
                4 St Marks Place
                <br />
                Wimbledon, London SW19 7NP
              </address>
              <div className="tsc-foot__contact-direct">
                <a href="tel:+442030063224">+44 (0)20 3006 3224</a>
                <a href="mailto:info@theschoemanclinic.com">info@theschoemanclinic.com</a>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-[color:var(--border)] pt-8 text-[0.65rem] uppercase tracking-[0.28em] text-[color:var(--muted-foreground)] md:flex-row md:items-center">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:gap-8">
            <div>© 2026 The Schoeman Clinic. All rights reserved.</div>
            <div className="flex items-center gap-8">
              <a href="/privacy/" className="hover:text-[color:var(--bronze)] transition-colors">
                Privacy
              </a>
              <a href="/terms/" className="hover:text-[color:var(--bronze)] transition-colors">
                Terms
              </a>
            </div>
          </div>
          <div>
            <a
              className="hover:text-[color:var(--bronze)] transition-colors"
              href="https://rubikdigital.co.uk"
              target="_blank"
              rel="noopener"
            >
              Created by Rubik Digital
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/** A column of footer links. On small screens site.js turns its heading into an accordion toggle. */
function FooterColumn({ heading, links }: { heading: string; links: NavLink[] }) {
  return (
    <div className="tsc-foot__col">
      <div className="text-[0.65rem] uppercase tracking-[0.32em] text-[color:var(--bronze)]">{heading}</div>
      <div className="tsc-foot__panel">
        <ul className="mt-6 space-y-3 text-sm text-[color:var(--muted-foreground)]">
          {links.map((link) => (
            <li key={link.href}>
              <a
                className="hover:text-[color:var(--bronze)] transition-colors"
                href={link.href}
                {...(link.external ? { target: "_blank", rel: "noopener" } : {})}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
