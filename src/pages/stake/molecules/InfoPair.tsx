import styled, { ThemedStyledProps } from 'styled-components'
import { Theme } from '../../../styles/themes'
import React from 'react'

// const theme = {} as Theme
// theme.v2.tertiary

type InfoPairProps = {
  importance: 'primary' | 'secondary' | 'tertiary' | 'quaternary'
}

export const Label = styled.div<InfoPairProps & { clickable?: boolean }>`
  font-size: ${({ importance }) => {
    switch (importance) {
      case 'primary':
      case 'secondary':
        return '16px'
      default:
        return '12px'
    }
  }};

  color: ${({ importance, theme }) => {
    switch (importance) {
      case 'primary':
        return theme.v2.primary
      case 'secondary':
      case 'quaternary':
        return theme.v2.secondary
      case 'tertiary':
        return theme.v2.tertiary
    }
  }};
  font-weight: 600;
  ${({ clickable }) =>
    clickable &&
    `
    cursor: pointer;
    user-select: none;
    
    `}
  ${({ clickable, importance }) =>
    clickable &&
    importance === 'primary' &&
    `
    text-underline-offset: 8px;
    text-decoration: underline;
    text-decoration-thickness: 2px;
    `}
`

const Value = styled.div<InfoPairProps>`
  font-size: ${({ importance, theme }) => {
    switch (importance) {
      case 'primary':
        return '16px'
      case 'secondary':
        return '14px'
      case 'tertiary':
      case 'quaternary':
        return '12px'
    }
  }};

  color: ${({ importance, theme }) => {
    switch (importance) {
      case 'primary':
        return theme.v2.secondary
      case 'secondary':
        return theme.v2.secondary
      case 'tertiary':
        return theme.v2.primary
      case 'quaternary':
        return theme.v2.secondary
    }
  }};
`

export default function InfoPair({
  importance,
  children,
  label,
}: InfoPairProps & { children: React.ReactNode | string | React.ReactNode[]; label: string }): JSX.Element {
  return (
    <div>
      <Label importance={importance} style={{ marginBottom: '8px' }}>
        {label}
      </Label>
      <Value importance={importance}>{children}</Value>
    </div>
  )
}
