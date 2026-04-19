import { AddressSearchBar } from '../components/AddressSearchBar.tsx'
import type { AddressSuggestion } from '../lib/addressAutocomplete'

type Props = {
  open: boolean
  onClose: () => void
  placeQuery: string
  onPlaceQueryChange: (q: string) => void
  onSubmitSearch: () => void
  onGeolocation: () => void
  loading: boolean
  geoStatus: string | null
  error: string | null
  suggestBusy: boolean
  searchHits: AddressSuggestion[]
  showSuggestDropdown: boolean
  showSuggestEmpty: boolean
  onPickSuggestion: (s: AddressSuggestion) => void
  suggestHint: string
}

export function LocationModal({
  open,
  onClose,
  placeQuery,
  onPlaceQueryChange,
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
  suggestHint,
}: Props) {
  if (!open) return null

  return (
    <div
      className="zw-modal-back"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="zw-modal" role="dialog" aria-labelledby="loc-modal-title" aria-modal="true">
        <h2 id="loc-modal-title">Set location</h2>
        <p className="zw-muted-small" style={{ marginTop: 0 }}>
          Search for a place or use your current position. Forecast updates use Open‑Meteo.
        </p>

        <div className="address-stack">
          <AddressSearchBar
            id="loc-modal-address"
            value={placeQuery}
            onChange={onPlaceQueryChange}
            onSubmit={() => void onSubmitSearch()}
            onGeolocation={onGeolocation}
            disabled={loading}
            placeholder="City, neighborhood, or address"
          />

          {showSuggestDropdown && (
            <ul className="search-results" role="listbox" aria-label="Place suggestions">
              {suggestBusy && searchHits.length === 0 && (
                <li className="search-results__hint" role="status">
                  Searching places…
                </li>
              )}
              {showSuggestEmpty && (
                <li className="search-results__hint">No matching places. Try another spelling.</li>
              )}
              {searchHits.map((s) => (
                <li key={s.source === 'aws' ? s.placeId : `om-${s.id}`}>
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

        {geoStatus && (
          <p className={geoStatus.startsWith('Could not') ? 'zw-error' : 'zw-muted-small'} role="status">
            {geoStatus}
          </p>
        )}
        {error && (
          <p className="zw-error" role="alert">
            {error}
          </p>
        )}

        <p className="zw-muted-small">{suggestHint}</p>

        <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
          <button type="button" className="zw-btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
