import { useAuth } from '../../auth/useAuth.ts'

function getGreeting(): string {
  const hour = new Date().getHours()

  if (hour < 12) {
    return 'Good morning,'
  }

  if (hour < 18) {
    return 'Good afternoon,'
  }

  return 'Good evening,'
}

export function DashboardWelcome() {
  const { user } = useAuth()

  return (
    <section className="dashboard-welcome">
      <p className="dashboard-welcome__greeting">{getGreeting()}</p>
      <h1 className="dashboard-welcome__name">{user?.username}</h1>
      <p className="dashboard-welcome__subtitle">
        Here&apos;s your financial overview.
      </p>
    </section>
  )
}
