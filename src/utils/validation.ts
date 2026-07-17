export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function validateUsername(value: string): string | null {
  const trimmed = value.trim()

  if (!trimmed) {
    return 'Username is required.'
  }

  if (trimmed.length < 3 || trimmed.length > 30) {
    return 'Username must be between 3 and 30 characters.'
  }

  if (!/^[a-z0-9_]+$/.test(trimmed.toLowerCase())) {
    return 'Username can only contain lowercase letters, numbers, and underscores.'
  }

  return null
}

export function validateEmail(value: string): string | null {
  if (!value.trim()) {
    return 'Email is required.'
  }

  if (!isValidEmail(value)) {
    return 'Please enter a valid email address.'
  }

  return null
}

export function validatePassword(value: string): string | null {
  if (!value) {
    return 'Password is required.'
  }

  if (value.length < 12) {
    return 'Password must be at least 12 characters.'
  }

  if (!/[A-Z]/.test(value)) {
    return 'Password must contain at least one uppercase letter.'
  }

  if (!/[a-z]/.test(value)) {
    return 'Password must contain at least one lowercase letter.'
  }

  if (!/[0-9]/.test(value)) {
    return 'Password must contain at least one number.'
  }

  if (!/[^A-Za-z0-9]/.test(value)) {
    return 'Password must contain at least one special character.'
  }

  return null
}
