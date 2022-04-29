import React from 'react'
import styled from 'styled-components'
import { GrayBgDiv } from '../../components/atoms/Layout'

export const StyledGrayBox = styled.div`
  border-radius: 10px;
  align-items: stretch;
  font-weight: 600;
  display: flex;
  padding: 24px;
  background-color: ${({ theme }) => theme.body.bg_color};
`

export const FixedHeightGrayBox = styled.div<{
  h: number
  p?: number
  pt?: number
  pb?: number
  pl?: number
  pr?: number
}>`
  border-radius: 10px;
  height: ${({ h }) => (h ? h : 66)}px;
  align-items: stretch;
  display: flex;
  padding: ${({ p, pt, pb, pl, pr }) => {
    if (p) return `${p}px`
    else return `${pt ? pt : 0}px ${pl ? pl : 0}px ${pb ? pb : 0}px ${pr ? pr : 0}px`
  }};
  background-color: ${({ theme }) => theme.body.bg_color};
`

export const GrayBox = ({ children }: { children: React.ReactNode | string }): JSX.Element => {
  return (
    <GrayBgDiv className="flex text-[#213a4d] rounded-xl items-stretch font-medium mb-8">
      <div className="py-3 px-6">{children}</div>
    </GrayBgDiv>
  )
}
