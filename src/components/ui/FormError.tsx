type FormErrorProps = {
  message: string | string[]
}

export function FormError({ message }: FormErrorProps) {
  const messages = (Array.isArray(message) ? message : message.split('\n'))
    .map((part) => part.trim())
    .filter(Boolean)

  if (messages.length === 0) {
    return null
  }

  return (
    <div className="form-error-alert" role="alert" aria-live="polite">
      {messages.length === 1 ? (
        <p className="form-error-alert__text">{messages[0]}</p>
      ) : (
        <ul className="form-error-alert__list">
          {messages.map((item, index) => (
            <li key={`${index}-${item}`}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
