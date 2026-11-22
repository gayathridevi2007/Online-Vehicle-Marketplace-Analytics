import { ChevronRight } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { NAV_ITEMS } from '../navigation.js'

function Breadcrumbs() {
  const location = useLocation()
  const currentPage = NAV_ITEMS.find((item) => item.path === location.pathname)

  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <Link to="/admin">Workspace</Link>
      {location.pathname !== '/admin' && (
        <>
          <ChevronRight aria-hidden="true" size={14} />
          <span aria-current="page">{currentPage?.label || 'Not found'}</span>
        </>
      )}
    </nav>
  )
}

export default Breadcrumbs
