import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

function NavigationCard({ item }) {
  const Icon = item.icon

  return (
    <Link className="module-card" to={item.path}>
      <div className="module-card-top">
        <span className="module-icon"><Icon aria-hidden="true" size={19} strokeWidth={1.8} /></span>
        <ArrowUpRight aria-hidden="true" className="module-arrow" size={17} />
      </div>
      <h3>{item.label}</h3>
      <p>{item.description}</p>
      <span className="module-status">{item.status}</span>
    </Link>
  )
}

export default NavigationCard
