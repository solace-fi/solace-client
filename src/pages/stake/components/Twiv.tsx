import React from 'react'

export default function Twiv({
  className,
  children,
  css,
  style,
  ...props
}: {
  className?: string
  children?: React.ReactNode | React.ReactNode[]
  css?: string | string[]
  span?: boolean
  style?: React.CSSProperties
  [key: string]: any
}): JSX.Element {
  const stringifiedCss = Array.isArray(css) ? css.join(' ') : css
  return (
    <div className={stringifiedCss + ' ' + className} {...props} style={style}>
      {children}
    </div>
  )
}
