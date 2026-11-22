
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Crown, ShieldCheck, Star, Zap } from 'lucide-react'
import { WhiteMarketplaceHeader } from '../components/WhiteMarketplaceHeader.jsx'
import { QrDemoPaymentModal } from '../components/QrDemoPaymentModal.jsx'
import { useCustomerAuth } from '../context/CustomerAuthContext.js'
import { api } from '../services/api.js'
import '../styles/white-marketplace.css'

export default function BuyerMembershipPage() {
  const navigate = useNavigate()
  const { account, refreshAccount } = useCustomerAuth()
  const [membershipData, setMembershipData] = useState(null)
  const [purchasingPlan, setPurchasingPlan] = useState(null)
  const [successNotice, setSuccessNotice] = useState('')
  const [hoveredTier, setHoveredTier] = useState(null)

  useEffect(() => {
    if (!account) return
    api.marketplaceMembershipStatus()
      .then((data) => setMembershipData(data))
      .catch(() => {})
  }, [account])

  function handleStartPurchase(plan) {
    if (!account) {
      navigate('/buyer/login')
      return
    }
    setPurchasingPlan(plan)
  }

  async function handleConfirmPurchase() {
    if (!purchasingPlan) return
    const res = await api.marketplacePurchaseMembership(purchasingPlan.type)
    await refreshAccount()
    setSuccessNotice(`Congratulations! You have successfully upgraded to ${purchasingPlan.title} membership.`)
    api.marketplaceMembershipStatus().then((data) => setMembershipData(data))
    return res
  }

  const currentTier = membershipData?.buyer_tier || account?.buyer_tier || 'FREE'
  const expiresAt = membershipData?.buyer_tier_expires_at || account?.buyer_tier_expires_at

  const TIERS = [
    {
      id: 'FREE',
      type: 'BUYER_FREE',
      title: 'Free Explorer',
      price: '₹0',
      period: 'Forever free',
      description: 'Ideal for buyers browsing vehicles and testing the marketplace.',
      isCurrent: currentTier === 'FREE',
      icon: Star,
      features: [
        'Browse 10 vehicle listings per page',
        'Standard vehicle specifications and photos',
        'Compare up to 2 vehicles side by side',
        'Guest and registered browsing',
      ],
      buttonText: 'Current Plan',
      buttonDisabled: true,
      buttonStyle: 'w-btn-outline',
    },
    {
      id: 'BASIC',
      type: 'BUYER_BASIC',
      title: 'Basic Member',
      price: '₹99',
      period: 'per year',
      description: 'Best for active car buyers looking for verified deals and bookings.',
      isCurrent: currentTier === 'BASIC',
      isPopular: true,
      icon: Zap,
      amountNum: 99,
      features: [
        'Everything in Free Plan',
        'Full technical specifications & seller contact',
        'Compare up to 4 vehicles side by side',
        'Unlimited saved favourites across sessions',
        'Reserve vehicles with 50% demo deposit',
        'Access to vehicle inspection summary',
      ],
      buttonText: currentTier === 'BASIC' ? 'Active Plan · Renew (₹99)' : 'Upgrade to Basic (₹99/yr)',
      buttonDisabled: false,
      buttonStyle: 'w-btn-primary',
    },
    {
      id: 'PREMIUM',
      type: 'BUYER_PREMIUM',
      title: 'Premium VIP',
      price: '₹999',
      period: 'per year',
      description: 'Ultimate automotive privilege with priority bookings and concierge.',
      isCurrent: currentTier === 'PREMIUM',
      icon: Crown,
      amountNum: 999,
      features: [
        'Everything in Basic Plan',
        'Priority vehicle reservation queue',
        'Unlimited vehicle comparisons',
        'Full vehicle ownership document inspection',
        'Instant dealer contact & test drive booking',
        'VIP concierge assistance & report exports',
      ],
      buttonText: currentTier === 'PREMIUM' ? 'Active VIP Plan · Renew (₹999)' : 'Upgrade to Premium VIP (₹999/yr)',
      buttonDisabled: false,
      buttonStyle: 'w-btn-secondary',
    },
  ]

  return (
    <div className="white-marketplace-theme">
      <WhiteMarketplaceHeader />

      <main style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '40px 24px 80px',
        width: '100%',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link
            to="/buyer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: '600',
              color: '#2563eb',
              textDecoration: 'none',
              marginBottom: '12px',
            }}
          >
            <ArrowLeft size={14} /> Back to Buyer Marketplace
          </Link>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: '700',
            color: '#2563eb',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}>
            <Crown size={15} color="#eab308" /> Buyer Membership Tiers
          </div>

          <h1 style={{
            fontSize: '36px',
            fontWeight: '800',
            color: '#0f172a',
            margin: '0 0 10px 0',
            letterSpacing: '-0.03em',
          }}>
            Flexible Automotive Memberships
          </h1>

          <p style={{
            fontSize: '16px',
            color: '#64748b',
            maxWidth: '640px',
            margin: '0 auto',
            lineHeight: 1.5,
          }}>
            Choose the tier that matches your car shopping needs. Unlock full vehicle details, 50% deposit reservation, and unlimited comparisons.
          </p>

          {account && (
            <div style={{
              marginTop: '16px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '30px',
              padding: '6px 16px',
            }}>
              <span style={{ fontSize: '13px', color: '#1e40af' }}>
                Signed in as <strong>{account.full_name}</strong> · Current Tier: <strong>{currentTier}</strong>
              </span>
              {expiresAt && (
                <span style={{ fontSize: '12px', color: '#2563eb' }}>
                  (Expires: {new Date(expiresAt).toLocaleDateString()})
                </span>
              )}
            </div>
          )}

          {successNotice && (
            <div style={{
              maxWidth: '600px',
              margin: '20px auto 0',
              background: '#f0fdf4',
              border: '1px solid #86efac',
              borderRadius: '10px',
              padding: '12px 18px',
              color: '#166534',
              fontSize: '14px',
              fontWeight: '600',
            }}>
              <Check size={16} style={{
                display: 'inline',
                verticalAlign: '-3px',
                marginRight: '6px',
              }} />
              {successNotice}
            </div>
          )}
        </div>

        {/* Membership Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          alignItems: 'stretch',
        }}>
          {TIERS.map((tier) => {
            const Icon = tier.icon
            const isHovered = hoveredTier === tier.id

            return (
              <div
                key={tier.id}
                onMouseEnter={() => setHoveredTier(tier.id)}
                onMouseLeave={() => setHoveredTier(null)}
                style={{
                  background: '#ffffff',
                  border: isHovered
                    ? '2px solid #2563eb'
                    : tier.isCurrent
                      ? '2px solid #2563eb'
                      : '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '32px 24px',
                  boxShadow: isHovered
                    ? '0 20px 40px rgba(37, 99, 235, 0.16)'
                    : tier.isPopular
                      ? 'var(--w-shadow-lg)'
                      : 'var(--w-shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',

                  // Subtle hover animation
                  transform: isHovered
                    ? 'translateY(-8px) scale(1.015)'
                    : 'translateY(0) scale(1)',

                  transition: 'transform 250ms ease, box-shadow 250ms ease, border-color 250ms ease',
                  zIndex: isHovered ? 2 : 1,
                }}
              >
                {tier.isPopular && !tier.isCurrent && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#2563eb',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    padding: '3px 12px',
                    borderRadius: '12px',
                    letterSpacing: '0.04em',
                  }}>
                    Most Popular
                  </div>
                )}

                {tier.isCurrent && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#16a34a',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    padding: '3px 12px',
                    borderRadius: '12px',
                    letterSpacing: '0.04em',
                  }}>
                    Your Current Plan
                  </div>
                )}

                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '14px',
                  }}>
                    <div style={{
                      padding: '8px',
                      borderRadius: '10px',
                      background: tier.isCurrent ? '#eff6ff' : '#f8fafc',
                      color: tier.isCurrent ? '#2563eb' : '#0f172a',
                    }}>
                      <Icon size={22} />
                    </div>

                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: '800',
                      color: '#0f172a',
                      margin: 0,
                    }}>
                      {tier.title}
                    </h3>
                  </div>

                  <p style={{
                    fontSize: '13px',
                    color: '#64748b',
                    margin: '0 0 20px 0',
                    lineHeight: 1.4,
                  }}>
                    {tier.description}
                  </p>

                  <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '6px',
                    marginBottom: '24px',
                    borderBottom: '1px solid #f1f5f9',
                    paddingBottom: '18px',
                  }}>
                    <span style={{
                      fontSize: '36px',
                      fontWeight: '900',
                      color: '#0f172a',
                      letterSpacing: '-0.03em',
                    }}>
                      {tier.price}
                    </span>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>
                      /{tier.period}
                    </span>
                  </div>

                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: '0 0 28px 0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}>
                    {tier.features.map((feat, idx) => (
                      <li
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                          fontSize: '13.5px',
                          color: '#334155',
                        }}
                      >
                        <Check
                          size={16}
                          color="#16a34a"
                          style={{ flexShrink: 0, marginTop: '2px' }}
                        />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  className={`w-btn ${tier.buttonStyle}`}
                  style={{ width: '100%', padding: '12px' }}
                  onClick={() => handleStartPurchase(tier)}
                  disabled={tier.buttonDisabled && !tier.amountNum}
                >
                  {tier.buttonText}
                </button>
              </div>
            )
          })}
        </div>
      </main>

      {/* QR Demo Payment Modal for Memberships */}
      <QrDemoPaymentModal
        isOpen={Boolean(purchasingPlan)}
        onClose={() => setPurchasingPlan(null)}
        title={`${purchasingPlan?.title} Annual Membership`}
        subtitle="1-Year Automotive Marketplace Access"
        amount={purchasingPlan?.amountNum}
        referenceId={`TX-MBR-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`}
        isDeposit={false}
        onConfirm={handleConfirmPurchase}
        confirmButtonText={`Confirm Demo Payment (₹${purchasingPlan?.amountNum})`}
      />
    </div>
  )
}
