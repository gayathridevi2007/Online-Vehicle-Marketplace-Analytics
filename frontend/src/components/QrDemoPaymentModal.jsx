import { useState } from 'react'
import { AlertTriangle, CheckCircle2, QrCode, ShieldCheck, X } from 'lucide-react'

export function QrDemoPaymentModal({
  isOpen,
  onClose,
  title,
  subtitle,
  amount,
  totalAmount,
  remainingBalance,
  referenceId,
  isDeposit = false,
  onConfirm,
  confirmButtonText = 'Confirm Demo Payment',
}) {
  const [busy, setBusy] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState('')
  const [demoUpiRef, setDemoUpiRef] = useState('')

  if (!isOpen) return null

  async function handleConfirm() {
    setBusy(true)
    setError('')
    try {
      const result = await onConfirm()
      const simRef = result?.booking?.demo_payment_reference
        || result?.transaction?.demo_upi_reference
        || `UPI-DEMO-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
      setDemoUpiRef(simRef)
      setConfirmed(true)
    } catch (err) {
      setError(err.message || 'Demo confirmation failed. Please retry.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="w-qr-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="qr-modal-title">
      <div className="w-qr-modal-dialog">
        <button
          className="w-modal-close-btn"
          onClick={onClose}
          type="button"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {confirmed ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ display: 'inline-flex', padding: '12px', background: '#f0fdf4', color: '#16a34a', borderRadius: '50%', marginBottom: '16px' }}>
              <CheckCircle2 size={42} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>
              Demo Payment Confirmed!
            </h3>
            <p style={{ fontSize: '13.5px', color: '#475569', margin: '0 0 16px 0', lineHeight: 1.5 }}>
              Your demonstration transaction has been recorded successfully in the database.
            </p>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', marginBottom: '20px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>Reference ID:</span>
                <strong style={{ color: '#0f172a' }}>{referenceId}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>Demo UPI Ref:</span>
                <strong style={{ color: '#0f172a' }}>{demoUpiRef}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>Amount Paid:</span>
                <strong style={{ color: '#16a34a' }}>₹{Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              </div>
              {isDeposit && remainingBalance && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', paddingTop: '6px', borderTop: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b' }}>Remaining 50% Balance:</span>
                  <strong style={{ color: '#ea580c' }}>₹{Number(remainingBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                </div>
              )}
            </div>

            <div className="w-demo-payment-banner" style={{ textAlign: 'left' }}>
              <AlertTriangle size={20} color="#ea580c" style={{ flexShrink: 0 }} />
              <div className="w-demo-banner-text">
                <strong>DEMO TRANSACTION COMPLETE</strong>
                <p>No real money or bank accounts were debited. This transaction is stored for marketplace demonstration and testing.</p>
              </div>
            </div>

            <button
              className="w-btn w-btn-primary"
              style={{ width: '100%', marginTop: '8px' }}
              onClick={onClose}
              type="button"
            >
              Done & View Details
            </button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#2563eb', textTransform: 'uppercase', marginBottom: '4px' }}>
                <QrCode size={15} /> UPI Demonstration Gateway
              </div>
              <h2 id="qr-modal-title" style={{ fontSize: '21px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
                {title || 'Demo Payment'}
              </h2>
              {subtitle && <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{subtitle}</p>}
            </div>

            {/* MANDATORY PROMINENT DEMO NOTICE */}
            <div className="w-demo-payment-banner">
              <AlertTriangle size={22} color="#ea580c" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div className="w-demo-banner-text">
                <strong>DEMO PAYMENT — NO REAL MONEY TRANSFERRED</strong>
                <p>
                  This is a demonstration payment simulation. No money will be deducted from your bank account or card. Do NOT scan with actual banking apps.
                </p>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="w-breakdown-card">
              {totalAmount && isDeposit && (
                <div className="w-breakdown-row">
                  <span>Total Vehicle Price:</span>
                  <span>₹{Number(totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              {isDeposit && (
                <div className="w-breakdown-row">
                  <span>Required Deposit (50%):</span>
                  <span style={{ fontWeight: '700', color: '#16a34a' }}>
                    ₹{Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              {remainingBalance && isDeposit && (
                <div className="w-breakdown-row">
                  <span>Remaining Balance Due (50%):</span>
                  <span>₹{Number(remainingBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="w-breakdown-row highlight">
                <span>Demo Payable Amount:</span>
                <span style={{ color: '#2563eb' }}>
                  ₹{Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Simulated UPI QR Box */}
            <div className="w-qr-code-box">
              <div style={{ position: 'relative', width: '180px', height: '180px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Visual SVG QR representation */}
                <svg width="150" height="150" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Outer position detection patterns */}
                  <rect x="5" y="5" width="26" height="26" rx="3" stroke="#0f172a" strokeWidth="4" fill="none" />
                  <rect x="11" y="11" width="14" height="14" rx="2" fill="#0f172a" />
                  <rect x="69" y="5" width="26" height="26" rx="3" stroke="#0f172a" strokeWidth="4" fill="none" />
                  <rect x="75" y="11" width="14" height="14" rx="2" fill="#0f172a" />
                  <rect x="5" y="69" width="26" height="26" rx="3" stroke="#0f172a" strokeWidth="4" fill="none" />
                  <rect x="11" y="75" width="14" height="14" rx="2" fill="#0f172a" />
                  {/* Alignment & Data matrix dots */}
                  <rect x="42" y="10" width="8" height="8" rx="1" fill="#2563eb" />
                  <rect x="52" y="18" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="36" y="22" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="10" y="42" width="8" height="8" rx="1" fill="#0f172a" />
                  <rect x="22" y="48" width="8" height="8" rx="1" fill="#2563eb" />
                  <rect x="38" y="38" width="24" height="24" rx="4" fill="#eff6ff" stroke="#2563eb" strokeWidth="2" />
                  <circle cx="50" cy="50" r="6" fill="#2563eb" />
                  <rect x="68" y="42" width="8" height="8" rx="1" fill="#0f172a" />
                  <rect x="80" y="50" width="8" height="8" rx="1" fill="#2563eb" />
                  <rect x="42" y="70" width="8" height="8" rx="1" fill="#0f172a" />
                  <rect x="54" y="78" width="8" height="8" rx="1" fill="#2563eb" />
                  <rect x="72" y="72" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="82" y="82" width="8" height="8" rx="1" fill="#0f172a" />
                </svg>
                <div style={{ position: 'absolute', bottom: '4px', right: '4px', background: '#f8fafc', padding: '1px 5px', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold', color: '#64748b' }}>
                  DEMO QR
                </div>
              </div>

              <div className="w-qr-upi-info">
                <span>Payee: <strong>VMA Automotive Marketplace Demo</strong></span>
                <br />
                <span className="w-qr-upi-id">vma-marketplace@upi</span>
                {referenceId && (
                  <div style={{ marginTop: '6px', fontSize: '11px', color: '#64748b' }}>
                    Ref: <code>{referenceId}</code>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px', color: '#dc2626', fontSize: '12.5px', marginBottom: '14px' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="w-btn w-btn-outline"
                style={{ flex: 1 }}
                onClick={onClose}
                type="button"
                disabled={busy}
              >
                Cancel
              </button>
              <button
                className="w-btn w-btn-primary"
                style={{ flex: 2 }}
                onClick={handleConfirm}
                type="button"
                disabled={busy}
              >
                {busy ? 'Processing Demo…' : confirmButtonText}
              </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '11px', color: '#94a3b8' }}>
              <ShieldCheck size={12} style={{ display: 'inline', verticalAlign: '-1px', marginRight: '4px' }} />
              Test demonstration mode · Non-chargeable transaction
            </div>
          </>
        )}
      </div>
    </div>
  )
}
