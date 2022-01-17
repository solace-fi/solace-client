import React from 'react'
import styled from 'styled-components'
import Twan from './Twan'

function isOneOf<T>(value: T, list: T[]) {
  return list.indexOf(value) > -1
}

const Wrapper = styled.div`
  font-weight: 600;
`

const Value = styled.span<{ importance: 'primary' | 'secondary' | 'tertiary' | 'quaternary' }>`
  font-size: ${({ importance }) => {
    switch (importance) {
      case 'primary':
      case 'secondary':
        return '16px'
      case 'tertiary':
      case 'quaternary':
        return '14px'
    }
  }};

  color: ${({ importance, theme }) => {
    switch (importance) {
      case 'primary':
      case 'secondary':
        return theme.v2.secondary
      case 'tertiary':
        return theme.v2.primary
      case 'quaternary':
        return theme.v2.secondary
    }
  }};
`

const Annotation = styled.span<{ importance: 'primary' | 'secondary' | 'tertiary' | 'quaternary' }>`
  font-size: ${({ importance }) => {
    switch (importance) {
      case 'primary':
      case 'secondary':
        return '12px'
      case 'tertiary':
      case 'quaternary':
        return '10px'
    }
  }};

  color: ${({ importance, theme }) => {
    switch (importance) {
      case 'primary':
      case 'secondary':
        return theme.v2.secondary
      case 'tertiary':
        return theme.v2.primary
      case 'quaternary':
        return theme.v2.secondary
    }
  }};
`

// secondary CardSectionValue is just `font-medium mt-2`
export default function CardSectionValue({
  children,
  annotation,
  importance,
}: {
  children: string | React.ReactNode
  annotation?: string
  importance: 'primary' | 'secondary' | 'tertiary'
  css?: string
}): JSX.Element {
  const BaseDiv = styled.div`
    font-weight: 600;
  `
  const amongFirstTwo = isOneOf(importance, ['primary', 'secondary'])
  const isPrimary = importance === 'primary'
  const mainTextSize = amongFirstTwo ? `text-base` : `text-sm`
  const mainTextColor = isPrimary ? `text-[#5F5DF9]` : ''
  const firstInterpolation = [mainTextSize, mainTextColor] as string[]
  const annotationTextSize = amongFirstTwo ? `text-sm` : `text-xs`
  const annotationTextColor = isPrimary ? `text-[#5F5DF9]` : ''
  const secondInterpolation = [annotationTextSize, annotationTextColor] as string[]

  return (
    <BaseDiv>
      {/* <Twan css={firstInterpolation}>{children}</Twan>{' '} */}
      <Value importance={importance}>{children}</Value>{' '}
      {annotation && (
        <Annotation importance={importance}>{annotation}</Annotation>
        // <>
        //   <Twan css={secondInterpolation}>{annotation}</Twan>
        // </>
      )}
    </BaseDiv>
  )
}
