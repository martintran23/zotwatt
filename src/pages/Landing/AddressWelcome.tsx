import { useRef } from "react";
import type { AddressSuggestion } from "../../lib/addressAutocomplete.ts";
import { AddressSearchBar } from "../../components/AddressSearchBar.tsx";

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
}: Props) {
  const heroRef = useRef<HTMLElement | null>(null);
  const scrollToHero = () => {
    heroRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="ss-landing">
      <header className="ss-header">
        <button
          type="button"
          className="ss-header__logo"
          onClick={scrollToHero}
        >
          SolarShift
        </button>
      </header>

      <section ref={heroRef} className="ss-hero">
        <HeroDecor />
        <div className="ss-hero__inner">
          <p className="ss-hero__badge">
            <span className="ss-hero__badge-emoji" aria-hidden>
              🌱
            </span>{" "}
            Nurturing your digital ecosystem
          </p>
          <h1 className="ss-hero__title">
            Optimize Your Home{" "}
            <span className="ss-hero__title-accent">for the Sun.</span>
          </h1>
          <p className="ss-hero__sub">
            Personalized solar forecasts designed to help you transition from
            managing a utility to nurturing a sustainable sanctuary.
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
                      No matching places. Try another spelling.
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
            </div>

            <button
              type="button"
              className="ss-cta"
              onClick={() => void onSubmitSearch()}
              disabled={loading}
            >
              {loading ? "Loading forecast…" : "Get My Solar Forecast"}
              {!loading && <span aria-hidden> →</span>}
            </button>

            <p className="ss-form-hint">
              Use the pin to save your location, enter your email, then tap Get
              My Solar Forecast. Suggestions appear as you type. Forecast uses
              Open‑Meteo; results are estimates only.
            </p>
          </div>

          <div className="ss-trust">
            <span className="ss-trust__item">
              <IconCheck /> Secure data
            </span>
            <span className="ss-trust__item">
              <IconCheck /> 100% green energy
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

          {error && (
            <p className="zw-error ss-landing__alert" role="alert">
              {error}
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
              your home can be most efficient—so you can align flexible loads
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
          <div className="ss-feature-stat">30%</div>
          <p className="ss-feature-stat__copy">
            Average reduction in energy costs for SolarShift members who shift
            usage to solar peaks.
          </p>
          <button type="button" className="ss-feature-link">
            Learn more ↗
          </button>
        </article>
        <section id="ss-why" className="ss-wide-card">
          <div className="ss-wide-card__copy">
            <h2>Live monitoring</h2>
            <p className="ss-wide-card__lead">
              Real-time data visualization that feels like nature. Watch your
              home&apos;s energy flow through beautiful, organic waves.
            </p>
          </div>
          <div
            className="ss-wide-card__visual"
            role="img"
            aria-label="Preview placeholder"
          >
            <span>Coming soon: Energy flow view</span>
          </div>
        </section>
      </div>

      <footer className="ss-footer">
        <div className="ss-footer__brand">SolarShift</div>
        <nav className="ss-footer__links" aria-label="Legal">
          <a href="#ss-why">Privacy policy</a>
          <a href="#ss-why">Terms of service</a>
          <a href="#ss-why">Contact support</a>
        </nav>
        <p className="ss-footer__copy">
          © {new Date().getFullYear()} SolarShift. Nurturing your digital
          ecosystem.
        </p>
      </footer>
    </div>
  );
}
