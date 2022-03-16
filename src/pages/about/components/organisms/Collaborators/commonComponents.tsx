import React from 'react'
import { Flex, Grid } from '../../../../../components/atoms/Layout'
import { Text } from '../../../../../components/atoms/Typography'
import { useWindowDimensions } from '../../../../../hooks/internal/useWindowDimensions'

export function TeamMember({
  name,
  role,
  twitter,
}: {
  name: string
  role: string
  twitter?: {
    username: string
    url: string
  }
}): JSX.Element {
  return (
    <Flex column gap={3}>
      <Text extrabold mont t2_5s lineHeight={1.2}>
        {name}
      </Text>
      <Text t3s regular>
        {role}
      </Text>
      {twitter && (
        <Text t5s underline regular mt={3}>
          <a href={twitter.url} target="_blank" rel="noreferrer">
            @{twitter.username}
          </a>
        </Text>
      )}
    </Flex>
  )
}

export function HardcodedGrid({ children }: { children: React.ReactNode[] }): JSX.Element {
  const { isMobile } = useWindowDimensions()
  return (
    <Grid columnGap={60} rowGap={30} columns={isMobile ? 1 : 3}>
      {children}
    </Grid>
  )
}

export function HardcodedResponsiveFlex({ children }: { children: React.ReactNode }): JSX.Element {
  const { isMobile } = useWindowDimensions()
  return isMobile ? (
    // <Flex col gap={50} px={60} mb={81}>
    //   {children}
    // </Flex>
    <>{children}</>
  ) : (
    <Flex col stretch pr={70} gap={70}>
      {children}
    </Flex>
  )
}
