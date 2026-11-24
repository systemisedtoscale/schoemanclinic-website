/** The clinic film, played in a dialog by any [data-video] trigger (site.js). */
export function VideoModal() {
  return (
    <div id="tsc-video" className="tsc-video" role="dialog" aria-modal="true" aria-label="Video" aria-hidden="true">
      <div className="tsc-video__backdrop" id="tsc-video-backdrop"></div>
      <div className="tsc-video__frame">
        {" "}
        <button type="button" className="tsc-video__close" id="tsc-video-close" aria-label="Close video">
          {" "}
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          >
            <path d="M6 6l12 12M18 6L6 18"></path>
          </svg>{" "}
        </button>{" "}
        <video
          id="tsc-video-el"
          controls
          preload="none"
          playsInline
          data-src-sd="/wp-content/uploads/clinic-film-720.mp4"
          poster="/wp-content/themes/schoeman-clinic/assets/harley-street-Dy3lk5Zp.jpg"
        >
          <source src="/wp-content/uploads/clinic-film-1080.mp4" type="video/mp4" id="tsc-video-source" />
        </video>
      </div>
    </div>
  );
}
