import { useCallback, useMemo, useState } from 'react'
import { adviceForDay, APPLIANCES } from './lib/appliances'
import { fetchSolarForecast, searchPlaces, type GeocodeHit } from './lib/openMeteo'
import {
  estimateHourlyPower,
  rankPeaks,
  splitByLocalDay,
  type HourEstimate,
} from './lib/solarModel'
import { HourlyChart } from './components/HourlyChart.tsx'

const DEFAULT_LAT = 33.6846
const DEFAULT_LON = -117.8265

export default function App() {
  const [placeQuery, setPlaceQuery] = useState('')
  const [searchHits, setSearchHits] = useState<GeocodeHit[]>([])
  const [selectedPlace, setSelectedPlace] = useState<string>('')

  const [lat, setLat] = useState(String(DEFAULT_LAT))
  const [lon, setLon] = useState(String(DEFAULT_LON))
  const [kWp, setKWp] = useState('8')
  const [performanceRatio, setPerformanceRatio] = useState('0.78')

  const [timezone, setTimezone] = useState('UTC')
  const [estimates, setEstimates] = useState<HourEstimate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [geoStatus, setGeoStatus] = useState<string | null>(null)

  const days = useMemo(() => splitByLocalDay(estimates, timezone), [estimates, timezone])

  const runForecast = useCallback(
    async (latitude: number, longitude: number) => {
      const peakKWp = Number(kWp)
      const pr = Number(performanceRatio)
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        setError('Enter valid latitude and longitude.')
        return
      }
      if (!Number.isFinite(peakKWp) || peakKWp <= 0) {
        setError('System size (kWp) must be a positive number.')
        return
      }
      if (!Number.isFinite(pr) || pr <= 0 || pr > 1) {
        setError('Performance ratio should be between 0 and 1 (e.g. 0.78).')
        return
      }

      setLoading(true)
      setError(null)
      try {
        const forecast = await fetchSolarForecast(latitude, longitude)
        setTimezone(forecast.timezone)
        setEstimates(estimateHourlyPower(forecast, peakKWp, pr))
      } catch (e) {
        setEstimates([])
        setError(e instanceof Error ? e.message : 'Request failed')
      } finally {
        setLoading(false)
      }
    },
    [kWp, performanceRatio],
  )

  const refresh = useCallback(async () => {
    await runForecast(Number(lat), Number(lon))
  }, [lat, lon, runForecast])

  const onSearchPlaces = async () => {
    setError(null)
    try {
      const hits = await searchPlaces(placeQuery)
      setSearchHits(hits)
      if (!hits.length) setError('No places matched. Try another name.')
    } catch (e) {
      setSearchHits([])
      setError(e instanceof Error ? e.message : 'Search failed')
    }
  }

  const pickPlace = (h: GeocodeHit) => {
    const nextLat = String(h.latitude)
    const nextLon = String(h.longitude)
    setLat(nextLat)
    setLon(nextLon)
    const label = [h.name, h.admin1, h.country_code].filter(Boolean).join(', ')
    setSelectedPlace(label)
    setSearchHits([])
    setPlaceQuery('')
    void runForecast(h.latitude, h.longitude)
  }

  const useGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('Geolocation is not available in this browser.')
      return
    }
    setGeoStatus('Locating…')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const la = pos.coords.latitude
        const lo = pos.coords.longitude
        setLat(String(la.toFixed(5)))
        setLon(String(lo.toFixed(5)))
        setSelectedPlace('Your location')
        setGeoStatus(null)
        void runForecast(la, lo)
      },
      () => {
        setGeoStatus('Could not read location. Check browser permissions.')
      },
      { enableHighAccuracy: false, timeout: 12_000 },
    )
  }

  const firstDay = days[0]
  const firstDayHours = firstDay?.hours ?? []
  const peaks = rankPeaks(firstDayHours, 4)
  const advice = adviceForDay(firstDayHours, peaks, timezone)

  return (
    <>
      <header>
        <h1>ZotWatt</h1>
        <p className="lede">
          See when solar is likely strongest at your location, and line up big appliances with those
          hours. Uses Open-Meteo (no API key) for forecast radiation and cloud cover—treat outputs
          as guidance, not meter-accurate.
        </p>
      </header>

      <section className="panel" aria-labelledby="setup-heading">
        <h2 id="setup-heading">Location &amp; system</h2>
        <div className="form-grid">
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="place">Search place</label>
            <div className="row">
              <input
                id="place"
                value={placeQuery}
                onChange={(e) => setPlaceQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && void onSearchPlaces()}
                placeholder="City or address name"
                autoComplete="off"
              />
              <button type="button" className="secondary" onClick={() => void onSearchPlaces()}>
                Search
              </button>
              <button type="button" className="secondary" onClick={useGeolocation}>
                Use my location
              </button>
            </div>
            {searchHits.length > 0 && (
              <ul className="search-results">
                {searchHits.map((h) => (
                  <li key={h.id}>
                    <button type="button" onClick={() => pickPlace(h)}>
                      {[h.name, h.admin1, h.country_code].filter(Boolean).join(', ')}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {geoStatus && <p className="error">{geoStatus}</p>}
          </div>

          <div className="field">
            <label htmlFor="lat">Latitude</label>
            <input
              id="lat"
              inputMode="decimal"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="lon">Longitude</label>
            <input
              id="lon"
              inputMode="decimal"
              value={lon}
              onChange={(e) => setLon(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="kwp">Installed DC capacity (kWp)</label>
            <input id="kwp" inputMode="decimal" value={kWp} onChange={(e) => setKWp(e.target.value)} />
            <small>Nameplate capacity of your array.</small>
          </div>
          <div className="field">
            <label htmlFor="pr">Performance ratio</label>
            <input
              id="pr"
              inputMode="decimal"
              value={performanceRatio}
              onChange={(e) => setPerformanceRatio(e.target.value)}
            />
            <small>Typical all-in losses: 0.72–0.85 (inverter, wiring, soiling, mismatch).</small>
          </div>
        </div>

        <div className="row" style={{ marginTop: '1rem' }}>
          <button type="button" onClick={() => void refresh()} disabled={loading}>
            {loading ? 'Loading…' : estimates.length ? 'Refresh forecast' : 'Load forecast'}
          </button>
          {selectedPlace && <span className="meta">Selected: {selectedPlace}</span>}
        </div>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </section>

      {firstDayHours.length === 0 && !loading && !error && (
        <p className="meta" style={{ marginBottom: '1rem' }}>
          Set your location and system size, then load the forecast to see hourly estimates.
        </p>
      )}

      {firstDayHours.length > 0 && (
        <section className="panel" aria-labelledby="today-heading">
          <div className="results-head">
            <h2 id="today-heading">Today — {firstDay?.label}</h2>
            <span className="meta">TZ: {timezone}</span>
          </div>
          <HourlyChart hours={firstDayHours} timeZone={timezone} title="Estimated AC output (kW)" />
          {peaks.length > 0 && (
            <p className="meta">
              Strongest modeled hours:{' '}
              {peaks.map((p, i) => (
                <span key={p.timeIso}>
                  {new Intl.DateTimeFormat(undefined, {
                    timeZone: timezone,
                    hour: 'numeric',
                    minute: '2-digit',
                  }).format(new Date(p.timeIso))}{' '}
                  (~{p.estimatedKw.toFixed(2)} kW)
                  {i < peaks.length - 1 ? ' · ' : ''}
                </span>
              ))}
            </p>
          )}
        </section>
      )}

      {days.length > 1 && (
        <section className="panel" aria-labelledby="next-heading">
          <h2 id="next-heading">Upcoming days</h2>
          {days.slice(1, 3).map((d) => (
            <HourlyChart
              key={d.dayKey}
              hours={d.hours}
              timeZone={timezone}
              title={d.label}
            />
          ))}
        </section>
      )}

      <section className="panel" aria-labelledby="advice-heading">
        <h2 id="advice-heading">Appliances ({APPLIANCES.length})</h2>
        <p className="meta" style={{ marginTop: '-0.5rem', marginBottom: '1rem' }}>
          Deferrable loads benefit most from solar peaks. Typical power is indicative only.
        </p>
        <ul className="advice-list">
          {advice.map(({ appliance, summary }) => (
            <li key={appliance.id}>
              <strong>{appliance.label}</strong>
              <p>{summary}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
