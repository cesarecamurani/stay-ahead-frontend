const CURRENT_YEAR = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="footer">
      &copy; {CURRENT_YEAR} Stay Ahead
    </footer>
  )
}
