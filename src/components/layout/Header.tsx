import { PORTAL_LOGIN_URL } from "@/config/links";

/** The fixed site header: logo, mega menu, search, Patient Login and the mobile menu button. */
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
          <div className="hidden items-center gap-9 text-[0.7rem] uppercase tracking-[0.26em] xl:flex">
            <button
              aria-expanded="false"
              aria-haspopup="true"
              className="group relative inline-flex items-center gap-1.5 uppercase tracking-[0.26em]"
              data-mega-trigger="approach"
              type="button"
            >
              <span className="mega-trigger-label transition-colors duration-500 group-hover:text-[color:var(--bronze)]">
                Approach
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
              <span
                aria-hidden="true"
                className="mega-underline absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-700 group-hover:scale-x-100"
                style={{ background: "var(--bronze)" }}
              ></span>
            </button>
            <button
              aria-expanded="false"
              aria-haspopup="true"
              className="group relative inline-flex items-center gap-1.5 uppercase tracking-[0.26em]"
              data-mega-trigger="services"
              type="button"
            >
              <span className="mega-trigger-label transition-colors duration-500 group-hover:text-[color:var(--bronze)]">
                Services
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
              <span
                aria-hidden="true"
                className="mega-underline absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-700 group-hover:scale-x-100"
                style={{ background: "var(--bronze)" }}
              ></span>
            </button>
            <button
              aria-expanded="false"
              aria-haspopup="true"
              className="group relative inline-flex items-center gap-1.5 uppercase tracking-[0.26em]"
              data-mega-trigger="conditions"
              type="button"
            >
              <span className="mega-trigger-label transition-colors duration-500 group-hover:text-[color:var(--bronze)]">
                Conditions
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
              <span
                aria-hidden="true"
                className="mega-underline absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-700 group-hover:scale-x-100"
                style={{ background: "var(--bronze)" }}
              ></span>
            </button>
            <a className="group relative inline-flex items-center" href="/specialists/">
              <span className="transition-colors duration-500 group-hover:text-[color:var(--bronze)]">Specialists</span>
              <span
                aria-hidden="true"
                className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-700 group-hover:scale-x-100"
                style={{ background: "var(--bronze)" }}
              ></span>
            </a>
            <button
              aria-expanded="false"
              aria-haspopup="true"
              className="group relative inline-flex items-center gap-1.5 uppercase tracking-[0.26em]"
              data-mega-trigger="the-clinic"
              type="button"
            >
              <span className="mega-trigger-label transition-colors duration-500 group-hover:text-[color:var(--bronze)]">
                The Clinic
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
              <span
                aria-hidden="true"
                className="mega-underline absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-700 group-hover:scale-x-100"
                style={{ background: "var(--bronze)" }}
              ></span>
            </button>
            <a className="group relative inline-flex items-center" href="/journal/">
              <span className="transition-colors duration-500 group-hover:text-[color:var(--bronze)]">Journal</span>
              <span
                aria-hidden="true"
                className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-700 group-hover:scale-x-100"
                style={{ background: "var(--bronze)" }}
              ></span>
            </a>
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
              aria-label="Patient Login"
              title="Patient Login"
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
                <circle cx="12" cy="8" r="4"></circle>
                <path d="M4 20c1.6-3.6 4.6-5.5 8-5.5s6.4 1.9 8 5.5"></path>
              </svg>
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
                <span className="hidden md:inline">Book a </span>
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
            <div className="mega-panel" data-mega-panel="approach">
              <div className="mega-grid">
                <div className="mega-col mega-lead">
                  <span className="mega-eyebrow">Approach</span>
                  <h3 className="mega-title">
                    A considered
                    <br /> standard of care
                  </h3>
                </div>
                <div className="mega-col mega-list">
                  <span className="mega-eyebrow">The Practice</span>
                  <a className="mega-link" href="/about/">
                    <span className="mega-link-label">About Us</span>
                    <span aria-hidden="true" className="mega-arrow">
                      →
                    </span>
                  </a>
                  <a className="mega-link" href="/methodology/">
                    <span className="mega-link-label">Our Methodology</span>
                    <span aria-hidden="true" className="mega-arrow">
                      →
                    </span>
                  </a>
                  <a className="mega-link" href="/pricing/">
                    <span className="mega-link-label">Pricing</span>
                    <span aria-hidden="true" className="mega-arrow">
                      →
                    </span>
                  </a>
                </div>
                <div className="mega-col mega-list">
                  <span className="mega-eyebrow">Considering Us</span>
                  <a className="mega-link" href="/faqs/">
                    <span className="mega-link-label">FAQs</span>
                    <span aria-hidden="true" className="mega-arrow">
                      →
                    </span>
                  </a>
                  <a className="mega-link" href="https://form.typeform.com/to/Q98AOXB0" target="_blank" rel="noopener">
                    <span className="mega-link-label">Request Prescription</span>
                    <span aria-hidden="true" className="mega-arrow">
                      →
                    </span>
                  </a>
                  <a className="mega-link" href="/testimonials/">
                    <span className="mega-link-label">Patient Stories</span>
                    <span aria-hidden="true" className="mega-arrow">
                      →
                    </span>
                  </a>
                </div>
              </div>
            </div>
            <div className="mega-panel" data-mega-panel="services">
              <div className="mega-grid">
                <div className="mega-col mega-lead">
                  <span className="mega-eyebrow">Services</span>
                  <h3 className="mega-title">
                    Three services,
                    <br /> one unified plan
                  </h3>
                </div>
                <div className="mega-col mega-list">
                  <span className="mega-eyebrow">Core Services</span>
                  <a className="mega-link" href="/hormone-health/">
                    <span className="mega-link-label">Hormone Health {"&"} Optimisation</span>
                    <span aria-hidden="true" className="mega-arrow">
                      →
                    </span>
                  </a>
                  <a className="mega-link" href="/longevity-functional/">
                    <span className="mega-link-label">Longevity {"&"} Functional Medicine</span>
                    <span aria-hidden="true" className="mega-arrow">
                      →
                    </span>
                  </a>
                  <a className="mega-link" href="/diagnostics/">
                    <span className="mega-link-label">Diagnostics {"&"} Supportive Services</span>
                    <span aria-hidden="true" className="mega-arrow">
                      →
                    </span>
                  </a>
                </div>
              </div>
            </div>
            <div className="mega-panel" data-mega-panel="conditions">
              <div className="mega-grid">
                <div className="mega-col mega-lead">
                  <span className="mega-eyebrow">Conditions</span>
                  <h3 className="mega-title">
                    Root causes,
                    <br /> not symptoms
                  </h3>
                </div>
                <div className="mega-col mega-list">
                  <span className="mega-eyebrow">Conditions We Treat</span>
                  <a className="mega-link" href="/hormonal-health/">
                    <span className="mega-link-label">Hormonal Health</span>
                    <span aria-hidden="true" className="mega-arrow">
                      →
                    </span>
                  </a>
                  <a className="mega-link" href="/metabolic-health/">
                    <span className="mega-link-label">Metabolic Health</span>
                    <span aria-hidden="true" className="mega-arrow">
                      →
                    </span>
                  </a>
                  <a className="mega-link" href="/digestive-health/">
                    <span className="mega-link-label">Digestive Health</span>
                    <span aria-hidden="true" className="mega-arrow">
                      →
                    </span>
                  </a>
                </div>
                <div className="mega-col mega-list">
                  <span className="mega-eyebrow">Related Areas</span>
                  <a className="mega-link" href="/neurological-health/">
                    <span className="mega-link-label">Neurological Health</span>
                    <span aria-hidden="true" className="mega-arrow">
                      →
                    </span>
                  </a>
                  <a className="mega-link" href="/longevity/">
                    <span className="mega-link-label">Longevity</span>
                    <span aria-hidden="true" className="mega-arrow">
                      →
                    </span>
                  </a>
                </div>
              </div>
            </div>
            <div className="mega-panel" data-mega-panel="the-clinic">
              <div className="mega-grid">
                <div className="mega-col mega-lead">
                  <span className="mega-eyebrow">The Clinic</span>
                  <h3 className="mega-title">
                    Two clinics,
                    <br /> one standard
                  </h3>
                </div>
                <div className="mega-col mega-list">
                  <span className="mega-eyebrow">Locations</span>
                  <a className="mega-link" href="/clinic/harley-street/">
                    <span className="mega-link-label">Harley Street</span>
                    <span aria-hidden="true" className="mega-arrow">
                      →
                    </span>
                  </a>
                  <a className="mega-link" href="/clinic/wimbledon/">
                    <span className="mega-link-label">Wimbledon</span>
                    <span aria-hidden="true" className="mega-arrow">
                      →
                    </span>
                  </a>
                  <a className="mega-link" href="/clinic/virtual-appointments/">
                    <span className="mega-link-label">Virtual Appointments</span>
                    <span aria-hidden="true" className="mega-arrow">
                      →
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
