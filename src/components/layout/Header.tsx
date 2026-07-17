import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth.ts'

export function Header() {
  const { token, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="header">
      <a href="/" className="header__brand">
        <span className="header__logo" aria-hidden="true" />
        Stay Ahead
      </a>
      {token ? (
        <button
          type="button"
          className="header__logout"
          onClick={handleLogout}
        >
          Log out
        </button>
      ) : null}
    </header>
  )
}
