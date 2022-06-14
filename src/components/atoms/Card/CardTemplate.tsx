import React, { ReactNode } from 'react'
import { Flex } from '../Layout'
import { Text } from '../Typography'
import { StyledOptions } from '../Icon'

export function CardTemplate({
  hasIcon,
  icon,
  title,
  children,
  techy,
  unit,
  onClick,
}: {
  title: string
  children: string | React.ReactNode
  hasIcon?: true
  icon?: ReactNode
  techy?: true
  info?: true
  unit?: string
  onClick?: () => void
}): JSX.Element {
  return (
    <Flex
      button={hasIcon}
      noborder={hasIcon}
      col
      bgRaised
      p={16}
      gap={4}
      rounded
      style={{
        cursor: hasIcon ? 'pointer' : 'default',
      }}
      onClick={onClick}
    >
      <Flex between>
        <Text
          t6s
          techygradient={techy}
          bold
          style={{
            lineHeight: '13.62px',
            maxWidth: '75px',
          }}
        >
          {title}
        </Text>
        {hasIcon && (icon ?? <StyledOptions height={12} width={12} />)}
      </Flex>
      <Text
        t4s
        techygradient={techy}
        bold
        style={{
          lineHeight: '19.07px',
        }}
      >
        {children}
        {unit && (
          <Text ml={3} inline t6s style={{ fontWeight: '400' }} dark>
            {unit}
          </Text>
        )}
      </Text>
    </Flex>
  )
}

export function SmallCardTemplate({
  icon,
  value,
  techy,
  info,
  error,
  onClick,
}: {
  icon: ReactNode
  value: string
  techy?: true
  info?: true
  error?: true
  onClick?: () => void
}): JSX.Element {
  return (
    <Flex
      bgRaised
      button={!!onClick}
      noborder={!!onClick}
      justifyCenter={!!onClick}
      itemsCenter
      // py={9.75}
      px={12}
      // p={16}
      gap={12}
      rounded
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      flex1
    >
      <Flex style={{}} gap={12} itemsCenter>
        {icon}
        <Text t5s techygradient={techy} error={error} info={info} bold>
          {value}
        </Text>
      </Flex>
    </Flex>
  )
}
