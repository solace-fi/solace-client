import React from 'react'
import styled from 'styled-components'
import { Box as RebassBox } from 'rebass/styled-components'

const BoxBase = styled(RebassBox)<{ width?: string; padding?: string; border?: string; borderRadius?: string }>`
  width: ${({ width }) => width ?? '100%'};
  padding: ${({ padding }) => padding};
  border: ${({ border }) => border};
  border-radius: ${({ borderRadius }) => borderRadius};
`

export default BoxBase

export const BoxRow = styled(BoxBase)`
  display: grid;
  grid-auto-flow: column;
  gap: 24px;
`

export const Box = styled(BoxRow)`
  align-items: center;
  border-radius: 10px;
  padding: 24px;
  background-color: rgba(0, 255, 209, 0.3);

  &.is-purple {
    background-color: rgba(250, 0, 255, 0.3);
  }
`

export const BoxItemtitle = styled.div`
  margin-bottom: 4px;
`
