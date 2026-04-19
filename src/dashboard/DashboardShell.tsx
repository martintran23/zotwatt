import type { ReactNode } from 'react'

export type Tab = 'flow' | 'forecast' | 'schedule' | 'impact' | 'sms' | 'notifications'

type Props = {
  active: Tab
  onTab: (t: Tab) => void
  onFab: () => void
  onSms: () => void
  children: ReactNode
  whyMatters: boolean
  onOpenWhyMatters: () => void
  onCloseWhyMatters: () => void
}

function IconOptimize({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconInsights({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 19V5M8 17V9m4 8V7m4 10v-6m4 8V11" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function IconEco({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21C7 16 4 12 4 8a8 8 0 0 1 16 0c0 4-3 8-8 13z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconSettings({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconBell() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function IconAccount() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.75" />
      <path d="M6 20c0-4 3-6 6-6s6 2 6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

export function DashboardShell({
  active,
  onTab,
  onFab,
  onSms,
  children,
  whyMatters,
  onOpenWhyMatters,
  onCloseWhyMatters,
}: Props) {
  const smsLayout = active === 'sms'
  /** Only SMS uses the compact strip without sidebar; other tabs keep the left rail. */
  const fullWidthLayout = active === 'sms'
  const showFab = !fullWidthLayout

  /** Why It Matters is only reflected in the top nav; sidebar stays neutral (no false “Impact” active). */
  const sideNavActive = (tab: Tab) => !whyMatters && active === tab

  const navItem = (tab: Tab, label: string, Icon: typeof IconOptimize, variant: 'side' | 'mobile') => (
    <button
      type="button"
      className={`sd-nav-item sd-nav-item--${variant}${sideNavActive(tab) ? ' sd-nav-item--active' : ''}`}
      onClick={() => onTab(tab)}
    >
      <Icon />
      <span>{label}</span>
    </button>
  )

  return (
    <div className={`sd-app${smsLayout ? ' sd-app--sms' : ''}`}>
      <nav className="sd-topnav" aria-label="Primary">
        <div className="sd-topnav__inner">
          <div className="sd-topnav__brand">SolarShift</div>
          <div className="sd-topnav__links">
            <button
              type="button"
              className={`sd-topnav__link sd-topnav__link--btn${!whyMatters ? ' sd-topnav__link--active' : ''}`}
              onClick={onCloseWhyMatters}
            >
              Dashboard
            </button>
            <button
              type="button"
              className={`sd-topnav__link sd-topnav__link--btn${whyMatters ? ' sd-topnav__link--active' : ''}`}
              onClick={onOpenWhyMatters}
            >
              Why It Matters
            </button>
          </div>
          <div className="sd-topnav__actions">
            <button type="button" className="sd-icon-btn" aria-label="SMS alerts" onClick={onSms}>
              <IconBell />
            </button>
            <button type="button" className="sd-icon-btn" aria-label="Account">
              <IconAccount />
            </button>
          </div>
        </div>
      </nav>

      {smsLayout && (
        <nav className="sd-sms-tabs" aria-label="Leave SMS and open a section">
          <button type="button" className="sd-sms-tabs__btn" onClick={() => onTab('flow')}>
            Optimize
          </button>
          <button type="button" className="sd-sms-tabs__btn" onClick={() => onTab('forecast')}>
            Insights
          </button>
          <button type="button" className="sd-sms-tabs__btn" onClick={() => onTab('schedule')}>
            Settings
          </button>
          <button type="button" className="sd-sms-tabs__btn" onClick={() => onTab('impact')}>
            Impact
          </button>
        </nav>
      )}

      <div className="sd-frame">
        {!fullWidthLayout && (
          <aside className="sd-sidenav" aria-label="App sections">
            <div className="sd-sidenav__brand-block">
              <h2 className="sd-sidenav__title">SolarShift</h2>
              <p className="sd-sidenav__tag">Eco-Friendly Living</p>
            </div>
            <nav className="sd-sidenav__nav">
              {navItem('flow', 'Optimize', IconOptimize, 'side')}
              {navItem('forecast', 'Insights', IconInsights, 'side')}
              {navItem('impact', 'Impact', IconEco, 'side')}
            </nav>
            <div className="sd-sidenav__foot">
              {navItem('schedule', 'Settings', IconSettings, 'side')}
            </div>
          </aside>
        )}

        <div className={`sd-main-scroll${fullWidthLayout ? ' sd-main-scroll--sms' : ''}`}>
          <main
            className={`sd-main${showFab ? ' sd-main--fab' : ''}${whyMatters ? ' sd-main--why' : ''}`}
          >
            {children}
          </main>
        </div>
      </div>

      {!fullWidthLayout && (
        <div className="sd-mobile-nav" aria-label="Mobile sections">
          <nav className="sd-mobile-nav__inner">
            {navItem('flow', 'Optimize', IconOptimize, 'mobile')}
            {navItem('forecast', 'Insights', IconInsights, 'mobile')}
            {navItem('impact', 'Impact', IconEco, 'mobile')}
            {navItem('schedule', 'Settings', IconSettings, 'mobile')}
          </nav>
        </div>
      )}

      {showFab && (
        <button type="button" className="sd-fab" aria-label="Set location" onClick={onFab}>
          +
        </button>
      )}

      <div className="sd-rays" aria-hidden>
        <svg viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M800 0L0 800M800 0L200 800M800 0L400 800M800 0L600 800M800 0L800 600M800 0L800 400M800 0L800 200"
            stroke="#d5c4ac"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  )
}
