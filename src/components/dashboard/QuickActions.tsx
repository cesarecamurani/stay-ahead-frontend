import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button.tsx'

export function QuickActions() {
  const navigate = useNavigate()

  return (
    <section className="dashboard-section quick-actions">
      <Button
        type="button"
        className="quick-actions__button"
        onClick={() => navigate('/commitments')}
      >
        View Commitments
      </Button>
      <Button type="button" className="quick-actions__button" disabled>
        Forecast
      </Button>
    </section>
  )
}
