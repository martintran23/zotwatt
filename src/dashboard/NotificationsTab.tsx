import { useState } from 'react'

function IconSolarLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect width="32" height="32" rx="8" fill="#FDB813" />
      <circle cx="16" cy="16" r="4.5" fill="white" />
      <path
        d="M16 8v2M16 22v2M8 16h2M22 16h2M10.34 10.34l1.41 1.41M20.25 20.25l1.41 1.41M10.34 21.66l1.41-1.41M20.25 11.75l1.41-1.41"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconClock() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconLeaf() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21C7 16 4 12 4 8a8 8 0 0 1 16 0c0 4-3 8-8 13z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconSunEmail() {
  return (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4" fill="#FDB813" />
      <path
        d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke="#FDB813"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconPencil() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function NotificationsTab() {
  const [sendTime, setSendTime] = useState('07:30 AM')
  const [editingTime, setEditingTime] = useState(false)
  const [timeInput, setTimeInput] = useState('07:30')
  const [mode, setMode] = useState<'digest' | 'smart'>('digest')

  function commitTime() {
    if (timeInput) {
      const [h, m] = timeInput.split(':')
      const hour = parseInt(h, 10)
      const period = hour >= 12 ? 'PM' : 'AM'
      const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
      setSendTime(`${String(h12).padStart(2, '0')}:${m} ${period}`)
    }
    setEditingTime(false)
  }

  return (
    <div className="zw-notif-page">
      <header className="zw-notif-header">
        <h1 className="zw-notif-title">Email Notification Preview</h1>
        <p className="zw-notif-subtitle">
          Review and customize the daily solar pulse your users receive to keep their energy habits in harmony with the
          sun.
        </p>
      </header>

      <div className="zw-notif-body">
        <article className="zw-email-card">
          <div className="zw-email-brand">
            <IconSolarLogo />
            <span className="zw-email-brand-name">SolarShift</span>
          </div>

          <h2 className="zw-email-heading">Your Daily Solar Update</h2>
          <p className="zw-email-subheading">Sent directly to your inbox</p>

          <div className="zw-email-rec">
            <div className="zw-email-rec__content">
              <span className="zw-email-rec__tag">Primary Recommendation</span>
              <h3 className="zw-email-rec__title">Run your laundry around noon today.</h3>
              <p className="zw-email-rec__body">
                Your solar panels will be at peak production, making this the most cost-effective and green time for
                heavy appliances.
              </p>
            </div>
            <div className="zw-email-rec__img" aria-hidden />
          </div>

          <div className="zw-email-stats">
            <div className="zw-email-stat zw-email-stat--light">
              <div className="zw-email-stat__icon">
                <IconClock />
              </div>
              <div className="zw-email-stat__label">Optimal Window</div>
              <div className="zw-email-stat__value">11:30 AM – 1:45 PM</div>
              <div className="zw-email-stat__note">Efficiency expected at 94%</div>
            </div>
            <div className="zw-email-stat zw-email-stat--blue">
              <div className="zw-email-stat__icon">
                <IconLeaf />
              </div>
              <div className="zw-email-stat__label">Estimated Savings</div>
              <div className="zw-email-stat__value zw-email-stat__value--lg">$4.12 Today</div>
              <div className="zw-email-stat__note">Carbon avoided: 2.4kg</div>
            </div>
          </div>

          <div className="zw-email-outlook">
            <div>
              <p className="zw-email-outlook__title">Tomorrow&apos;s Outlook</p>
              <p className="zw-email-outlook__body">Sunny skies tomorrow—expect even higher production!</p>
            </div>
            <IconSunEmail />
          </div>

          <div className="zw-email-footer-bar">
            <p className="zw-email-footer-bar__text">
              This is an automated daily pulse from your SolarShift Sanctuary. To adjust your notification frequency,
              visit your Dashboard.
            </p>
            <div className="zw-email-footer-bar__links">
              <a href="#" className="zw-email-footer-bar__link">
                Unsubscribe
              </a>
              <span aria-hidden>·</span>
              <a href="#" className="zw-email-footer-bar__link">
                Manage Preferences
              </a>
            </div>
          </div>
        </article>

        <aside className="zw-delivery-panel">
          <div className="zw-delivery-card">
            <h2 className="zw-delivery-title">Delivery Settings</h2>

            <p className="zw-delivery-label">Send Time</p>
            <div className="zw-delivery-time-row">
              {editingTime ? (
                <input
                  type="time"
                  className="zw-delivery-time-input"
                  value={timeInput}
                  onChange={(e) => setTimeInput(e.target.value)}
                  onBlur={commitTime}
                  autoFocus
                />
              ) : (
                <>
                  <span className="zw-delivery-time-value">{sendTime}</span>
                  <button
                    type="button"
                    className="zw-delivery-time-edit"
                    onClick={() => setEditingTime(true)}
                    aria-label="Edit send time"
                  >
                    <IconPencil />
                  </button>
                </>
              )}
            </div>

            <p className="zw-delivery-label">Notification Mode</p>
            <div className="zw-delivery-modes">
              <button
                type="button"
                className={`zw-delivery-mode${mode === 'digest' ? ' zw-delivery-mode--active' : ''}`}
                onClick={() => setMode('digest')}
              >
                Daily Digest
                {mode === 'digest' && <IconCheck />}
              </button>
              <button
                type="button"
                className={`zw-delivery-mode zw-delivery-mode--ghost${mode === 'smart' ? ' zw-delivery-mode--ghost-active' : ''}`}
                onClick={() => setMode('smart')}
              >
                Smart Alerts Only
                <span className={`zw-delivery-toggle${mode === 'smart' ? ' zw-delivery-toggle--on' : ''}`} aria-hidden />
              </button>
            </div>

            <button type="button" className="zw-delivery-update-btn">
              Update Settings
            </button>
          </div>

          <div className="zw-delivery-efficiency">
            <h3 className="zw-delivery-efficiency__title">Live Efficiency</h3>
            <p className="zw-delivery-efficiency__body">
              Your current production is 15% higher than the regional average.
            </p>
            <a href="#" className="zw-delivery-efficiency__link">
              View Analytics →
            </a>
          </div>
        </aside>
      </div>
    </div>
  )
}
