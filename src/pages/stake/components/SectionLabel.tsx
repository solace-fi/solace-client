import React from 'react'
import styled, { css } from 'styled-components'
import tw, { TwStyle } from 'twin.macro'
import BaseDiv from '../atoms/BaseDiv'

const Css = css

const SectionLabel = ({
  children,
  css,
  tws,
  ...props
}: {
  children: string | React.ReactNode
  css?: string
  tws?: TwStyle
  props?: any[]
}): JSX.Element => {
  // send the following to the tw prop: font-semibold text-xs mb-2
  // styled css to the css prop
  // className to the className prop
  const myCss = Css<{
    children: string | React.ReactNode
    css?: string
    tws?: TwStyle
    props?: any[]
  }>`
    ${tw`font-semibold text-xs mb-2`}
    ${tws}
  ${({ css }) => css ?? ''}
  `
  return (
    <BaseDiv css={myCss} {...props}>
      {children}
    </BaseDiv>
  )
}

export default SectionLabel
