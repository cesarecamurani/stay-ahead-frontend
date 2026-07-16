import type { ComponentProps } from 'react'

type ButtonProps = ComponentProps<'button'>

export function Button({ className, ...props }: ButtonProps) {
  const classes = ['btn', className].filter(Boolean).join(' ')

  return <button className={classes} {...props} />
}
