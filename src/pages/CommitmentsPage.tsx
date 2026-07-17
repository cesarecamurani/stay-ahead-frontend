import { Link, useNavigate } from 'react-router-dom'
import { CommitmentList } from '../components/commitments/CommitmentList.tsx'
import { Layout } from '../components/layout/Layout.tsx'
import { Button } from '../components/ui/Button.tsx'

export function CommitmentsPage() {
  const navigate = useNavigate()

  return (
    <Layout>
      <div className="dashboard">
        <header className="commitments-page__header">
          <Link to="/" className="commitments-page__back">
            <span className="commitments-page__back-icon" aria-hidden="true">
              ←
            </span>
            Back to dashboard
          </Link>
          <div className="commitments-page__heading">
            <div>
              <h1 className="commitments-page__title">Commitments</h1>
              <p className="commitments-page__subtitle">
                Manage your financial commitments.
              </p>
            </div>
            <Button
              type="button"
              className="commitments-page__create"
              onClick={() => navigate('/commitments/new')}
            >
              Add commitment
            </Button>
          </div>
        </header>
        <CommitmentList />
      </div>
    </Layout>
  )
}
