
import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CarFront,
  Check,
  Crown,
  ListChecks,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import CustomerHeader from '../components/CustomerHeader.jsx'
import { useCustomerAuth } from '../context/CustomerAuthContext.js'
import { api } from '../services/api.js'
import '../styles/customer-marketplace.css'
import '../styles/resale-marketplace.css'

const PLANS = {
  monthly: { label: 'Premium Monthly', price: 199, term: '/ month' },
  yearly: { label: 'Premium Yearly', price: 999, term: '/ year' },
}

function PremiumPage() {
  const { account, acceptAccount, status } = useCustomerAuth()
  const [selectedPlan, setSelectedPlan] = useState('')
  const [paymentHandle, setPaymentHandle] = useState('')
  const [step, setStep] = useState('plans')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  function choosePlan(plan) {
    setSelectedPlan(plan)
    setPaymentHandle('')
    setError('')
    setStep('payment')
  }

  async function confirmDemoPayment() {
    setError('')
    setBusy(true)
    setStep('processing')

    try {
      await new Promise((resolve) => setTimeout(resolve, 900))

      const result = await api.customerConfirmPremium({
        plan: selectedPlan,
        payment_method: 'upi',
        payment_handle: paymentHandle,
      })

      acceptAccount(result.account)
      setStep('success')
    } catch (requestError) {
      setError(requestError.message || 'The demo upgrade could not be completed.')
      setStep('confirm')
    } finally {
      setBusy(false)
    }
  }

  const selected = PLANS[selectedPlan]

  const benefits = [
    'Browse the verified accepted vehicle catalogue',
    'Filter vehicles by available brand and manufacturing year',
    'Open full source-record details for each vehicle',
    'Keep Premium access on your customer profile',
  ]

  return (
    <main className="customer-marketplace customer-premium-page">
      <style>{`
        .customer-premium-page {
          min-height: 100vh;
          background: #f5f7fb !important;
          color: #172554 !important;
          padding-bottom: 64px;
        }

        .customer-premium-page .customer-premium-shell {
          width: min(1120px, calc(100% - 40px));
          margin: 0 auto;
          padding: 48px 0 60px;
        }

        .customer-premium-page .customer-premium-heading {
          text-align: center;
          max-width: 720px;
          margin: 0 auto 28px;
        }

        .customer-premium-page .customer-eyebrow {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          color: #2563eb;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.4px;
        }

        .customer-premium-page .customer-eyebrow-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #2563eb;
        }

        .customer-premium-page .customer-premium-heading h1 {
          margin: 15px 0 10px;
          color: #172554 !important;
          font-size: clamp(30px, 4vw, 43px);
          font-weight: 800;
          letter-spacing: -1.4px;
          line-height: 1.15;
        }

        .customer-premium-page .customer-premium-heading p {
          margin: 0;
          color: #64748b !important;
          font-size: 15px;
          line-height: 1.8;
        }

        .customer-premium-page .premium-demo-notice {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          max-width: 760px;
          margin: 0 auto 28px;
          padding: 13px 18px;
          border: 1px solid #bfdbfe;
          border-radius: 12px;
          background: #eff6ff;
          color: #1e40af !important;
          font-size: 13px;
          line-height: 1.6;
        }

        .customer-premium-page .premium-marketplace-profile {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          margin: 0 0 30px;
          padding: 25px 28px;
          border: 1px solid #263d61;
          border-radius: 17px;
          background: linear-gradient(120deg, #172b49, #203b60);
          box-shadow: 0 8px 24px rgba(23, 43, 73, .12);
        }

        .customer-premium-page .premium-marketplace-profile .customer-section-index {
          color: #93c5fd !important;
        }

        .customer-premium-page .premium-marketplace-profile h2 {
          margin: 9px 0 5px;
          color: #fff !important;
          font-size: 23px;
          font-weight: 750;
        }

        .customer-premium-page .premium-marketplace-profile p {
          margin: 0;
          color: #dbeafe !important;
          font-size: 13px;
          line-height: 1.7;
        }

        .customer-premium-page .premium-marketplace-profile-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .customer-premium-page .premium-marketplace-profile-actions a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 42px;
          padding: 0 16px;
          border-radius: 9px;
          text-decoration: none;
          font-size: 12px;
          font-weight: 700;
        }

        .customer-premium-page .premium-marketplace-profile-actions .resale-primary-link {
          background: #2563eb;
          color: #fff !important;
        }

        .customer-premium-page .premium-marketplace-profile-actions .resale-quiet-button {
          border: 1px solid #cbd5e1;
          background: #fff;
          color: #1d4ed8 !important;
        }

        .customer-premium-page .premium-benefits {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px 22px;
          margin: 0 0 30px;
          padding: 22px 25px;
          border: 1px solid #e2e8f0;
          border-radius: 15px;
          background: #fff;
        }

        .customer-premium-page .premium-benefit {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          color: #334155 !important;
          font-size: 13px;
          line-height: 1.65;
        }

        .customer-premium-page .premium-benefit svg {
          flex: 0 0 auto;
          margin-top: 2px;
          color: #16a34a;
        }

        .customer-premium-page .premium-plans-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          align-items: stretch;
          gap: 20px;
        }

        .customer-premium-page .premium-plan-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          min-width: 0;
          padding: 27px 24px 25px;
          border: 1px solid #e2e8f0;
          border-radius: 17px;
          background: #fff;
          box-shadow: 0 5px 18px rgba(15, 23, 42, .045);
          transition: transform .2s ease, box-shadow .2s ease;
        }

        .customer-premium-page .premium-plan-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(15, 23, 42, .09);
        }

        .customer-premium-page .premium-plan-card.is-featured {
          border: 2px solid #2563eb;
          box-shadow: 0 9px 27px rgba(37, 99, 235, .11);
        }

        .customer-premium-page .premium-plan-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 46px;
          height: 46px;
          margin-bottom: 20px;
          border-radius: 13px;
          background: #eff6ff;
          color: #2563eb;
        }

        .customer-premium-page .premium-plan-card .customer-section-index {
          color: #64748b !important;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .customer-premium-page .premium-plan-card h2 {
          margin: 10px 0 8px;
          color: #172554 !important;
          font-size: 21px;
          font-weight: 800;
        }

        .customer-premium-page .premium-plan-price {
          margin: 5px 0 12px;
          color: #172554 !important;
          font-size: 34px;
          font-weight: 850;
          letter-spacing: -1px;
        }

        .customer-premium-page .premium-plan-price small {
          color: #64748b !important;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0;
        }

        .customer-premium-page .premium-plan-description {
          min-height: 48px;
          margin: 0 0 22px;
          color: #64748b !important;
          font-size: 13px;
          line-height: 1.7;
        }

        .customer-premium-page .premium-current-plan {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: auto;
          padding: 9px 13px;
          border-radius: 8px;
          background: #ecfdf5;
          color: #047857 !important;
          font-size: 12px;
          font-weight: 750;
        }

        .customer-premium-page .premium-plan-button,
        .customer-premium-page .customer-account-submit {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          width: 100%;
          min-height: 45px;
          margin-top: auto;
          padding: 11px 16px;
          border: 0;
          border-radius: 9px;
          background: #2563eb;
          color: #fff !important;
          text-decoration: none;
          font-size: 13px;
          font-weight: 750;
          cursor: pointer;
          transition: background .18s ease, transform .18s ease;
        }

        .customer-premium-page .premium-plan-button:hover,
        .customer-premium-page .customer-account-submit:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
        }

        .customer-premium-page .premium-plan-disclaimer {
          margin: 20px 0 0;
          color: #64748b !important;
          font-size: 12px;
          line-height: 1.7;
          text-align: center;
        }

        .customer-premium-page .premium-checkout-card,
        .customer-premium-page .premium-processing-panel,
        .customer-premium-page .premium-login-prompt,
        .customer-premium-page .premium-success-panel {
          max-width: 650px;
          margin: 25px auto;
          padding: 30px;
          border: 1px solid #e2e8f0;
          border-radius: 17px;
          background: #fff;
          box-shadow: 0 7px 22px rgba(15, 23, 42, .05);
        }

        .customer-premium-page .premium-checkout-card h2,
        .customer-premium-page .premium-processing-panel h2,
        .customer-premium-page .premium-login-prompt h2,
        .customer-premium-page .premium-success-panel h2 {
          margin: 12px 0 8px;
          color: #172554 !important;
          font-size: 23px;
          font-weight: 800;
        }

        .customer-premium-page .premium-checkout-card p,
        .customer-premium-page .premium-processing-panel p,
        .customer-premium-page .premium-login-prompt p,
        .customer-premium-page .premium-success-panel p {
          color: #64748b !important;
          font-size: 13px;
          line-height: 1.75;
        }

        .customer-premium-page .premium-back-button {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 22px;
          padding: 8px 0;
          border: 0;
          background: transparent;
          color: #2563eb !important;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .customer-premium-page .premium-checkout-price {
          margin: 12px 0 22px;
          color: #172554 !important;
          font-size: 30px !important;
          font-weight: 800;
        }

        .customer-premium-page .premium-checkout-price small {
          color: #64748b !important;
          font-size: 12px;
          font-weight: 500;
        }

        .customer-premium-page .premium-payment-method {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 9px;
          background: #f8fafc;
          color: #475569;
        }

        .customer-premium-page .premium-payment-method > span {
          padding: 5px 10px;
          border-radius: 6px;
          background: #dbeafe;
          color: #1d4ed8;
          font-size: 12px;
          font-weight: 800;
        }

        .customer-premium-page .premium-payment-disclaimer {
          padding: 12px 14px;
          border-radius: 9px;
          background: #f1f5f9;
          color: #64748b !important;
          font-size: 12px !important;
        }

        .customer-premium-page .premium-confirmation-row {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          margin: 20px 0;
          padding: 17px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          color: #334155;
        }

        .customer-premium-page .premium-confirmation-row strong {
          color: #172554;
          font-size: 18px;
        }

        .customer-premium-page .premium-confirmation-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-top: 20px;
        }

        .customer-premium-page .premium-confirmation-actions .customer-account-submit {
          width: auto;
          margin: 0;
        }

        .customer-premium-page .premium-success-panel {
          display: flex;
          align-items: center;
          gap: 18px;
          max-width: 850px;
        }

        .customer-premium-page .premium-success-panel > div {
          flex: 1;
        }

        .customer-premium-page .premium-success-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 48px;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #dcfce7;
          color: #15803d;
        }

        .customer-premium-page .premium-login-prompt {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .customer-premium-page .premium-login-prompt > div:nth-child(2) {
          flex: 1;
        }

        .customer-premium-page .premium-prompt-actions {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          min-width: 130px;
        }

        .customer-premium-page .premium-text-link {
          color: #2563eb !important;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
        }

        .customer-premium-page .premium-processing-panel {
          text-align: center;
        }

        .customer-premium-page .premium-spinner {
          display: inline-block;
          width: 35px;
          height: 35px;
          border: 3px solid #dbeafe;
          border-top-color: #2563eb;
          border-radius: 50%;
          animation: premium-spin .8s linear infinite;
        }

        @keyframes premium-spin {
          to { transform: rotate(360deg); }
        }

        .customer-premium-page .premium-state {
          margin: 20px 0;
          padding: 16px;
          border: 1px solid #bfdbfe;
          border-radius: 10px;
          background: #eff6ff;
          color: #1e40af !important;
          text-align: center;
          font-size: 13px;
        }

        .customer-premium-page .premium-state.is-error {
          border-color: #fecaca;
          background: #fef2f2;
          color: #b91c1c !important;
        }

        @media (max-width: 800px) {
          .customer-premium-page .premium-plans-grid {
            grid-template-columns: 1fr 1fr;
          }

          .customer-premium-page .premium-marketplace-profile {
            align-items: flex-start;
            flex-direction: column;
          }
        }

        @media (max-width: 560px) {
          .customer-premium-page .customer-premium-shell {
            width: calc(100% - 28px);
            padding: 30px 0 42px;
          }

          .customer-premium-page .premium-plans-grid,
          .customer-premium-page .premium-benefits {
            grid-template-columns: 1fr;
          }

          .customer-premium-page .premium-plan-card {
            padding: 23px 20px;
          }

          .customer-premium-page .premium-login-prompt,
          .customer-premium-page .premium-success-panel {
            align-items: flex-start;
            flex-direction: column;
            padding: 23px;
          }

          .customer-premium-page .premium-confirmation-actions {
            align-items: stretch;
            flex-direction: column;
          }

          .customer-premium-page .premium-confirmation-actions .customer-account-submit {
            width: 100%;
          }

          .customer-premium-page .premium-marketplace-profile {
            padding: 21px;
          }

          .customer-premium-page .premium-marketplace-profile-actions {
            width: 100%;
          }

          .customer-premium-page .premium-marketplace-profile-actions a {
            flex: 1;
          }

          .customer-premium-page .premium-checkout-card {
            padding: 22px;
          }

          .customer-premium-page .premium-demo-notice {
            align-items: flex-start;
            justify-content: flex-start;
          }
        }
      `}</style>

      <CustomerHeader />

      <section className="customer-premium-shell">
        <div className="customer-premium-heading">
          <span className="customer-eyebrow">
            <span className="customer-eyebrow-dot" />
            VMA DRIVE MARKET · MEMBERSHIP
          </span>
          <h1>Discover every detail.</h1>
          <p>
            Choose the membership that fits your journey and explore
            more of the verified vehicle marketplace.
          </p>
        </div>

        <div className="premium-demo-notice" role="note">
          <ShieldCheck aria-hidden="true" size={17} />
          <span>
            Simulation only. No real payment is processed, and UPI details are not stored.
          </span>
        </div>

        {status === 'loading' && (
          <div className="premium-state" role="status">
            Checking your customer account…
          </div>
        )}

        {status === 'error' && (
          <div className="premium-state is-error" role="alert">
            Customer account service is unavailable. Please retry after checking the backend.
          </div>
        )}

        {status === 'ready' && !account && (
          <section className="premium-login-prompt">
            <div className="premium-plan-icon">
              <Crown aria-hidden="true" size={21} />
            </div>

            <div>
              <h2>Create or sign in to a customer account</h2>
              <p>
                Your Premium status is saved to your customer profile,
                separate from Admin Portal access.
              </p>
            </div>

            <div className="premium-prompt-actions">
              <Link className="customer-account-submit" to="/register">
                Create account
              </Link>
              <Link className="premium-text-link" to="/login">
                Sign in
              </Link>
            </div>
          </section>
        )}

        {status === 'ready' && account && (
          <section aria-label="Customer marketplace profile" className="premium-marketplace-profile">
            <div className="premium-marketplace-profile-copy">
              <span className="customer-section-index">YOUR CUSTOMER PROFILE</span>
              <h2>{account.full_name}</h2>
              <p>
                Use this same customer account to browse as a buyer and submit vehicles as a seller.
              </p>
            </div>

            <div className="premium-marketplace-profile-actions">
              <Link className="resale-primary-link" to="/sell-car">
                <CarFront aria-hidden="true" size={15} />
                Sell Your Car
              </Link>

              <Link className="resale-quiet-button" to="/my-listings">
                <ListChecks aria-hidden="true" size={15} />
                My Listings
              </Link>
            </div>
          </section>
        )}

        {status === 'ready' && account?.account_status === 'premium' && step !== 'success' && (
          <section className="premium-success-panel" role="status">
            <span className="premium-success-icon">
              <Check aria-hidden="true" size={23} />
            </span>

            <div>
              <span className="customer-section-index">PREMIUM ACTIVE · SIMULATED</span>
              <h2>Your vehicle discovery is unlocked.</h2>
              <p>
                {account.premium_plan === 'yearly' ? 'Premium Yearly' : 'Premium Monthly'}
                {' · access through '}
                {account.premium_expires_at
                  ? new Date(account.premium_expires_at).toLocaleDateString()
                  : 'the current demo term'}
              </p>
            </div>

            <Link className="customer-account-submit" to="/#vehicle-catalogue">
              Browse vehicles <ArrowRight aria-hidden="true" size={15} />
            </Link>
          </section>
        )}

        {status === 'ready' && account?.account_status === 'premium' && step === 'success' && (
          <section className="premium-success-panel" role="status">
            <span className="premium-success-icon">
              <Check aria-hidden="true" size={23} />
            </span>

            <div>
              <span className="customer-section-index">PAYMENT SIMULATION COMPLETE</span>
              <h2>Welcome to Premium, {account.full_name.split(' ')[0]}.</h2>
              <p>
                Your {account.premium_plan} demo plan is active. No money was charged
                or transferred, and your UPI details were not saved.
              </p>
            </div>

            <Link className="customer-account-submit" to="/#vehicle-catalogue">
              Explore vehicles <ArrowRight aria-hidden="true" size={15} />
            </Link>
          </section>
        )}

        {status === 'ready' && account?.account_status === 'free' && (
          <>
            <div className="premium-benefits">
              {benefits.map((benefit) => (
                <div className="premium-benefit" key={benefit}>
                  <Check aria-hidden="true" size={14} />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            {step === 'plans' && (
              <>
                <div className="premium-plans-grid">
                  <article className="premium-plan-card">
                    <span className="premium-plan-icon">
                      <Sparkles aria-hidden="true" size={20} />
                    </span>
                    <span className="customer-section-index">START HERE</span>
                    <h2>Free</h2>
                    <p className="premium-plan-price">
                      ₹0 <small>always</small>
                    </p>
                    <p className="premium-plan-description">
                      Marketplace home and account profile.
                    </p>
                    <span className="premium-current-plan">Current plan</span>
                  </article>

                  <article className="premium-plan-card is-featured">
                    <span className="premium-plan-icon">
                      <Crown aria-hidden="true" size={20} />
                    </span>
                    <span className="customer-section-index">FLEXIBLE ACCESS</span>
                    <h2>Premium Monthly</h2>
                    <p className="premium-plan-price">
                      ₹199 <small>/ month · demo price</small>
                    </p>
                    <p className="premium-plan-description">
                      Full vehicle catalogue and discovery details.
                    </p>
                    <button
                      className="premium-plan-button"
                      onClick={() => choosePlan('monthly')}
                      type="button"
                    >
                      Choose monthly <ArrowRight aria-hidden="true" size={14} />
                    </button>
                  </article>

                  <article className="premium-plan-card">
                    <span className="premium-plan-icon">
                      <Crown aria-hidden="true" size={20} />
                    </span>
                    <span className="customer-section-index">BEST VALUE · DEMO</span>
                    <h2>Premium Yearly</h2>
                    <p className="premium-plan-price">
                      ₹999 <small>/ year · demo price</small>
                    </p>
                    <p className="premium-plan-description">
                      One simulated yearly term with the same discovery access.
                    </p>
                    <button
                      className="premium-plan-button"
                      onClick={() => choosePlan('yearly')}
                      type="button"
                    >
                      Choose yearly <ArrowRight aria-hidden="true" size={14} />
                    </button>
                  </article>
                </div>

                <p className="premium-plan-disclaimer">
                  Prices are project-demo values only. Monthly and yearly terms last 30 and 365 days;
                  there is no auto-renewal or real payment.
                </p>
              </>
            )}

            {step === 'payment' && selected && (
              <section className="premium-checkout-card">
                <button
                  className="premium-back-button"
                  onClick={() => setStep('plans')}
                  type="button"
                >
                  <ArrowLeft aria-hidden="true" size={14} />
                  Back to plans
                </button>

                <span className="customer-section-index">SIMULATED PAYMENT · STEP 1 OF 2</span>
                <h2>{selected.label}</h2>

                <p className="premium-checkout-price">
                  ₹{selected.price} <small>{selected.term} · demo only</small>
                </p>

                <label className="customer-account-field">
                  <span>Payment method</span>
                  <span className="premium-payment-method">
                    <span>UPI</span> Simulation only
                  </span>
                </label>

                <label className="customer-account-field">
                  <span>UPI ID or phone number</span>
                  <input
                    autoComplete="off"
                    maxLength="128"
                    onChange={(event) => setPaymentHandle(event.target.value)}
                    placeholder="name@bank or +91 phone"
                    value={paymentHandle}
                  />
                </label>

                <p className="premium-payment-disclaimer">
                  This field is used only to demonstrate checkout. It is not sent to a payment provider
                  or saved to your account.
                </p>

                {error && (
                  <p className="account-form-error" role="alert">
                    {error}
                  </p>
                )}

                <button
                  className="customer-account-submit"
                  disabled={!paymentHandle.trim()}
                  onClick={() => {
                    setError('')
                    setStep('confirm')
                  }}
                  type="button"
                >
                  Review demo payment <ArrowRight aria-hidden="true" size={15} />
                </button>
              </section>
            )}

            {step === 'confirm' && selected && (
              <section className="premium-checkout-card">
                <span className="customer-section-index">CONFIRMATION · NO REAL CHARGE</span>
                <h2>Confirm simulated upgrade</h2>

                <div className="premium-confirmation-row">
                  <span>{selected.label} via UPI</span>
                  <strong>₹{selected.price}</strong>
                </div>

                <p className="premium-payment-disclaimer">
                  Selecting confirm will activate a demo Premium term in your account only.
                  No money moves and no UPI information is retained.
                </p>

                {error && (
                  <p className="account-form-error" role="alert">
                    {error}
                  </p>
                )}

                <div className="premium-confirmation-actions">
                  <button
                    className="premium-back-button"
                    onClick={() => setStep('payment')}
                    type="button"
                  >
                    <ArrowLeft aria-hidden="true" size={14} />
                    Edit payment method
                  </button>

                  <button
                    className="customer-account-submit"
                    disabled={busy}
                    onClick={confirmDemoPayment}
                    type="button"
                  >
                    Confirm demo payment <ArrowRight aria-hidden="true" size={15} />
                  </button>
                </div>
              </section>
            )}

            {step === 'processing' && (
              <section aria-live="polite" className="premium-processing-panel" role="status">
                <span className="premium-spinner" />
                <h2>Processing demo upgrade</h2>
                <p>
                  No payment provider is contacted. Your plan is being activated in the customer account.
                </p>
              </section>
            )}
          </>
        )}
      </section>
    </main>
  )
}

export default PremiumPage
