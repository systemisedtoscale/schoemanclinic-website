import { PORTAL_LOGIN_URL, REPEAT_PRESCRIPTION_URL } from "@/config/links";

/** A link in a menu. External links open in a new tab. */
export type NavLink = { label: string; href: string; external?: boolean };

/** A top-level menu with a dropdown: a mega panel on wide screens, a fold-out group in the mobile menu. */
export type NavMenu = {
  /** Used in the mega panel's and the mobile group's ids (data-mega-panel, tsc-menu-<key>). */
  key: string;
  label: string;
  /** The mega panel's heading, one string per line. */
  title: [string, string];
  /** The panel's columns, each under a small heading. The mobile menu lists them in one run. */
  columns: { heading: string; links: NavLink[] }[];
};

export type NavItem = NavMenu | NavLink;

export const isMenu = (item: NavItem): item is NavMenu => "columns" in item;

/** The site's main navigation, in order: the header on wide screens and the mobile menu. */
export const NAVIGATION: NavItem[] = [
  // The practice and its clinics in one menu, so the bar keeps the live site's six items.
  // The key stays "approach": site.js lines every mega panel up with that trigger.
  {
    key: "approach",
    label: "About",
    title: ["A considered", "standard of care"],
    columns: [
      {
        heading: "The Practice",
        links: [
          { label: "About Us", href: "/about/" },
          { label: "Our Methodology", href: "/methodology/" },
          { label: "Patient Stories", href: "/testimonials/" },
        ],
      },
      {
        heading: "Our Clinics",
        links: [
          { label: "Harley Street", href: "/clinic/harley-street/" },
          { label: "Wimbledon", href: "/clinic/wimbledon/" },
          { label: "Virtual Appointments", href: "/clinic/virtual-appointments/" },
        ],
      },
    ],
  },
  // Conditions first: patients come looking for what they are living with.
  {
    key: "conditions",
    label: "Conditions",
    title: ["Root causes,", "not symptoms"],
    columns: [
      {
        heading: "Conditions We Treat",
        links: [
          { label: "Hormonal Health", href: "/hormonal-health/" },
          { label: "Metabolic Health", href: "/metabolic-health/" },
          { label: "Digestive Health", href: "/digestive-health/" },
        ],
      },
      {
        heading: "Related Areas",
        links: [
          { label: "Neurological Health", href: "/neurological-health/" },
          { label: "Longevity", href: "/longevity/" },
        ],
      },
    ],
  },
  {
    key: "services",
    label: "Services",
    title: ["Three services,", "one unified plan"],
    columns: [
      {
        heading: "Core Services",
        links: [
          { label: "Hormone Health & Optimisation", href: "/hormone-health/" },
          { label: "Longevity & Functional Medicine", href: "/longevity-functional/" },
          { label: "Diagnostics & Supportive Services", href: "/diagnostics/" },
        ],
      },
    ],
  },
  { label: "Specialists", href: "/specialists/" },
  {
    key: "patients",
    label: "Patients",
    title: ["Your care,", "every step"],
    columns: [
      {
        heading: "Getting Started",
        links: [
          { label: "New Patients", href: "/new-patients/" },
          { label: "Pricing", href: "/pricing/" },
          { label: "FAQs", href: "/faqs/" },
        ],
      },
      {
        heading: "Existing Patients",
        links: [
          { label: "Book a Follow-up", href: "/existing-patients/" },
          { label: "Repeat Prescription", href: REPEAT_PRESCRIPTION_URL, external: true },
          { label: "Patient Portal", href: PORTAL_LOGIN_URL },
        ],
      },
    ],
  },
  // The journal mixes clinical articles and research summaries; "Insights" says so better than
  // "Journal". The address stays /journal/.
  { label: "Insights", href: "/journal/" },
];
