import { useState } from 'react'

function IconPhoneField() {
  return (
    <svg className="zw-sms-phone-svg" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="6" y="3" width="12" height="18" rx="2.5" stroke="#6b6560" strokeWidth="1.5" />
      <path d="M9 6h6" stroke="#6b6560" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="12" cy="16" r="1.2" fill="#6b6560" />
    </svg>
  )
}

export function SmsTab() {
  const [phone, setPhone] = useState('')
  const [peak, setPeak] = useState(true)
  const [excess, setExcess] = useState(false)
  const [battery, setBattery] = useState(true)

  return (
    <div className="zw-sms-page">
      <h1 className="zw-sms-title">SMS Alerts</h1>
      <p className="zw-sms-lede">
        Stay updated on your energy flow with real-time text notifications tailored to your solar production and grid
        cycles.
      </p>

      <section className="zw-sms-card">
        <label className="zw-sms-label-caps" htmlFor="sms-phone">
          Contact number
        </label>
        <div className="zw-sms-phone-field">
          <span className="zw-sms-phone-field-icon" aria-hidden>
            <IconPhoneField />
          </span>
          <input
            id="sms-phone"
            className="zw-sms-phone-input"
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
          />
        </div>
        <p className="zw-sms-footnote">Carrier rates may apply. We only send alerts for critical energy windows.</p>
      </section>

      <h2 className="zw-sms-pref-title">Notification preferences</h2>

      <section className="zw-sms-card zw-sms-card--toggles">
        <div className="zw-switch-row">
          <div className="zw-switch-copy">
            <span className="zw-switch-icon zw-switch-icon--peak" aria-hidden>
              ⚡
            </span>
            <div>
              <strong>Peak window starting</strong>
              <div className="zw-switch-desc">Alert me 15 minutes before high-cost energy periods begin.</div>
            </div>
          </div>
          <button
            type="button"
            className={`zw-switch${peak ? ' on' : ''}`}
            onClick={() => setPeak(!peak)}
            aria-pressed={peak}
            aria-label="Toggle peak window alerts"
          />
        </div>
        <div className="zw-switch-row">
          <div className="zw-switch-copy">
            <span className="zw-switch-icon zw-switch-icon--sun" aria-hidden>
              ☀️
            </span>
            <div>
              <strong>Excess solar available now</strong>
              <div className="zw-switch-desc">Notify when solar production exceeds house consumption.</div>
            </div>
          </div>
          <button
            type="button"
            className={`zw-switch${excess ? ' on' : ''}`}
            onClick={() => setExcess(!excess)}
            aria-pressed={excess}
            aria-label="Toggle excess solar alerts"
          />
        </div>
        <div className="zw-switch-row">
          <div className="zw-switch-copy">
            <span className="zw-switch-icon zw-switch-icon--battery" aria-hidden>
              🔋
            </span>
            <div>
              <strong>Battery full – good time to run appliances</strong>
              <div className="zw-switch-desc">Optimize your savings by running heavy loads on storage.</div>
            </div>
          </div>
          <button
            type="button"
            className={`zw-switch${battery ? ' on' : ''}`}
            onClick={() => setBattery(!battery)}
            aria-pressed={battery}
            aria-label="Toggle battery full alerts"
          />
        </div>
      </section>

      <div className="zw-sms-actions">
        <button type="button" className="zw-download-btn zw-download-btn--sms">
          Update Preferences
        </button>
        <button type="button" className="zw-link-btn zw-link-btn--sms">
          Send test notification
        </button>
      </div>

      <div className="zw-sms-photo">
        <img className="zw-sms-photo-img" src="/sms-house.png" alt="" decoding="async" loading="lazy" />
      </div>
    </div>
  )
}
