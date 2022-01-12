import React from 'react'
import styled, { DefaultTheme, FlattenInterpolation, ThemedStyledProps } from 'styled-components'
import { TwStyle } from 'twin.macro'

// function baseDiv takes in a css prop, a tailwind TwStyle, and a className (all optional)
// and returns a styled div with the css prop and the className
function BaseDiv({
  css,
  tw,
  className,
  ...props
}: {
  css?: any
  tw?: TwStyle
  className?: string
  children?: React.ReactNode | React.ReactNode[]
  props?: any
}): JSX.Element {
  const Styled = styled.div`
    ${tw}
    ${css ?? ''}
  `
  return (
    <Styled className={className} {...props}>
      {'children' in props ? (props as { children: any }).children : null}
    </Styled>
  )
}

export default BaseDiv
