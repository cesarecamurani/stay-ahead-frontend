import { useRef, type ChangeEvent, type ComponentProps } from 'react'
import {
  formatThousands,
  parseFormattedNumber,
  sanitizeNumericInput,
} from '../../utils/formatNumber.ts'

type NumberInputProps = Omit<
  ComponentProps<'input'>,
  'type' | 'value' | 'onChange'
> & {
  label: string
  id: string
  value: string
  onValueChange: (value: string) => void
  error?: string | null
}

function ChevronUpIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m18 15-6-6-6 6" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function formatStepValue(value: number, step: number): string {
  if (!Number.isFinite(value)) {
    return ''
  }

  const decimalPlaces = step.toString().includes('.')
    ? step.toString().split('.')[1]?.length ?? 0
    : 0

  return decimalPlaces > 0 ? value.toFixed(decimalPlaces) : String(value)
}

export function NumberInput({
  label,
  id,
  error,
  value,
  onValueChange,
  disabled,
  step = 1,
  min = 0,
  className,
  ...props
}: NumberInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const numericStep = Number(step) || 1
  const numericMin = Number(min) || 0
  const inputClassName = [
    'form-input',
    'number-input__field',
    error ? 'form-input--error' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onValueChange(sanitizeNumericInput(event.target.value))
  }

  function handleStep(direction: 'up' | 'down') {
    if (disabled) {
      return
    }

    const current = parseFormattedNumber(value)
    const base = Number.isFinite(current) ? current : numericMin
    const next =
      direction === 'up'
        ? base + numericStep
        : Math.max(numericMin, base - numericStep)

    onValueChange(formatStepValue(next, numericStep))
    inputRef.current?.focus()
  }

  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <div className="number-input">
        <input
          ref={inputRef}
          id={id}
          type="text"
          inputMode="decimal"
          className={inputClassName}
          value={formatThousands(value)}
          onChange={handleChange}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          step={step}
          min={min}
          {...props}
        />
        <div className="number-input__controls">
          <button
            type="button"
            className="number-input__step"
            onClick={() => handleStep('up')}
            aria-label={`Increase ${label.toLowerCase()}`}
            disabled={disabled}
          >
            <ChevronUpIcon />
          </button>
          <button
            type="button"
            className="number-input__step"
            onClick={() => handleStep('down')}
            aria-label={`Decrease ${label.toLowerCase()}`}
            disabled={disabled}
          >
            <ChevronDownIcon />
          </button>
        </div>
      </div>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
