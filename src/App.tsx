import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AddressSearchBar } from './components/AddressSearchBar.tsx'
import {
  fetchAddressSuggestions,
  isAwsAutocompleteEnabled,
  resolveAddressSuggestion,
  type AddressSuggestion,
} from './lib/addressAutocomplete'
import { isPostalOnlyQuery } from './lib/placeQueryPolicy'
import { adviceForDay, APPLIANCES } from './lib/appliances'
import { fetchSolarForecast } from './lib/openMeteo'
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
  const [searchHits, setSearchHits] = useState<AddressSuggestion[]>([])
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
  const [suggestBusy, setSuggestBusy] = useState(false)
  const [suggestLastResolvedQuery, setSuggestLastResolvedQuery] = useState('')
  const suggestGen = useRef(0)
  const suggestFetchId = useRef(0)

  const days = useMemo(() => splitByLocalDay(estimates, timezone), [estimates, timezone])

  const SUGGEST_MIN_CHARS = 2
  const SUGGEST_DEBOUNCE_MS = 320

  useEffect(() => {
    const q = placeQuery.trim()
    if (q.length < SUGGEST_MIN_CHARS) {
      suggestGen.current += 1
      suggestFetchId.current += 1
      const clearId = window.setTimeout(() => {
        setSearchHits([])
        setSuggestBusy(false)
        setSuggestLastResolvedQuery('')
      }, 0)
      return () => window.clearTimeout(clearId)
    }

    const gen = ++suggestGen.current
    let cancelled = false
    const timer = window.setTimeout(async () => {
      const fid = ++suggestFetchId.current
      if (isPostalOnlyQuery(q)) {
        setSearchHits([])
        setSuggestLastResolvedQuery(q)
        setSuggestBusy(false)
        return
      }
      setSuggestBusy(true)
      try {
        const hits = await fetchAddressSuggestions(q)
        if (cancelled || gen !== suggestGen.current) return
        setSearchHits(hits)
        setSuggestLastResolvedQuery(q)
      } catch {
        if (cancelled || gen !== suggestGen.current) return
        setSearchHits([])
        setSuggestLastResolvedQuery(q)
      } finally {
        if (fid === suggestFetchId.current) setSuggestBusy(false)
      }
    }, SUGGEST_DEBOUNCE_MS)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [placeQuery])

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

  const completeWithSuggestion = useCallback(
    async (s: AddressSuggestion) => {
      setSearchHits([])
      setError(null)
      try {
        const { latitude, longitude, label } = await resolveAddressSuggestion(s)
        setLat(String(latitude))
        setLon(String(longitude))
        setSelectedPlace(label)
        const ok = await runForecast(latitude, longitude)
        if (ok) {
          setPlaceQuery('')
          setScreen('report')
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not resolve this place.')
      }
    },
    [runForecast],
  )

  const submitAddressSearch = async () => {
    setGeoStatus(null)
    const q = placeQuery.trim()
    if (!q) {
      setError('Enter a city and state, or use your location.')
      return
    }
    if (isPostalOnlyQuery(q)) {
      setSearchHits([])
      setError('Use a city and state, not a postal or ZIP code.')
      return
    }
    setError(null)
    try {
      const suggestions = await fetchAddressSuggestions(q)
      if (!suggestions.length) {
        setSearchHits([])
        setError('No places matched. Try a nearby city or spelling.')
        return
      }
      if (suggestions.length === 1) {
        await completeWithSuggestion(suggestions[0])
        return
      }
      setSearchHits(suggestions)
    } catch (e) {
      setSearchHits([])
      setError(e instanceof Error ? e.message : 'Search failed')
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

  const trimmedQuery = placeQuery.trim()
  const showSuggestEmpty =
    trimmedQuery.length >= SUGGEST_MIN_CHARS &&
    !suggestBusy &&
    searchHits.length === 0 &&
    suggestLastResolvedQuery === trimmedQuery
  const showSuggestDropdown =
    trimmedQuery.length >= SUGGEST_MIN_CHARS &&
    (suggestBusy || searchHits.length > 0 || showSuggestEmpty)

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

        <div className="address-stack">
          <AddressSearchBar
            id="address"
            value={placeQuery}
            onChange={setPlaceQuery}
            onSubmit={() => void submitAddressSearch()}
            onGeolocation={useGeolocation}
            disabled={loading}
            placeholder="City and state (e.g. Irvine, CA)"
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
                  {isPostalOnlyQuery(trimmedQuery)
                    ? 'ZIP and postal codes are not accepted. Enter a city and state.'
                    : 'No matching places. Try another spelling.'}
                </li>
              )}
              {searchHits.map((s) => (
                <li key={s.source === 'aws' ? s.placeId : `om-${s.id}`}>
                  <button
                    type="button"
                    role="option"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => void completeWithSuggestion(s)}
                    disabled={loading}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {loading && (
          <p className="loading-banner" role="status">
            Loading…
          </p>
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
          <strong>City and state</strong> or city name—not ZIP or postal codes. Suggestions from 2+ characters
          {isAwsAutocompleteEnabled() ? ' (Amazon Location)' : ' (Open‑Meteo)'}
          . Press <strong>Enter</strong> to search. Solar forecast from Open‑Meteo—estimates only, not meter-grade.
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
