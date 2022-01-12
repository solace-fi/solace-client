import { TwStyle } from 'twin.macro'
import React from 'react'
import styled from 'styled-components'

export default function Twiv({
  className,
  children,
  css,
  span,
  ...props
}: {
  className?: string
  children?: React.ReactNode | React.ReactNode[]
  css?: TwStyle | TwStyle[]
  span?: boolean
  [key: string]: any
}): JSX.Element {
  // grab the css style prop and put it in a styled div (use pure styled/components, do not use tw(
  const Styled = (span ? styled.span : styled.div)`
    ${css}
  `
  return (
    <Styled className={className} {...props}>
      {children}
    </Styled>
  )
}
