import { SummaryCard } from './SummaryCard.tsx'

export function DashboardSummary() {
  return (
    <section className="dashboard-section">
      <div className="summary-cards">
        <SummaryCard label="Monthly Income" value="€0" />
        <SummaryCard label="Savings" value="€0" />
        <SummaryCard label="Upcoming Commitments" value="0" />
      </div>
    </section>
  )
}
