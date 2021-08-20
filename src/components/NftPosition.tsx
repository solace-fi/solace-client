import React from 'react'
import Tilt from 'react-parallax-tilt'
import { useWindowDimensions } from '../hooks/useWindowDimensions'
import { MAX_MOBILE_SCREEN_WIDTH } from '../constants'
import styled from 'styled-components'

interface NftPositionProps {
  src: string
}

const ScaledContainer = styled.div`
  transition: all 600ms ease;
  &:hover {
    transform: scale(1.2);
  }
`

export const NftPosition: React.FC<NftPositionProps> = ({ src }) => {
  const { width } = useWindowDimensions()

  return (
    <Tilt style={{ textAlign: 'center' }}>
      {width > MAX_MOBILE_SCREEN_WIDTH ? (
        <ScaledContainer>
          <img src={src} style={{ width: '80%' }} />
        </ScaledContainer>
      ) : (
        <img src={src} style={{ width: '80%' }} />
      )}
    </Tilt>
  )
}
