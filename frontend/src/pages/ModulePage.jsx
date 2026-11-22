import PageContainer from '../components/PageContainer.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import { EmptyState } from '../components/FeedbackStates.jsx'

function moduleDetails(module) {
  if (module.path === '/etl') {
    return 'The source-specific ETL pipeline and dry-run reports are complete. A dedicated interactive ETL explorer is planned for a later stage.'
  }
  if (module.path === '/warehouse') {
    return 'The Star Schema is initialized and loaded. The architecture explorer remains under development; schema visualizations are available in their own modules.'
  }
  if (module.path === '/vehicle-analytics') {
    return 'The source-aware API endpoints are ready. Database-backed analytics will appear after the PostgreSQL Star Schema is configured and loaded.'
  }
  return 'This learning module is planned but has not been implemented. No demonstration records or simulated analytics are shown here.'
}

function ModulePage({ module }) {
  const Icon = module.icon

  return (
    <PageContainer className="module-page">
      <SectionHeading
        description={module.description}
        eyebrow="EXPLORER MODULE"
        title={module.label}
      />
      <section className="module-coming-soon">
        <div className="coming-soon-icon"><Icon aria-hidden="true" size={22} /></div>
        <span className="eyebrow">MODULE STATUS · {module.status}</span>
        <h2>Interface under development</h2>
        <p>{moduleDetails(module)}</p>
        <EmptyState
          message="This space will be connected to verified project data as the next stages are completed."
          title="No analytics to display yet"
        />
      </section>
    </PageContainer>
  )
}

export default ModulePage
