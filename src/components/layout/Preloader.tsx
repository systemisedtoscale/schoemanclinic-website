/** The home page's opening animation. The inline script hides the page until site.js plays it. */
export function Preloader() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('tsc-preloading');" }} />
      <div id="tsc-preloader" className="tsc-preloader" role="presentation" aria-hidden="true">
        <div className="tsc-pre__panel tsc-pre__panel--top"></div>
        <div className="tsc-pre__panel tsc-pre__panel--bottom"></div>
        <div className="tsc-pre__center">
          <img
            className="tsc-pre__logo"
            src="/wp-content/themes/schoeman-clinic/assets/Logo.avif"
            alt="The Schoeman Clinic"
            width="300"
          />
          <div className="tsc-pre__cap">
            <span className="tsc-pre__line"></span>
            <span>Harley Street · Wimbledon</span>
          </div>
        </div>
      </div>
    </>
  );
}
