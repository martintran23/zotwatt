import type { HourEstimate } from "../../lib/solarModel";

type Props = {
  hours: HourEstimate[];
  timeZone: string;
  selectedPlace: string;
  kWp: string;
  onOpenSchedule: () => void;
};

function IconBolt({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSun({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <path
        d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconClear({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="56"
      height="56"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <path
        d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconMostlySunny({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="56"
      height="56"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle cx="10" cy="9" r="3.5" fill="currentColor" />
      <path
        d="M10 3.5v1.5M10 14v1.5M4.5 9H6M14 9h1.5M5.93 5.43l1.06 1.06M13.01 12.51l1.06 1.06M5.93 12.57l1.06-1.06M13.01 5.49l1.06-1.06"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M8 19h9a3 3 0 0 0 0-6 3 3 0 0 0-5.65-1A3.5 3.5 0 0 0 8 19z"
        fill="currentColor"
        opacity="0.4"
      />
    </svg>
  );
}

function IconPartlyCloudy({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="56"
      height="56"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M6 18h12a4 4 0 0 0 0-8 4 4 0 0 0-7.75-1.08A5 5 0 0 0 6 18z"
        fill="currentColor"
        opacity="0.35"
      />
      <circle cx="14" cy="10" r="3.5" fill="currentColor" />
    </svg>
  );
}

function IconMostlyCloudy({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="56"
      height="56"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle cx="15" cy="7" r="2.5" fill="currentColor" opacity="0.6" />
      <path
        d="M15 3v1M15 10v1M11 7h1M18 7h1"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M5 19h13a4.5 4.5 0 0 0 0-9 4.5 4.5 0 0 0-8.72-1.21A5 5 0 0 0 5 19z"
        fill="currentColor"
        opacity="0.45"
      />
      <path
        d="M3 19h12a3.5 3.5 0 0 0 0-7 3.5 3.5 0 0 0-6.78-.94A4 4 0 0 0 3 19z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconOvercast({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="56"
      height="56"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M4 17h14a4 4 0 0 0 0-8 4 4 0 0 0-7.75-1.08A5 5 0 0 0 4 17z"
        fill="currentColor"
        opacity="0.4"
      />
      <path
        d="M2 20h14a4 4 0 0 0 0-8 4 4 0 0 0-7.75-1.08A5 5 0 0 0 2 20z"
        fill="currentColor"
      />
    </svg>
  );
}

function WeatherIcon({
  avgCloud,
  className,
}: {
  avgCloud: number;
  className?: string;
}) {
  if (avgCloud < 15) return <IconClear className={className} />;
  if (avgCloud < 35) return <IconMostlySunny className={className} />;
  if (avgCloud < 55) return <IconPartlyCloudy className={className} />;
  if (avgCloud < 75) return <IconMostlyCloudy className={className} />;
  return <IconOvercast className={className} />;
}

function IconOpenNew({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M14 3h7v7M10 14 21 3M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconArrowForward({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M5 12h14m-4-4 4 4-4 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatHourShort(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat(undefined, {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function formatLongDate(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat(undefined, {
    timeZone,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

function computeSolarWindowLabel(
  hours: HourEstimate[],
  timeZone: string,
): string | null {
  if (!hours.length) return null;
  let maxI = 0;
  let maxKw = 0;
  hours.forEach((h, i) => {
    if (h.estimatedKw > maxKw) {
      maxKw = h.estimatedKw;
      maxI = i;
    }
  });
  if (maxKw < 0.02) return null;
  const startI = Math.max(0, maxI - 1);
  const endI = Math.min(hours.length - 1, maxI + 2);
  const a = hours[startI].timeIso;
  const b = hours[endI].timeIso;
  return `${formatHourShort(a, timeZone)} – ${formatHourShort(b, timeZone)}`;
}

function pickChartBars(
  hours: HourEstimate[],
  barCount: number,
): { bars: HourEstimate[]; peakIdx: number } {
  const daylight = hours.filter((h) => h.estimatedKw > 0.02);
  const src = daylight.length >= 3 ? daylight : hours;
  if (!src.length) return { bars: [], peakIdx: 0 };
  const n = src.length;
  const bars: HourEstimate[] = [];
  for (let i = 0; i < barCount; i++) {
    const j = Math.min(n - 1, Math.round((i / (barCount - 1)) * (n - 1)));
    bars.push(src[j]);
  }
  const peakIdx = bars.reduce(
    (bi, h, i, arr) => (h.estimatedKw > arr[bi].estimatedKw ? i : bi),
    0,
  );
  return { bars, peakIdx };
}

function skyLabel(avgCloud: number): string {
  if (avgCloud < 15) return "Clear";
  if (avgCloud < 35) return "Mostly Sunny";
  if (avgCloud < 55) return "Partly Cloudy";
  if (avgCloud < 75) return "Mostly Cloudy";
  if (avgCloud < 90) return "Overcast";
  return "Heavy Overcast";
}

function atmosphereCopy(avgCloud: number): string {
  if (avgCloud < 40) {
    return "Clear skies favor strong midday production. Ideal window for high-draw appliances and EV charging.";
  }
  if (avgCloud < 70) {
    return "High production expected during breaks in cloud cover. Good time for laundry, dishwashers, and other flexible loads.";
  }
  return "Cloudier conditions smooth the curve; watch for brighter hours to batch discretionary usage.";
}

export function TodayGlowDashboard({
  hours,
  timeZone,
  selectedPlace,
  kWp,
  onOpenSchedule,
}: Props) {
  const placeLabel = selectedPlace.trim() || "Your location";
  const dateLine = hours[0] ? formatLongDate(hours[0].timeIso, timeZone) : "—";
  const windowLabel = computeSolarWindowLabel(hours, timeZone);

  const maxKw = hours.length
    ? Math.max(...hours.map((h) => h.estimatedKw), 0.01)
    : 0.01;
  const avgCloud =
    hours.length > 0
      ? Math.round(
          hours.reduce(
            (s, h) => s + (typeof h.cloudPct === "number" ? h.cloudPct : 50),
            0,
          ) / hours.length,
        )
      : 50;
  const sky = skyLabel(avgCloud);

  const mid = Math.floor(hours.length / 2);
  const humSample = hours.find(
    (h, i) => i >= mid && h.humidityPct != null,
  )?.humidityPct;
  const uvSample = hours.find((h, i) => i >= mid && h.uvIndex != null)?.uvIndex;
  const humidityDisplay = humSample != null ? `${Math.round(humSample)}%` : "—";
  const uvDisplay =
    uvSample != null ? `${Math.round(uvSample * 10) / 10}/10` : "—";

  const { bars, peakIdx } = pickChartBars(hours, 9);
  const peakKw = Number(kWp) > 0 ? Number(kWp) : 8;
  const gridIndependent = Math.min(
    95,
    Math.round(52 + (maxKw / Math.max(peakKw, 0.1)) * 18),
  );

  const co2Saved = Math.max(1, Math.round(maxKw * 12));
  const trees = co2Saved / 23.33;
  const panelEfficiency = Math.min(
    99,
    Math.round(88 + (1 - avgCloud / 100) * 10),
  );

  const nB = bars.length;
  const tickIdx =
    nB === 0
      ? ([] as number[])
      : nB === 1
        ? [0]
        : nB === 2
          ? [0, 1]
          : [
              0,
              Math.floor(nB * 0.25),
              Math.floor(nB * 0.5),
              Math.floor(nB * 0.75),
              nB - 1,
            ];
  const tickLabels = tickIdx.map((idx) => {
    const iso = bars[idx]?.timeIso;
    if (!iso) return { idx, label: "—" as string };
    const label = new Intl.DateTimeFormat(undefined, {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(iso));
    return { idx, label };
  });
  const boldTickIdx =
    tickIdx.length > 0
      ? tickIdx.reduce(
          (best, idx) =>
            Math.abs(idx - peakIdx) < Math.abs(best - peakIdx) ? idx : best,
          tickIdx[0]!,
        )
      : -1;

  return (
    <div className="sd-glow">
      <header className="sd-glow__hero">
        <div className="sd-glow__hero-row">
          <div className="sd-glow__hero-titles">
            <span className="sd-glow__kicker">Your Luminous Sanctuary</span>
            <h1 className="sd-glow__title">Today&apos;s Glow</h1>
          </div>
          <div className="sd-glow__hero-meta">
            <p className="sd-glow__place">{placeLabel}</p>
            <p className="sd-glow__date">{dateLine}</p>
          </div>
        </div>
      </header>

      <div className="sd-glow__bento">
        <article className="sd-card sd-card--solar-window">
          <div className="sd-card--solar-window__glow" aria-hidden />
          <div className="sd-card--solar-window__inner">
            <div className="sd-card--solar-window__head">
              <div className="sd-card--solar-window__icon-wrap" aria-hidden>
                <IconBolt className="sd-card--solar-window__bolt" />
              </div>
              <span className="sd-card--solar-window__label">Solar Window</span>
            </div>
            <h2 className="sd-card--solar-window__headline">
              Best time to run appliances today:
              <br />
              <span className="sd-card--solar-window__accent">
                {windowLabel ?? "—"}
              </span>
            </h2>
            <button
              type="button"
              className="sd-btn-pill"
              onClick={onOpenSchedule}
            >
              Schedule Appliances
              <IconArrowForward />
            </button>
          </div>
        </article>

        <article className="sd-card sd-card--atmosphere">
          <div className="sd-card--atmosphere__top">
            <div>
              <p className="sd-card--atmosphere__tag">Atmosphere</p>
              <h3 className="sd-card--atmosphere__sky">{sky}</h3>
            </div>
            <WeatherIcon
              avgCloud={avgCloud}
              className="sd-card--atmosphere__weather-icon"
            />
          </div>
          <div className="sd-card--atmosphere__blurb">
            <p>{atmosphereCopy(avgCloud)}</p>
          </div>
          <div className="sd-card--atmosphere__stats">
            <div className="sd-stat-chip">
              <span className="sd-stat-chip__k">Humidity</span>
              <span className="sd-stat-chip__v">{humidityDisplay}</span>
            </div>
            <div className="sd-stat-chip">
              <span className="sd-stat-chip__k">UV index</span>
              <span className="sd-stat-chip__v">{uvDisplay}</span>
            </div>
          </div>
        </article>

        <section
          className="sd-card sd-card--chart"
          aria-labelledby="sd-chart-title"
        >
          <div className="sd-card--chart__head">
            <div>
              <h3 id="sd-chart-title" className="sd-card--chart__title">
                Solar Intensity Forecast
              </h3>
              <p className="sd-card--chart__sub">
                Real-time prediction for your panels
              </p>
            </div>
            <span className="sd-pill-kw">Kilowatts (kW)</span>
          </div>
          <div
            className="sd-chart"
            role="img"
            aria-label="Solar output by time of day"
          >
            <div className="sd-chart__grid" aria-hidden>
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="sd-chart__bars">
              {bars.map((h, i) => {
                const pct = maxKw > 0 ? (h.estimatedKw / maxKw) * 100 : 8;
                const hPct = Math.max(12, Math.round(pct));
                const isPeak = i === peakIdx;
                return (
                  <div key={`${h.timeIso}-${i}`} className="sd-chart__col">
                    <div
                      className={`sd-chart__bar${isPeak ? " sd-chart__bar--peak" : ""}`}
                      style={{ height: `${hPct}%` }}
                      title={`${h.estimatedKw.toFixed(2)} kW`}
                    />
                    {isPeak && (
                      <div className="sd-chart__sun" aria-hidden>
                        <IconSun className="sd-chart__sun-icon" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="sd-chart__ticks">
              {tickLabels.map(({ idx, label }) => (
                <span
                  key={`tick-${idx}`}
                  className={
                    idx === boldTickIdx && boldTickIdx >= 0
                      ? "sd-chart__ticks--peak"
                      : undefined
                  }
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </section>

        <article className="sd-card sd-card--panels">
          <img
            className="sd-card--panels__img"
            src="/panel-efficiency.png"
            alt="Solar panels in sunlight"
            width={480}
            height={200}
            loading="lazy"
            decoding="async"
          />
          <h4 className="sd-card--panels__title">Panel Efficiency</h4>
          <p className="sd-card--panels__text">
            Your modeled system is operating at about {panelEfficiency}% of
            today&apos;s theoretical peak, based on irradiance and cloud cover
            in the forecast.
          </p>
          <button
            type="button"
            className="sd-link-details"
            onClick={onOpenSchedule}
          >
            View details <IconOpenNew />
          </button>
        </article>

        <article className="sd-card sd-card--eco">
          <div className="sd-card--eco__copy">
            <div className="sd-card--eco__badge">Eco Impact</div>
            <h3 className="sd-card--eco__title">
              You&apos;ve saved {co2Saved} kg of CO₂ this week.
            </h3>
            <p className="sd-card--eco__lead">
              That&apos;s roughly equivalent to planting{" "}
              <strong>{trees.toFixed(1)}</strong> young trees in your
              neighborhood (illustrative).
            </p>
          </div>
          <div className="sd-card--eco__gauge" aria-hidden>
            <div className="sd-card--eco__gauge-inner">
              <span className="sd-card--eco__pct">{gridIndependent}%</span>
              <span className="sd-card--eco__pct-label">Grid independent</span>
            </div>
          </div>
        </article>
      </div>

      <footer className="sd-glow__footer">
        <div className="sd-glow__footer-brand">SolarShift</div>
        <nav className="sd-glow__footer-links" aria-label="Legal">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact Support</a>
        </nav>
        <p className="sd-glow__footer-copy">
          © {new Date().getFullYear()} SolarShift. Nurturing your digital
          ecosystem.
        </p>
      </footer>
    </div>
  );
}
