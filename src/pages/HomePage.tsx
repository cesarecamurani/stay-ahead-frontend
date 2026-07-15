import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.ts'

export function HomePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <main>
      <h1>Stay Ahead</h1>
      <p>Welcome, {user?.email}</p>
      <button type="button" onClick={handleLogout}>
        Log out
      </button>
    </main>
  )
}
