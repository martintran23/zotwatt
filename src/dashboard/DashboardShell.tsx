import type { ReactNode } from 'react'

export type Tab = 'flow' | 'forecast' | 'schedule' | 'impact' | 'sms'

type Props = {
  active: Tab
  onTab: (t: Tab) => void
  onFab: () => void
  onSms: () => void
  children: ReactNode
}

function IconFlow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 14h16M8 10V6M12 14V4m4 10V8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconChart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 19V5M8 17V9m4 8V7m4 10v-6m4 8V11" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M4 10h16M8 3V7m8-4V7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function IconLeaf() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21C7 16 4 12 4 8a8 8 0 0 1 16 0c0 4-3 8-8 13z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function DashboardShell({ active, onTab, onFab, onSms, children }: Props) {
  const showFab = active !== 'sms'
  const smsLayout = active === 'sms'

  return (
    <div className={`zw-app${smsLayout ? ' zw-app--sms' : ''}`}>
      <header className={`zw-header${smsLayout ? ' zw-header--sms' : ''}`}>
        <div className="zw-logo">SolarShift</div>
        {smsLayout && (
          <nav className="zw-header-links" aria-label="Main sections">
            <button type="button" className="zw-header-link" onClick={() => onTab('flow')}>
              Flow
            </button>
            <button type="button" className="zw-header-link" onClick={() => onTab('forecast')}>
              Forecast
            </button>
            <button type="button" className="zw-header-link" onClick={() => onTab('schedule')}>
              Schedule
            </button>
            <button type="button" className="zw-header-link" onClick={() => onTab('impact')}>
              Impact
            </button>
          </nav>
        )}
        <div className="zw-header-actions">
          <button type="button" className="zw-icon-btn" aria-label="SMS alerts" onClick={onSms}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </button>
          <button type="button" className="zw-icon-btn" aria-label="Account">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.75" />
              <path d="M6 20c0-4 3-6 6-6s6 2 6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </header>

      <main className={showFab ? 'zw-main zw-main--with-fab' : 'zw-main'}>{children}</main>

      <div className="zw-nav-wrap">
        <nav className="zw-nav" aria-label="Main">
          <button
            type="button"
            className={`zw-nav-item${active === 'flow' ? ' zw-nav-item--active' : ''}`}
            onClick={() => onTab('flow')}
          >
            <IconFlow />
            Flow
          </button>
          <button
            type="button"
            className={`zw-nav-item${active === 'forecast' ? ' zw-nav-item--active' : ''}`}
            onClick={() => onTab('forecast')}
          >
            <IconChart />
            Forecast
          </button>
          <button
            type="button"
            className={`zw-nav-item${active === 'schedule' ? ' zw-nav-item--active' : ''}`}
            onClick={() => onTab('schedule')}
          >
            <IconCalendar />
            Schedule
          </button>
          <button
            type="button"
            className={`zw-nav-item${active === 'impact' ? ' zw-nav-item--active' : ''}`}
            onClick={() => onTab('impact')}
          >
            <IconLeaf />
            Impact
          </button>
        </nav>
      </div>

      {showFab && (
        <button type="button" className="zw-fab" aria-label="Set location" onClick={onFab}>
          +
        </button>
      )}
    </div>
  )
}
