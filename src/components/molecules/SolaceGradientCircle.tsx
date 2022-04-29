import React from 'react'
import styled from 'styled-components'

const SolaceGradientDiv = styled.div`
  padding: 4px;
  border-radius: 50%;
  background: radial-gradient(ellipse 120% 150% at 60% 0, rgba(212, 120, 216, 1) 10%, rgba(212, 120, 216, 0) 50%),
    radial-gradient(ellipse 50% 150% at 40% 150%, rgba(243, 211, 126, 1) 20%, rgba(243, 211, 126, 0) 80%),
    radial-gradient(ellipse 50% 200% at 100% 50%, rgba(95, 93, 249, 1) 10%, rgba(95, 93, 249, 0) 90%),
    radial-gradient(ellipse 100% 200% at 0 100%, rgba(240, 77, 66, 1) 10%, rgba(240, 77, 66, 0) 100%);
`

const WhiteSpaceDiv = styled.div`
  padding: 2px;
  border-radius: 50%;
  background-color: #fff;
`

export const SolaceGradientCircle = ({ children }: { children: React.ReactNode | string }): JSX.Element => {
  return (
    <SolaceGradientDiv>
      <WhiteSpaceDiv>{children}</WhiteSpaceDiv>
    </SolaceGradientDiv>
  )
}
