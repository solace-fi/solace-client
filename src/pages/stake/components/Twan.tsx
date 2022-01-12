import { TwStyle } from 'twin.macro'
import React from 'react'
import styled from 'styled-components'

export default function Twan({
  className,
  children,
  css,
  ...props
}: {
  className?: string
  children?: React.ReactNode | React.ReactNode[]
  css?: TwStyle | string
  [key: string]: any
}): JSX.Element {
  // grab the css style prop and put it in a styled div (use pure styled/components, do not use tw(
  const Styled = styled.span`
    ${css}
  `
  return (
    <Styled className={className} {...props}>
      {children}
    </Styled>
  )
}
