import React from 'react'
import { animated } from 'react-spring'
import { use3dEffect } from 'use-3d-effect'

interface NftPositionProps {
  src: string
}

export const NftPosition: React.FC<NftPositionProps> = ({ src }) => {
  const ref = React.useRef(null)
  const { style, ...mouseHandlers } = use3dEffect(ref)

  return (
    <animated.img
      ref={ref}
      src={src}
      style={{
        width: '50%',
        ...style,
      }}
      {...mouseHandlers}
    />
  )
}
