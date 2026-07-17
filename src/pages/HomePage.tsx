import { Breakdown } from '../components/dashboard/Breakdown.tsx'
import { DashboardSummary } from '../components/dashboard/DashboardSummary.tsx'
import { DashboardWelcome } from '../components/dashboard/DashboardWelcome.tsx'
import { QuickActions } from '../components/dashboard/QuickActions.tsx'
import { Layout } from '../components/layout/Layout.tsx'

export function HomePage() {
  return (
    <Layout>
      <div className="dashboard">
        <DashboardWelcome />
        <DashboardSummary />
        <Breakdown />
        <QuickActions />
      </div>
    </Layout>
  )
}
