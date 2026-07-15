import type { ComponentProps } from 'react'

type InputProps = ComponentProps<'input'> & {
  label: string
  id: string
  error?: string | null
}

export function Input({ label, id, error, className, ...props }: InputProps) {
  const inputClassName = ['form-input', error ? 'form-input--error' : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <input id={id} className={inputClassName} aria-invalid={error ? true : undefined} {...props} />
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
