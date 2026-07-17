import { Link } from 'react-router-dom'
import { CommitmentList } from '../components/commitments/CommitmentList.tsx'
import { Layout } from '../components/layout/Layout.tsx'

export function CommitmentsPage() {
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
          <h1 className="commitments-page__title">Commitments</h1>
          <p className="commitments-page__subtitle">
            Manage your financial commitments.
          </p>
        </header>
        <CommitmentList />
      </div>
    </Layout>
  )
}
