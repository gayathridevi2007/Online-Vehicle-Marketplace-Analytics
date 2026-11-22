import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import Header from '../components/Header.jsx'
import Sidebar from '../components/Sidebar.jsx'

function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const location = useLocation()

  function toggleSidebar() {
    if (window.matchMedia('(max-width: 760px)').matches) {
      setMobileSidebarOpen((open) => !open)
      return
    }
    setSidebarCollapsed((collapsed) => !collapsed)
  }

  return (
    <div
      className={[
        'app-shell',
        sidebarCollapsed ? 'sidebar-collapsed' : '',
        mobileSidebarOpen ? 'mobile-sidebar-open' : '',
      ].filter(Boolean).join(' ')}
    >
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />
      {mobileSidebarOpen && (
        <button
          aria-label="Close navigation"
          className="mobile-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
          type="button"
        />
      )}
      <div className="app-content">
        <Header onToggleSidebar={toggleSidebar} />
        <main className="main-content" key={location.pathname}>
          <Breadcrumbs />
          <Outlet />
          <footer className="page-footer">
            <span>Online Vehicle Marketplace Analytics</span>
            <span>Data-first · source-aware · student-built</span>
          </footer>
        </main>
      </div>
    </div>
  )
}

export default AppLayout
