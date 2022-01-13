import React from 'react'

export default function Twiv({
  className,
  children,
  css,
  ...props
}: {
  className?: string
  children?: React.ReactNode | React.ReactNode[]
  css?: string | string[]
  span?: boolean
  [key: string]: any
}): JSX.Element {
  const stringifiedCss = Array.isArray(css) ? css.join(' ') : css
  return (
    <span className={stringifiedCss + ' ' + className} {...props}>
      {children}
    </span>
  )
}
