/** The search dialog. Suggestions come from the catalog in SearchCatalog (site.js). */
export function SearchOverlay() {
  return (
    <div id="tsc-search" className="tsc-search" role="dialog" aria-modal="true" aria-label="Search" aria-hidden="true">
      <div className="tsc-search__backdrop" id="tsc-search-backdrop"></div>
      <div className="tsc-search__panel">
        {" "}
        <button type="button" className="tsc-search__close" id="tsc-search-close" aria-label="Close search">
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
        <div className="tsc-search__inner">
          <form className="tsc-search__form" id="tsc-search-form" role="search" action="/" method="get">
            {" "}
            <input
              type="search"
              name="s"
              className="tsc-search__input"
              id="tsc-search-input"
              placeholder="Type to search the clinic"
              aria-label="Search"
              aria-autocomplete="list"
              aria-controls="tsc-search-suggest"
              aria-expanded="false"
              role="combobox"
              defaultValue=""
              autoComplete="off"
              spellCheck="false"
            />{" "}
            <button type="submit" className="tsc-search__submit" aria-label="Submit search">
              {" "}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="7"></circle>
                <path d="m20 20-3.5-3.5"></path>
              </svg>{" "}
            </button>{" "}
          </form>
          <ul
            className="tsc-search__suggest"
            id="tsc-search-suggest"
            role="listbox"
            aria-label="Suggested pages"
            hidden
          ></ul>
        </div>
      </div>
    </div>
  );
}
