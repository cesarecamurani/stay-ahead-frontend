export function PasswordRequirements() {
  return (
    <div className="password-requirements">
      <p>Password must contain:</p>
      <ul>
        <li>At least 12 characters</li>
        <li>At least one uppercase letter</li>
        <li>At least one lowercase letter</li>
        <li>At least one number</li>
        <li>At least one special character</li>
      </ul>
    </div>
  )
}
