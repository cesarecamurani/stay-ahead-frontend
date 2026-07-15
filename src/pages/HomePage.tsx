import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.ts'
import { Layout } from '../components/layout/Layout.tsx'
import { Button } from '../components/ui/Button.tsx'

export function HomePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <Layout>
      <div className="home-content">
        <h1>Stay Ahead</h1>
        <p>Welcome, {user?.email}</p>
        <Button type="button" onClick={handleLogout}>
          Log out
        </Button>
      </div>
    </Layout>
  )
}
