import { Button } from '../ui/Button.tsx'

export function QuickActions() {
  return (
    <section className="dashboard-section quick-actions">
      <Button type="button" className="quick-actions__button" disabled>
        View Commitments
      </Button>
      <Button type="button" className="quick-actions__button" disabled>
        Forecast
      </Button>
    </section>
  )
}
