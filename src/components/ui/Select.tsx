import type { ComponentProps } from 'react'

type SelectOption = {
  value: string
  label: string
}

type SelectProps = Omit<ComponentProps<'select'>, 'children'> & {
  label: string
  id: string
  options: SelectOption[]
  error?: string | null
}

function ChevronDownIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="select-input__icon"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export function Select({
  label,
  id,
  options,
  error,
  ...props
}: SelectProps) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <div className="select-input">
        <select id={id} className="form-select select-input__field" {...props}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon />
      </div>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
