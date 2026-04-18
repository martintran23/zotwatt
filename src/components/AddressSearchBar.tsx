type Props = {
  id: string
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onGeolocation: () => void
  disabled?: boolean
  placeholder?: string
}

function IconLocation({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s7-4.35 7-10a7 7 0 1 0-14 0c0 5.65 7 10 7 10z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11" r="2.25" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  )
}

function IconArrowEnter({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 12h12m0 0-4-4m4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function AddressSearchBar({
  id,
  value,
  onChange,
  onSubmit,
  onGeolocation,
  disabled,
  placeholder = 'Enter city or address',
}: Props) {
  return (
    <div className="address-bar">
      <button
        type="button"
        className="address-bar__geo"
        onClick={onGeolocation}
        disabled={disabled}
        aria-label="Use my current location"
        title="Use my location"
      >
        <IconLocation />
      </button>
      <input
        id={id}
        className="address-bar__input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            onSubmit()
          }
        }}
        placeholder={placeholder}
        autoComplete="street-address"
        disabled={disabled}
        aria-label="Address or city"
      />
      <button
        type="button"
        className="address-bar__submit"
        onClick={onSubmit}
        disabled={disabled}
        aria-label="Search this address"
        title="Search"
      >
        <IconArrowEnter />
      </button>
    </div>
  )
}
