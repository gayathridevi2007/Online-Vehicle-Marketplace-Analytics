import { AlertCircle, LoaderCircle, Sparkles } from 'lucide-react'

export function LoadingState({ message = 'Loading workspace…' }) {
  return (
    <div aria-live="polite" className="feedback-state">
      <LoaderCircle aria-hidden="true" className="feedback-icon is-spinning" size={22} />
      <span>{message}</span>
    </div>
  )
}

export function ErrorState({ title = 'Something went wrong', message }) {
  return (
    <div aria-live="assertive" className="feedback-state feedback-error" role="alert">
      <AlertCircle aria-hidden="true" className="feedback-icon" size={22} />
      <div><strong>{title}</strong><span>{message}</span></div>
    </div>
  )
}

export function EmptyState({ title = 'Nothing here yet', message }) {
  return (
    <div className="feedback-state feedback-empty">
      <Sparkles aria-hidden="true" className="feedback-icon" size={22} />
      <div><strong>{title}</strong><span>{message}</span></div>
    </div>
  )
}
