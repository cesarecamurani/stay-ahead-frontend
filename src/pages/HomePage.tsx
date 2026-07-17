import { DashboardSummary } from '../components/dashboard/DashboardSummary.tsx'
import { DashboardWelcome } from '../components/dashboard/DashboardWelcome.tsx'
import { QuickActions } from '../components/dashboard/QuickActions.tsx'
import { UpcomingCommitments } from '../components/dashboard/UpcomingCommitments.tsx'
import { Layout } from '../components/layout/Layout.tsx'

export function HomePage() {
  return (
    <Layout>
      <div className="dashboard">
        <DashboardWelcome />
        <DashboardSummary />
        <UpcomingCommitments />
        <QuickActions />
      </div>
    </Layout>
  )
}
