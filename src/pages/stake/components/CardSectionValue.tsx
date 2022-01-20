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
      case 'tertiary':
        return '16px'
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
      case 'tertiary':
        return '12px'
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
const BaseDiv = styled.div`
  font-weight: 600;
`
export default function CardSectionValue({
  children,
  annotation,
  // importance,
  highlight,
}: {
  children: string | React.ReactNode
  annotation?: string
  // importance: 'primary' | 'secondary' | 'tertiary'
  highlight?: boolean
  css?: string
}): JSX.Element {
  return (
    <BaseDiv>
      {/* <Twan css={firstInterpolation}>{children}</Twan>{' '} */}
      <Value importance={highlight ? 'tertiary' : 'primary'}>{children}</Value>{' '}
      {annotation && (
        <Annotation importance={highlight ? 'tertiary' : 'primary'}>{annotation}</Annotation>
        // <>
        //   <Twan css={secondInterpolation}>{annotation}</Twan>
        // </>
      )}
    </BaseDiv>
  )
}
