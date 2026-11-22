import { Link } from 'react-router-dom'
import PageContainer from '../components/PageContainer.jsx'

function NotFoundPage() {
  return (
    <PageContainer className="not-found-page">
      <span className="eyebrow">404 · ROUTE NOT FOUND</span>
      <h1>This workspace page does not exist.</h1>
      <p>Use the project navigation to return to a supported module.</p>
      <Link className="primary-button" to="/">Return to overview</Link>
    </PageContainer>
  )
}

export default NotFoundPage
