import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CarFront,
  CheckCircle2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  UserPlus,
} from 'lucide-react'
import '../styles/white-marketplace.css'

export default function PortalChoiceLanding() {
  return (
    <div className="portal-split white-marketplace-theme">
      <div className="portal-split-container">
        {/* LEFT SIDE: Realistic car photograph & automotive branding */}
        <div className="portal-left">
          <div className="portal-left-overlay">
            <div className="portal-left-brand">
              <div className="portal-brand-badge">
                <CarFront size={24} />
              </div>
              <div>
                <span className="portal-brand-title">VMA AutoMarket</span>
                <span className="portal-brand-tag">Premium Automotive Platform</span>
              </div>
            </div>

            <div className="portal-left-hero-text">
              <span className="portal-left-pill">
                <Sparkles size={14} /> India's Premium Automotive Platform
              </span>
              <h2>Buy or Sell Vehicles with Confidence</h2>
              <p>
                Experience verified quality, transparent pricing, and specialized portals built specifically for vehicle buyers and independent sellers.
              </p>
              <div className="portal-feature-badges">
                <div className="portal-feature-badge">
                  <ShieldCheck size={16} /> 100% Verified Listings
                </div>
                <div className="portal-feature-badge">
                  <CheckCircle2 size={16} /> Secure Demo Escrow
                </div>
                <div className="portal-feature-badge">
                  <CarFront size={16} /> Transparent Pricing
                </div>
              </div>
            </div>

            <div className="portal-left-footer">
              <span>© 2026 VMA AutoMarket Analytics. All rights reserved.</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Clean white rounded login panel */}
        <div className="portal-right">
          <div className="portal-panel">
            <span className="portal-panel-badge">
              <Sparkles size={12} /> Portal Gateway
            </span>
            <h1 className="portal-heading">Buy or Sell Vehicles with Confidence</h1>
            <p className="portal-subtitle">
              Welcome to VMA AutoMarket. Choose your dedicated account portal to continue.
            </p>

            <div className="portal-actions-stack">
              <Link to="/buyer/login" className="portal-btn portal-btn-primary">
                <ShoppingBag size={18} />
                <span>Login as Buyer</span>
                <ArrowRight size={16} style={{ marginLeft: 'auto' }} />
              </Link>

              <Link to="/seller/login" className="portal-btn portal-btn-success">
                <Store size={18} />
                <span>Login as Seller</span>
                <ArrowRight size={16} style={{ marginLeft: 'auto' }} />
              </Link>

              <Link to="/buyer/register" className="portal-btn portal-btn-outline">
                <UserPlus size={18} />
                <span>Create New Account</span>
              </Link>

              <Link to="/admin-login" className="portal-btn portal-btn-admin">
                <ShieldCheck size={16} />
                <span>Admin Login</span>
              </Link>
            </div>

            <Link to="/buyer" className="portal-back-link">
              <ArrowLeft size={15} />
              <span>Back to Marketplace</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
