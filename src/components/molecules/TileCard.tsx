import React from 'react'
import { Flex, FlexProps } from '../atoms/Layout'

export function TileCard({
  children,
  style,
  innerStyle,
  bgSecondary,
  thinner,
  innerBigger,
  innerThinner,
  bigger,
  normous,
  horiz,
  inactive,
  noShadow,
  noPadding,
  gap,
  padding,
  onClick,
  ...rest
}: {
  children: React.ReactNode
  style?: React.CSSProperties
  innerStyle?: React.CSSProperties
  bgSecondary?: boolean
  /** first card - `flex: 0.8` */ thinner?: boolean
  /** second card - `flex 1` */ bigger?: boolean
  /** second card inactive - `flex 1.2` */ innerBigger?: boolean
  /** second card - `flex: 0.8` */ innerThinner?: boolean
  /* big box under coverage active toggle - flex: 12*/ normous?: boolean
  /** first time 2-form card - `flex 2` */ inactive?: boolean
  horiz?: boolean
  noShadow?: boolean
  noPadding?: boolean
  gap?: number
  padding?: number
  onClick?: () => void
} & FlexProps): JSX.Element {
  const defaultStyle = style ?? {}
  // thinner is 0.8, bigger is 1.2
  const customStyle = {
    display: 'flex',
    flex: (() => {
      if (thinner) return 0.8
      if (bigger) return 1
      if (innerBigger) return 1.2
      if (innerThinner) return 0.9
      if (normous) return 12
      if (inactive) return 2
    })(),
  }
  const combinedStyle = { ...defaultStyle, ...customStyle }

  return (
    <Flex
      shadow={!noShadow}
      bgRaised={!bgSecondary}
      bgSecondary={bgSecondary}
      rounded
      style={combinedStyle}
      gap={gap ?? 4}
      onClick={onClick}
      {...rest}
      p={!noPadding ? padding ?? 24 : undefined}
      column={!horiz}
      row={horiz}
      stretch
      button={!!onClick}
      noborder={!!onClick}
    >
      {children}
    </Flex>
  )
}
