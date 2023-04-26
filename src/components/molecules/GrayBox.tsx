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

export const GrayBox = ({ children }: { children: React.ReactNode | string }): JSX.Element => {
  return (
    <GrayBgDiv className="flex text-[#213a4d] rounded-xl items-stretch font-medium">
      <div className="py-3 px-6">{children}</div>
    </GrayBgDiv>
  )
}
