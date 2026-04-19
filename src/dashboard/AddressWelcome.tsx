import { AddressSearchBar } from '../components/AddressSearchBar.tsx'
import type { AddressSuggestion } from '../lib/addressAutocomplete'

type Props = {
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

export function AddressWelcome({
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
  return (
    <div className="zw-welcome">
      <div className="zw-welcome__brand">
        <div className="zw-welcome__logo" aria-hidden>
          ZW
        </div>
        <h1 className="zw-welcome__title">ZotWatt</h1>
        <p className="zw-welcome__tagline">
          Plan flexible loads around forecast sunshine. Enter where your system lives to load modeled solar for that
          spot.
        </p>
      </div>

      <div className="address-stack">
        <AddressSearchBar
          id="welcome-address"
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

      {loading && (
        <p className="zw-welcome__status" role="status">
          Loading…
        </p>
      )}

      {geoStatus && (
        <p
          className={geoStatus.startsWith('Could not') ? 'zw-error' : 'zw-welcome__status'}
          role="status"
        >
          {geoStatus}
        </p>
      )}

      {error && (
        <p className="zw-error" role="alert">
          {error}
        </p>
      )}

      <p className="zw-welcome__hint">{suggestHint}</p>
    </div>
  )
}
