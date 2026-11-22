import { Link, useLocation } from 'react-router-dom'
import {
  CarFront,
  Crown,
  Heart,
  Layers,
  LogOut,
  PlusCircle,
  ShieldCheck,
  ShoppingBag,
  Store,
  User,
} from 'lucide-react'
import { useCustomerAuth } from '../context/CustomerAuthContext.js'
import { useAdminPortalAuth } from '../context/useAdminPortalAuth.js'

export function WhiteMarketplaceHeader() {
  const location = useLocation()
  const { account, logout } = useCustomerAuth()
  const { moderator } = useAdminPortalAuth()

  const isBuyerRoute = location.pathname.startsWith('/buyer') || location.pathname === '/'
  const isSellerRoute = location.pathname.startsWith('/seller')

  return (
    <header className="w-header">
      <div className="w-header-inner">
        {/* Brand */}
        <Link to="/" className="w-brand" aria-label="VMA AutoMarket Home">
          <div className="w-brand-badge">
            <CarFront size={22} strokeWidth={2.2} />
          </div>
          <div className="w-brand-text">
            <span className="w-brand-name">VMA AutoMarket</span>
            <span className="w-brand-tagline">Verified Automotive Marketplace</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="w-nav-links" aria-label="Marketplace Navigation">
          <Link
            to="/buyer"
            className={`w-nav-link ${isBuyerRoute && location.pathname !== '/' ? 'active' : ''}`}
          >
            <ShoppingBag size={15} />
            <span>Buyer Marketplace</span>
          </Link>

          <Link
            to="/seller"
            className={`w-nav-link ${isSellerRoute ? 'active' : ''}`}
          >
            <Store size={15} />
            <span>Seller Portal</span>
          </Link>

          <Link
            to="/buyer/compare"
            className={`w-nav-link ${location.pathname === '/buyer/compare' ? 'active' : ''}`}
          >
            <Layers size={15} />
            <span>Compare</span>
          </Link>

          <Link
            to="/buyer/favourites"
            className={`w-nav-link ${location.pathname === '/buyer/favourites' ? 'active' : ''}`}
          >
            <Heart size={15} />
            <span>Favourites</span>
          </Link>

          <Link
            to="/buyer/bookings"
            className={`w-nav-link ${location.pathname === '/buyer/bookings' ? 'active' : ''}`}
          >
            <span>My Bookings</span>
          </Link>

          <Link
            to="/buyer/membership"
            className={`w-nav-link ${location.pathname === '/buyer/membership' ? 'active' : ''}`}
          >
            <Crown size={15} color="#eab308" />
            <span>Memberships</span>
          </Link>

          <Link
            to="/marketplace-review"
            className={`w-nav-link ${location.pathname === '/marketplace-review' ? 'active' : ''}`}
            style={{ color: '#0369a1', background: '#f0f9ff' }}
          >
            <ShieldCheck size={15} />
            <span>Admin Review</span>
          </Link>
        </nav>

        {/* User Account / Auth Actions */}
        <div className="w-header-actions">
          {account ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                {account.profile_image ? (
                  <img
                    src={account.profile_image}
                    alt={account.full_name}
                    style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <User size={16} color="#64748b" />
                )}
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                  <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#0f172a' }}>
                    {account.full_name}
                  </span>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', fontWeight: '700', color: account.buyer_tier === 'PREMIUM' ? '#ca8a04' : '#2563eb', background: account.buyer_tier === 'PREMIUM' ? '#fef9c3' : '#eff6ff', padding: '1px 4px', borderRadius: '3px' }}>
                      {account.buyer_tier || 'FREE'}
                    </span>
                    {account.seller_membership_status === 'ACTIVE' && (
                      <span style={{ fontSize: '10px', fontWeight: '700', color: '#16a34a', background: '#dcfce7', padding: '1px 4px', borderRadius: '3px' }}>
                        SELLER
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {isSellerRoute && (
                <Link to="/seller/submit-listing" className="w-btn w-btn-primary w-btn-sm">
                  <PlusCircle size={14} /> Sell Car
                </Link>
              )}

              <button
                className="w-btn w-btn-outline w-btn-sm"
                onClick={logout}
                title="Sign out"
                type="button"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link to="/buyer/login" className="w-btn w-btn-outline w-btn-sm">
                Buyer Sign In
              </Link>
              <Link to="/seller/login" className="w-btn w-btn-primary w-btn-sm">
                Seller Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
