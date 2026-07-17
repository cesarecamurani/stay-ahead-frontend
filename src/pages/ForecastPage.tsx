import { Link } from 'react-router-dom'
import { Forecast } from '../components/dashboard/Forecast.tsx'
import { Layout } from '../components/layout/Layout.tsx'

export function ForecastPage() {
  return (
    <Layout>
      <div className="dashboard">
        <header className="forecast-page__header">
          <Link to="/" className="forecast-page__back">
            <span className="forecast-page__back-icon" aria-hidden="true">
              ←
            </span>
            Back to dashboard
          </Link>
          <div className="forecast-page__heading">
            <h1 className="forecast-page__title">Forecast</h1>
            <p className="forecast-page__subtitle">
              Upcoming commitment occurrences in the selected period.
            </p>
          </div>
        </header>
        <Forecast />
      </div>
    </Layout>
  )
}
