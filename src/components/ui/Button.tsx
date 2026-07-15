import type { ComponentProps } from 'react'

type ButtonProps = ComponentProps<'button'>

export function Button({ className, ...props }: ButtonProps) {
  const classes = className ? `btn ${className}` : 'btn'
  return <button className={classes} {...props} />
}
