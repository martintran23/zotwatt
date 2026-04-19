import type { ReactNode } from 'react'

export type Tab = 'flow' | 'forecast' | 'impact' | 'sms' | 'notifications'

type Props = {
  active: Tab
  onTab: (t: Tab) => void
  onFab: () => void
  onHome: () => void
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

export function DashboardShell({
  active,
  onTab,
  onFab,
  onHome,
  children,
  whyMatters,
  onOpenWhyMatters,
  onCloseWhyMatters,
}: Props) {
  const smsLayout = active === 'sms'
  const fullWidthLayout = active === 'sms'
  const showFab = !fullWidthLayout

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
          <button type="button" className="sd-topnav__brand" onClick={onHome} aria-label="Go to home page">
            SolarShift
          </button>
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
          <div className="sd-topnav__spacer" aria-hidden />
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
          <button type="button" className="sd-sms-tabs__btn" onClick={() => onTab('impact')}>
            Impact
          </button>
        </nav>
      )}

      <div className="sd-frame">
        {!fullWidthLayout && !whyMatters && (
          <aside className="sd-sidenav" aria-label="App sections">
            <nav className="sd-sidenav__nav">
              {navItem('flow', 'Optimize', IconOptimize, 'side')}
              {navItem('forecast', 'Insights', IconInsights, 'side')}
              {navItem('impact', 'Impact', IconEco, 'side')}
            </nav>
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
            {!whyMatters && navItem('flow', 'Optimize', IconOptimize, 'mobile')}
            {!whyMatters && navItem('forecast', 'Insights', IconInsights, 'mobile')}
            {!whyMatters && navItem('impact', 'Impact', IconEco, 'mobile')}
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
