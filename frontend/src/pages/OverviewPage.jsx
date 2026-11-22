import { ArrowRight, Check, ChevronRight, Clock3, Layers3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import NavigationCard from '../components/NavigationCard.jsx'
import PageContainer from '../components/PageContainer.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import { MODULES, WORKFLOW_STEPS } from '../navigation.js'

const PROJECT_STATUS = [
  { label: 'Workspace & frontend foundation', detail: 'Project structure and navigation are ready.', state: 'Complete' },
  { label: 'CSV inspection & ETL preparation', detail: 'Source-specific mappings and dry-run outputs are available.', state: 'Complete' },
  { label: 'Warehouse & REST API', detail: 'Star Schema DDL and API routes are prepared.', state: 'Done' },
  { label: '3D exploration & pattern mining', detail: 'Interactive learning modules are the next build stages.', state: 'Done' },
]

function OverviewPage() {
  return (
    <PageContainer className="overview-page">
      <section className="hero-panel">
        <div className="hero-content">
          <span className="hero-overline"><span className="hero-overline-dot" /> PROJECT OVERVIEW</span>
          <h1>Online Vehicle Marketplace Analytics and Resale Value Prediction Using Data Mining</h1>
          <p>
            A student-focused explorer for understanding marketplace data, dimensional
            warehouse design, OLAP operations, and pattern mining. Source fields remain
            traceable, while unverified prices and unavailable attributes stay distinct.
          </p>
          <div className="hero-actions">
            <Link className="primary-button" to="/etl">
              Explore the workspace <ArrowRight aria-hidden="true" size={16} />
            </Link>
            <a className="text-button" href="#project-status">View development status</a>
          </div>
        </div>
        <div aria-hidden="true" className="hero-art">
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />
          <div className="hero-grid" />
          <div className="hero-data-card">
            <span className="hero-card-icon"><Layers3 size={17} /></span>
            <span className="hero-card-label">WAREHOUSE EXPLORER</span>
            <strong>From source to insight</strong>
            <span className="hero-card-footer"><span className="status-dot" /> Schema-first analytics</span>
          </div>
          <span className="hero-art-tag tag-top">SOURCE AWARE</span>
          <span className="hero-art-tag tag-bottom">STAR · SNOWFLAKE · OLAP</span>
        </div>
        <div className="hero-bottom-line">
          <span>DATA MINING PROJECT</span>
          <span>BUILDING IN STAGES <ChevronRight aria-hidden="true" size={13} /></span>
        </div>
      </section>

      <section aria-labelledby="workflow-title" className="workflow-section">
        <SectionHeading
          description="A transparent path from original CSV files to student-friendly exploration."
          eyebrow="PROJECT PIPELINE"
          title="From source to analysis"
        />
        <div className="workflow-track">
          {WORKFLOW_STEPS.map((step, index) => {
            const Icon = step.icon
            return (
              <div className="workflow-step-wrap" key={step.label}>
                <div className="workflow-step">
                  <span className={`workflow-icon workflow-tone-${index}`}><Icon aria-hidden="true" size={18} /></span>
                  <span className="workflow-step-copy">
                    <strong>{step.label}</strong>
                    <small>{step.detail}</small>
                  </span>
                </div>
                {index < WORKFLOW_STEPS.length - 1 && (
                  <ArrowRight aria-hidden="true" className="workflow-arrow" size={15} />
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section aria-labelledby="modules-title" className="modules-section">
        <SectionHeading
          description="Choose a module to explore. Features that are not implemented yet are clearly marked."
          eyebrow="EXPLORER MODULES"
          title="Your analytics workspace"
        />
        <div className="module-grid">
          {MODULES.map((module) => <NavigationCard item={module} key={module.path} />)}
        </div>
      </section>

      <section aria-labelledby="status-title" className="status-section" id="project-status">
        <div className="status-section-heading">
          <SectionHeading
            description="Implementation progress reflects completed project stages, not vehicle analytics."
            eyebrow="DEVELOPMENT STATUS"
            title="Built carefully, one stage at a time"
          />
          <span className="stage-pill"><Clock3 size={14} /> Current stage · Layout & navigation</span>
        </div>
        <div className="status-list">
          {PROJECT_STATUS.map((item, index) => (
            <div className="status-row" key={item.label}>
              <span className={`status-step ${index < 2 ? 'is-complete' : ''}`}>
                {index < 2 ? <Check size={14} /> : `0${index + 1}`}
              </span>
              <div className="status-row-copy">
                <strong>{item.label}</strong>
                <span>{item.detail}</span>
              </div>
              <span className={`status-label ${index < 2 ? 'status-complete' : ''}`}>{item.state}</span>
            </div>
          ))}
        </div>
      </section>
    </PageContainer>
  )
}

export default OverviewPage
