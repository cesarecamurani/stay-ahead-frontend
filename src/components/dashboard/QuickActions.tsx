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
        Commitments
      </Button>
      <Button
        type="button"
        className="quick-actions__button"
        onClick={() => navigate('/forecast')}
      >
        Forecast
      </Button>
      <Button
        type="button"
        className="quick-actions__button"
        onClick={() => navigate('/profile')}
      >
        Update profile
      </Button>
    </section>
  )
}
