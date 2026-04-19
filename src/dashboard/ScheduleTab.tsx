type Props = {
  selectedPlace: string
  kWp: string
  performanceRatio: string
  onKwp: (v: string) => void
  onPr: (v: string) => void
  onRefresh: () => void
  loading: boolean
  error: string | null
  onReturnToAddress?: () => void
}

export function ScheduleTab({
  selectedPlace,
  kWp,
  performanceRatio,
  onKwp,
  onPr,
  onRefresh,
  loading,
  error,
  onReturnToAddress,
}: Props) {
  return (
    <>
      <h1 style={{ fontSize: '1.25rem', margin: '0 0 8px' }}>Schedule</h1>
      <p className="zw-muted-small" style={{ marginBottom: 16 }}>
        Location: <strong>{selectedPlace || 'Not set'}</strong>
        {onReturnToAddress ? (
          <>
            {' '}
            {' · '}
            <button type="button" className="zw-inline-link" onClick={onReturnToAddress}>
              Open full address screen
            </button>{' '}
            or use + to pick a place.
          </>
        ) : (
          <> Use + to change.</>
        )}
      </p>

      <section className="zw-panel">
        <h2 style={{ fontSize: '0.85rem', margin: '0 0 12px', textTransform: 'uppercase', color: 'var(--zw-muted)' }}>
          Your system
        </h2>
        <div className="zw-field">
          <label htmlFor="sched-kwp">DC capacity (kWp)</label>
          <input id="sched-kwp" inputMode="decimal" value={kWp} onChange={(e) => onKwp(e.target.value)} />
        </div>
        <div className="zw-field">
          <label htmlFor="sched-pr">Performance ratio</label>
          <input id="sched-pr" inputMode="decimal" value={performanceRatio} onChange={(e) => onPr(e.target.value)} />
        </div>
        <button type="button" className="zw-download-btn" onClick={() => void onRefresh()} disabled={loading}>
          {loading ? 'Updating…' : 'Update forecast'}
        </button>
        {error && <p className="zw-error">{error}</p>}
      </section>
    </>
  )
}
