import type { AddressSuggestion } from "../lib/addressAutocomplete";
import { isPostalOnlyQuery } from "../lib/placeQueryPolicy";
import { AddressSearchBar } from "../components/AddressSearchBar.tsx";

type Props = {
  placeQuery: string;
  onPlaceQueryChange: (q: string) => void;
  welcomeEmail: string;
  onWelcomeEmailChange: (email: string) => void;
  onSubmitSearch: () => void;
  onGeolocation: () => void;
  loading: boolean;
  geoStatus: string | null;
  error: string | null;
  suggestBusy: boolean;
  searchHits: AddressSuggestion[];
  showSuggestDropdown: boolean;
  showSuggestEmpty: boolean;
  onPickSuggestion: (s: AddressSuggestion) => void;
  onBrandClick: () => void;
};

function IconCheck() {
  return (
    <svg
      className="ss-trust__icon"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HeroDecor() {
  return (
    <div className="ss-hero__decor" aria-hidden>
      <div className="ss-hero__glow" />
      <svg className="ss-hero__sun" viewBox="0 0 120 120" fill="none">
        <circle
          cx="60"
          cy="60"
          r="28"
          fill="var(--zw-primary)"
          opacity="0.98"
        />
        <circle
          cx="60"
          cy="60"
          r="36"
          stroke="var(--zw-primary)"
          strokeWidth="2"
          strokeDasharray="6 8"
          opacity="0.22"
        />
        <circle
          cx="60"
          cy="60"
          r="46"
          stroke="var(--zw-primary)"
          strokeWidth="1.5"
          strokeDasharray="4 10"
          opacity="0.12"
        />
        <circle
          cx="60"
          cy="60"
          r="56"
          stroke="var(--zw-primary)"
          strokeWidth="1"
          strokeDasharray="3 12"
          opacity="0.08"
        />
      </svg>
      <svg
        className="ss-hero__wave"
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M0 115 C 220 55, 440 165, 720 95 C 1000 35, 1220 145, 1440 75 L 1440 220 L 0 220 Z"
          fill="var(--zw-secondary-soft)"
          opacity="0.92"
        />
        <path
          d="M0 135 C 300 70, 520 175, 780 105 C 1040 48, 1260 158, 1440 95 L 1440 220 L 0 220 Z"
          fill="rgb(135 206 235 / 0.42)"
        />
      </svg>
    </div>
  );
}

export function AddressWelcome({
  placeQuery,
  onPlaceQueryChange,
  welcomeEmail,
  onWelcomeEmailChange,
  onSubmitSearch,
  onGeolocation,
  loading,
  geoStatus,
  error,
  suggestBusy,
  searchHits,
  showSuggestDropdown,
  showSuggestEmpty,
  onPickSuggestion,
  onBrandClick,
}: Props) {
  const emailError =
    error === "Enter a valid email, then run your forecast." ? error : null;
  const addressError =
    error === "Enter a city and state, or use your location." ||
    error === "No places matched. Try a nearby city or spelling."
      ? error
      : null;
  const formError =
    error && error !== emailError && error !== addressError ? error : null;

  return (
    <div className="ss-landing">
      <header className="ss-header ss-header--minimal">
        <button
          type="button"
          className="ss-header__logo ss-header__logo--btn"
          onClick={onBrandClick}
          aria-label="Jump to address search"
        >
          WattTime
        </button>
      </header>

      <section className="ss-hero">
        <HeroDecor />
        <div className="ss-hero__inner">
          <p className="ss-hero__badge">
            <span className="ss-hero__badge-emoji" aria-hidden>
              🌱
            </span>{" "}
            Smart Solar Scheduling
          </p>
          <h1 className="ss-hero__title">
            Optimize Your Home{" "}
            <span className="ss-hero__title-accent">Around the Sun.</span>
          </h1>
          <p className="ss-hero__sub">
            Personalized solar forecasts that tell you the best times to use
            energy based on your home's solar generation, saving money and the
            environment.
          </p>

          <div className="ss-form-card">
            <div className="address-stack ss-form-card__stack">
              <AddressSearchBar
                id="ss-address"
                value={placeQuery}
                onChange={onPlaceQueryChange}
                onSubmit={() => void onSubmitSearch()}
                onGeolocation={onGeolocation}
                disabled={loading}
                placeholder="City, state, or address (e.g. Irvine, CA)"
              />
              {addressError && (
                <p
                  className="zw-error ss-form-card__address-error"
                  role="alert"
                >
                  {addressError}
                </p>
              )}

              {showSuggestDropdown && (
                <ul
                  className="search-results"
                  role="listbox"
                  aria-label="Place suggestions"
                >
                  {suggestBusy && searchHits.length === 0 && (
                    <li className="search-results__hint" role="status">
                      Searching places…
                    </li>
                  )}
                  {showSuggestEmpty && (
                    <li className="search-results__hint">
                      {isPostalOnlyQuery(placeQuery.trim())
                        ? "No cities found for that postal code. Try another code or type a city and state."
                        : "No matching places. Try another spelling."}
                    </li>
                  )}
                  {searchHits.map((s) => (
                    <li key={s.source === "aws" ? s.placeId : `om-${s.id}`}>
                      <button
                        type="button"
                        role="option"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => void onPickSuggestion(s)}
                        disabled={loading}
                      >
                        {s.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="ss-field ss-form-card__email">
              <label htmlFor="ss-email">Email address</label>
              <input
                id="ss-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="your@email.com"
                value={welcomeEmail}
                onChange={(e) => onWelcomeEmailChange(e.target.value)}
                disabled={loading}
              />
              {emailError && (
                <p className="zw-error ss-form-card__email-error" role="alert">
                  {emailError}
                </p>
              )}
            </div>

            <button
              type="button"
              className="ss-cta"
              onClick={() => void onSubmitSearch()}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="zw-loading-spinner zw-loading-spinner--light"
                    aria-hidden
                  />
                  Loading forecast…
                </>
              ) : (
                <>
                  Get My Solar Forecast
                  <span aria-hidden> →</span>
                </>
              )}
            </button>

            <p className="ss-form-hint">
              Use the pin to save your location, enter your email, then tap Get
              My Solar Forecast. Suggestions appear as you type. Forecast uses
              Open‑Meteo; results are estimates only.
            </p>
          </div>

          <div className="ss-trust">
            <span className="ss-trust__item">
              <IconCheck /> Reduce Carbon Footprint
            </span>
            <span className="ss-trust__item">
              <IconCheck /> Reduce Energy Bills
            </span>
            <span className="ss-trust__item">
              <IconCheck /> Reduce Grid Dependence
            </span>
          </div>

          {geoStatus && (
            <p
              className={
                geoStatus.startsWith("Could not")
                  ? "zw-error ss-landing__alert"
                  : "ss-geo-status"
              }
              role="status"
            >
              {geoStatus}
            </p>
          )}

          {formError && (
            <p className="zw-error ss-landing__alert" role="alert">
              {formError}
            </p>
          )}
        </div>
      </section>

      <div id="ss-features" className="ss-spotlight">
        <article className="ss-feature-card ss-feature-card--split">
          <div className="ss-feature-card__copy">
            <div className="ss-feature-card__icon" aria-hidden>
              ✦
            </div>
            <h2>AI-Powered Insights</h2>
            <p>
              We analyze millions of data points to predict the exact moment
              your home can be most efficient, so you can align flexible loads
              with peak solar.
            </p>
          </div>
          <div className="ss-feature-card__figure" aria-hidden>
            <img
              className="ss-feature-card__img"
              src="/sms-house.png"
              alt=""
              width={480}
              height={320}
              loading="lazy"
            />
          </div>
        </article>
        <article className="ss-feature-card ss-feature-card--stat">
          <div className="ss-feature-stat">21%</div>
          <p className="ss-feature-stat__copy">
            Projected U.S. solar generation growth in 2026, according to the
            EIA. As midday solar expands, shifting flexible usage into
            solar-rich hours can become more valuable on time-based rates.
          </p>
          <a
            className="ss-feature-link"
            href="https://www.energy.gov/energysaver/reducing-electricity-use-and-costs"
            target="_blank"
            rel="noreferrer"
          >
            Learn more ↗
          </a>
        </article>
        <section id="ss-why" className="ss-wide-card">
          <div className="ss-wide-card__copy">
            <div className="ss-wide-card__icon" aria-hidden>
              $
            </div>
            <h2>Estimated savings, made visible</h2>
            <p className="ss-wide-card__lead">
              Shift flexible loads into your strongest solar hours and you could
              trim an estimated 8-15% from the grid power those tasks would
              otherwise use, depending on your rate plan, panel output, and
              appliance timing.
            </p>
          </div>
          <div className="ss-wide-card__visual">
            <img
              className="ss-wide-card__img"
              src="/panel-efficiency.png"
              alt="Preview of a solar savings dashboard with bill savings and efficiency metrics"
              width={480}
              height={280}
              loading="lazy"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
