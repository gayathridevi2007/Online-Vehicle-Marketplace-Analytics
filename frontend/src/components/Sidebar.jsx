import { ArrowUpRight, Layers3 } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { MARKETPLACE_REVIEW_ITEM, NAV_ITEMS } from '../navigation.js'

function Sidebar({ collapsed, mobileOpen, onClose }) {
  return (
    <aside
      aria-label="Main navigation"
      className={`sidebar ${collapsed ? 'is-collapsed' : ''} ${mobileOpen ? 'is-mobile-open' : ''}`}
    >
      <NavLink
        aria-label="Online Vehicle Marketplace Analytics overview"
        className="brand-lockup"
        onClick={onClose}
        to="/"
      >
        <span className="brand-mark"><Layers3 size={21} strokeWidth={1.8} /></span>
        <span className="brand-copy">
          <span className="brand-name">VMA Explorer</span>
          <span className="brand-caption">ADMIN & ANALYTICS</span>
        </span>
      </NavLink>

      <div className="sidebar-section-label">Admin & Analytics</div>
      <nav className="sidebar-nav">
        {[NAV_ITEMS[0], MARKETPLACE_REVIEW_ITEM, ...NAV_ITEMS.slice(1)].map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              aria-label={item.label}
              className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
              end={item.path === '/'}
              key={item.path}
              onClick={onClose}
              title={collapsed ? item.label : undefined}
              to={item.path}
            >
              <Icon aria-hidden="true" className="nav-icon" size={18} strokeWidth={1.8} />
              <span className="nav-label">{item.label}</span>
              <span className="nav-active-mark" />
            </NavLink>
          )
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-note">
          <span className="sidebar-note-icon"><ArrowUpRight size={15} /></span>
          <div className="sidebar-note-copy">
            <strong>Warehouse status</strong>
            <span>Star Schema loaded</span>
            <span className="pending-line">Live status on analytics page</span>
          </div>
        </div>
        <div className="sidebar-version">
          <span className="status-dot" />
          <span className="nav-label">Project workspace</span>
        </div>
        <Link className="sidebar-customer-link" to="/">Customer Marketplace <ArrowUpRight size={14} /></Link>
      </div>
    </aside>
  )
}

export default Sidebar
