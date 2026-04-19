import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  fetchAddressSuggestions,
  isAwsAutocompleteEnabled,
  resolveAddressSuggestion,
  type AddressSuggestion,
} from './lib/addressAutocomplete'
import { estimateHourlyPower, rankPeaks, splitByLocalDay, type HourEstimate } from './lib/solarModel'
import { fetchSolarForecast } from './lib/openMeteo'
import { DashboardShell, type Tab } from './dashboard/DashboardShell.tsx'
import { FlowTab } from './dashboard/FlowTab.tsx'
import { ForecastTab } from './dashboard/ForecastTab.tsx'
import { ScheduleTab } from './dashboard/ScheduleTab.tsx'
import { ImpactTab } from './dashboard/ImpactTab.tsx'
import { SmsTab } from './dashboard/SmsTab.tsx'
import { LocationModal } from './dashboard/LocationModal.tsx'
import { AddressWelcome } from './dashboard/AddressWelcome.tsx'

type Phase = 'address' | 'dashboard'

export default function App() {
  const [phase, setPhase] = useState<Phase>('address')
  const [tab, setTab] = useState<Tab>('flow')
  const [locationOpen, setLocationOpen] = useState(false)

  const [placeQuery, setPlaceQuery] = useState('')
  const [searchHits, setSearchHits] = useState<AddressSuggestion[]>([])
  const [selectedPlace, setSelectedPlace] = useState('')

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
          setLocationOpen(false)
          setPhase('dashboard')
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
      setError('Enter your city and state, or use your location.')
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
        if (ok) {
          setPlaceQuery('')
          setLocationOpen(false)
          setPhase('dashboard')
        }
      },
      () => {
        setGeoStatus('Could not read location. Check browser permissions.')
      },
      { enableHighAccuracy: false, timeout: 12_000 },
    )
  }

  const goBackToAddress = useCallback(() => {
    setPhase('address')
    setTab('flow')
    setEstimates([])
    setError(null)
    setSearchHits([])
    setLocationOpen(false)
    if (selectedPlace && selectedPlace !== 'Your location') {
      setPlaceQuery(selectedPlace)
    } else {
      setPlaceQuery('')
    }
  }, [selectedPlace])

  const refreshReport = useCallback(async () => {
    const latitude = Number(lat)
    const longitude = Number(lon)
    await runForecast(latitude, longitude)
  }, [lat, lon, runForecast])

  const firstDay = days[0]
  const firstDayHours = firstDay?.hours ?? []
  const peaks = rankPeaks(firstDayHours, 4)
  const peakLabel =
    peaks[0] != null
      ? new Intl.DateTimeFormat(undefined, {
          timeZone: timezone,
          hour: 'numeric',
          minute: '2-digit',
        }).format(new Date(peaks[0].timeIso))
      : '—'

  const trimmedQuery = placeQuery.trim()
  const showSuggestEmpty =
    trimmedQuery.length >= SUGGEST_MIN_CHARS &&
    !suggestBusy &&
    searchHits.length === 0 &&
    suggestLastResolvedQuery === trimmedQuery
  const showSuggestDropdown =
    trimmedQuery.length >= SUGGEST_MIN_CHARS &&
    (suggestBusy || searchHits.length > 0 || showSuggestEmpty)

  const suggestHint = `Suggestions appear as you type (${SUGGEST_MIN_CHARS}+ characters)${
    isAwsAutocompleteEnabled() ? ' using Amazon Location autocomplete' : ' using Open‑Meteo place search'
  }. Press Enter or the arrow to search the current text. Forecast uses Open‑Meteo radiation and clouds; results are estimates, not meter‑grade.`

  if (phase === 'address') {
    return (
      <AddressWelcome
        placeQuery={placeQuery}
        onPlaceQueryChange={setPlaceQuery}
        onSubmitSearch={() => void submitAddressSearch()}
        onGeolocation={useGeolocation}
        loading={loading}
        geoStatus={geoStatus}
        error={error}
        suggestBusy={suggestBusy}
        searchHits={searchHits}
        showSuggestDropdown={showSuggestDropdown}
        showSuggestEmpty={showSuggestEmpty}
        onPickSuggestion={(s) => void completeWithSuggestion(s)}
      />
    )
  }

  const main =
    loading && estimates.length === 0 ? (
      <p className="zw-muted-small" role="status">
        Loading forecast…
      </p>
    ) : tab === 'flow' ? (
      <FlowTab hours={firstDayHours} timeZone={timezone} peakLabel={peakLabel} />
    ) : tab === 'forecast' ? (
      <ForecastTab days={days} timeZone={timezone} peaks={peaks} />
    ) : tab === 'schedule' ? (
      <ScheduleTab
        selectedPlace={selectedPlace}
        kWp={kWp}
        performanceRatio={performanceRatio}
        onKwp={setKWp}
        onPr={setPerformanceRatio}
        onRefresh={() => void refreshReport()}
        loading={loading}
        error={error}
        onReturnToAddress={goBackToAddress}
      />
    ) : tab === 'impact' ? (
      <ImpactTab days={days} />
    ) : (
      <SmsTab />
    )

  return (
    <>
      <DashboardShell
        active={tab}
        onTab={setTab}
        onFab={() => setLocationOpen(true)}
        onSms={() => setTab('sms')}
      >
        {main}
      </DashboardShell>

      <LocationModal
        open={locationOpen}
        onClose={() => setLocationOpen(false)}
        placeQuery={placeQuery}
        onPlaceQueryChange={setPlaceQuery}
        onSubmitSearch={() => void submitAddressSearch()}
        onGeolocation={useGeolocation}
        loading={loading}
        geoStatus={geoStatus}
        error={error}
        suggestBusy={suggestBusy}
        searchHits={searchHits}
        showSuggestDropdown={showSuggestDropdown}
        showSuggestEmpty={showSuggestEmpty}
        onPickSuggestion={(s) => void completeWithSuggestion(s)}
        suggestHint={suggestHint}
      />
    </>
  )
}
