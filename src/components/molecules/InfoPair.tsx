import styled, { css, ThemedStyledProps } from 'styled-components'
import { Theme } from '../../styles/themes'
import React from 'react'

// const theme = {} as Theme
// theme.v2.tertiary

type InfoPairProps = {
  importance: 'primary' | 'secondary' | 'tertiary' | 'quaternary'
  horizontal?: boolean
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
  font-size: ${({ importance }) => {
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

const Safu = styled.div<{
  horizontal?: boolean
  isSafePreview?: boolean
  batch?: boolean
  desktop?: boolean
}>`
  ${({ horizontal }) =>
    horizontal &&
    css`
      display: flex;
      gap: 8px;
    `};
  ${({ isSafePreview, desktop }) =>
    isSafePreview &&
    desktop &&
    css`
      /* background-color: pink; */
      min-width: 140px;
      margin-right: 20px;
    `}
  ${({ batch, desktop }) =>
    batch &&
    desktop &&
    css`
      /* background-color: greenyellow; */
      /* margin-left: 17px; */
      margin-right: 16.6px;
    `}
`

export default function InfoPair({
  importance,
  children,
  label,
  horizontal,
  isSafePreview,
  batch,
  desktop,
}: InfoPairProps & {
  children: React.ReactNode | string | React.ReactNode[]
  label: string
  isSafePreview?: boolean
  batch?: boolean
  desktop?: boolean
}): JSX.Element {
  return (
    <Safu
      style={horizontal ? { display: 'flex', gap: '8px' } : {}}
      isSafePreview={isSafePreview}
      batch={batch}
      desktop={desktop}
    >
      <Label importance={importance} style={!horizontal ? { marginBottom: '8px' } : {}}>
        {label}
      </Label>
      <Value importance={importance}>{children}</Value>
    </Safu>
  )
}
