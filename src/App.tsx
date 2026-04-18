import { useCallback, useMemo, useState } from 'react'
import { AddressSearchBar } from './components/AddressSearchBar.tsx'
import { adviceForDay, APPLIANCES } from './lib/appliances'
import { fetchSolarForecast, searchPlaces, type GeocodeHit } from './lib/openMeteo'
import {
  estimateHourlyPower,
  rankPeaks,
  splitByLocalDay,
  type HourEstimate,
} from './lib/solarModel'
import { HourlyChart } from './components/HourlyChart.tsx'

type Screen = 'address' | 'report'

function IconBack() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 18l-6-6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('address')
  const [placeQuery, setPlaceQuery] = useState('')
  const [searchHits, setSearchHits] = useState<GeocodeHit[]>([])
  const [selectedPlace, setSelectedPlace] = useState<string>('')

  const [lat, setLat] = useState('')
  const [lon, setLon] = useState('')
  const [kWp, setKWp] = useState('8')
  const [performanceRatio, setPerformanceRatio] = useState('0.78')

  const [timezone, setTimezone] = useState('UTC')
  const [estimates, setEstimates] = useState<HourEstimate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [geoStatus, setGeoStatus] = useState<string | null>(null)

  const days = useMemo(() => splitByLocalDay(estimates, timezone), [estimates, timezone])

  const runForecast = useCallback(
    async (latitude: number, longitude: number): Promise<boolean> => {
      const peakKWp = Number(kWp)
      const pr = Number(performanceRatio)
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        setError('Could not resolve a valid location.')
        return false
      }
      if (!Number.isFinite(peakKWp) || peakKWp <= 0) {
        setError('System size (kWp) must be a positive number.')
        return false
      }
      if (!Number.isFinite(pr) || pr <= 0 || pr > 1) {
        setError('Performance ratio should be between 0 and 1 (e.g. 0.78).')
        return false
      }

      setLoading(true)
      setError(null)
      try {
        const forecast = await fetchSolarForecast(latitude, longitude)
        setTimezone(forecast.timezone)
        setEstimates(estimateHourlyPower(forecast, peakKWp, pr))
        return true
      } catch (e) {
        setEstimates([])
        setError(e instanceof Error ? e.message : 'Request failed')
        return false
      } finally {
        setLoading(false)
      }
    },
    [kWp, performanceRatio],
  )

  const completeWithPlace = useCallback(
    async (h: GeocodeHit) => {
      setLat(String(h.latitude))
      setLon(String(h.longitude))
      const label = [h.name, h.admin1, h.country_code].filter(Boolean).join(', ')
      setSelectedPlace(label)
      setSearchHits([])
      const ok = await runForecast(h.latitude, h.longitude)
      if (ok) {
        setPlaceQuery('')
        setScreen('report')
      }
    },
    [runForecast],
  )

  const submitAddressSearch = async () => {
    setGeoStatus(null)
    const q = placeQuery.trim()
    if (!q) {
      setError('Enter an address or city, or use your location.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const hits = await searchPlaces(q)
      if (!hits.length) {
        setSearchHits([])
        setError('No places matched. Try a nearby city or spelling.')
        return
      }
      if (hits.length === 1) {
        await completeWithPlace(hits[0])
        return
      }
      setSearchHits(hits)
    } catch (e) {
      setSearchHits([])
      setError(e instanceof Error ? e.message : 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  const useGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('Geolocation is not available in this browser.')
      return
    }
    setGeoStatus(null)
    setError(null)
    setGeoStatus('Locating…')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const la = pos.coords.latitude
        const lo = pos.coords.longitude
        setLat(String(la.toFixed(5)))
        setLon(String(lo.toFixed(5)))
        setSelectedPlace('Your location')
        setGeoStatus(null)
        const ok = await runForecast(la, lo)
        if (ok) setScreen('report')
      },
      () => {
        setGeoStatus('Could not read location. Check browser permissions.')
      },
      { enableHighAccuracy: false, timeout: 12_000 },
    )
  }

  const goBackToAddress = () => {
    setScreen('address')
    setEstimates([])
    setError(null)
    setSearchHits([])
    if (selectedPlace && selectedPlace !== 'Your location') {
      setPlaceQuery(selectedPlace)
    }
  }

  const refreshReport = useCallback(async () => {
    const latitude = Number(lat)
    const longitude = Number(lon)
    await runForecast(latitude, longitude)
  }, [lat, lon, runForecast])

  const firstDay = days[0]
  const firstDayHours = firstDay?.hours ?? []
  const peaks = rankPeaks(firstDayHours, 4)
  const advice = adviceForDay(firstDayHours, peaks, timezone)

  if (screen === 'address') {
    return (
      <div className="welcome">
        <div className="welcome__brand">
          <div className="welcome__logo" aria-hidden>
            ZW
          </div>
          <h1 className="welcome__title">ZotWatt</h1>
          <p className="welcome__tagline">
            Plan flexible loads around forecast sunshine, built with an Anteater-spirit nod to campus
            and community.
          </p>
        </div>

        <AddressSearchBar
          id="address"
          value={placeQuery}
          onChange={setPlaceQuery}
          onSubmit={() => void submitAddressSearch()}
          onGeolocation={useGeolocation}
          disabled={loading}
          placeholder="City, neighborhood, or address"
        />

        {loading && (
          <p className="loading-banner" role="status">
            Loading…
          </p>
        )}

        {searchHits.length > 0 && (
          <ul className="search-results">
            {searchHits.map((h) => (
              <li key={h.id}>
                <button
                  type="button"
                  onClick={() => void completeWithPlace(h)}
                  disabled={loading}
                >
                  {[h.name, h.admin1, h.country_code].filter(Boolean).join(', ')}
                </button>
              </li>
            ))}
          </ul>
        )}

        {geoStatus && (
          <p className={geoStatus.startsWith('Could not') ? 'error' : 'loading-banner'} role="status">
            {geoStatus}
          </p>
        )}

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <p className="welcome__hint">
          Press <strong>Enter</strong> or the arrow to search. Forecast uses Open‑Meteo (radiation &
          clouds); results are estimates, not meter‑grade.
        </p>
      </div>
    )
  }

  return (
    <div className="report">
      <div className="report__top">
        <button type="button" className="btn-back" onClick={goBackToAddress}>
          <IconBack />
          Back
        </button>
        <p className="report__location">
          Location: <strong>{selectedPlace || '-'}</strong>
        </p>
      </div>

      <h1 className="report__title">Solar outlook &amp; appliance tips</h1>

      <section className="panel panel--system" aria-labelledby="system-heading">
        <h2 id="system-heading">Your system</h2>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="kwp">DC capacity (kWp)</label>
            <input id="kwp" inputMode="decimal" value={kWp} onChange={(e) => setKWp(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="pr">Performance ratio</label>
            <input
              id="pr"
              inputMode="decimal"
              value={performanceRatio}
              onChange={(e) => setPerformanceRatio(e.target.value)}
            />
            <small>Typical range ~0.72–0.85 (losses).</small>
          </div>
        </div>
        <div className="row" style={{ marginTop: '1rem' }}>
          <button type="button" className="btn-primary" onClick={() => void refreshReport()} disabled={loading}>
            {loading ? 'Updating…' : 'Update forecast'}
          </button>
        </div>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </section>

      {firstDayHours.length > 0 && (
        <section className="panel" aria-labelledby="today-heading">
          <div className="results-head">
            <h2 id="today-heading">Today: {firstDay?.label}</h2>
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
            <HourlyChart key={d.dayKey} hours={d.hours} timeZone={timezone} title={d.label} />
          ))}
        </section>
      )}

      <section className="panel" aria-labelledby="advice-heading">
        <h2 id="advice-heading">Appliances ({APPLIANCES.length})</h2>
        <p className="meta" style={{ marginTop: '-0.5rem', marginBottom: '1rem' }}>
          Deferrable loads gain the most from peak solar. Typical power is indicative only.
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
    </div>
  )
}
