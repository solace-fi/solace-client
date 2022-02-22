import React from 'react'
import { Flex } from '../../../../components/atoms/Layout'
import { Text, TextSpan } from '../../../../components/atoms/Typography'
import { useWindowDimensions } from '../../../../hooks/useWindowDimensions'
import { Button } from '../../../../components/atoms/Button'
import { StyledNavLink } from '../../../../components/atoms/Link'
import whiteLogo from '../../../../resources/svg/solace-logo-white.svg'
import grantsFrom from '../../../../resources/svg/grants/grants-from.svg'

export const AboutFirstSection = <AboutFirstSectionFunction />

function AboutFirstSectionFunction() {
  const { isMobile } = useWindowDimensions()
  return (
    <Flex
      col
      w={isMobile ? undefined : 507}
      px={isMobile ? 47 : undefined}
      itemsCenter={isMobile}
      mt={isMobile ? 100 : undefined}
    >
      {/* LOGO */}
      <img src={whiteLogo} style={{ width: isMobile ? '232px' : '507px' }} />
      {/* TEXT */}
      <Flex col pr={isMobile ? undefined : 50} mt={isMobile ? 30 : 40}>
        <Text
          // t2s
          light
          regular
          textAlignCenter={isMobile}
          style={{
            fontSize: !isMobile ? '20px' : '16px',
            lineHeight: '1.6',
            fontWeight: 400,
            padding: !isMobile ? '0px' : '47px',
          }}
        >
          Insurance protocol built to secure DeFi&apos;s future by solving complexity of risk management with
          user-friendly, intelligent and transparent tools.
        </Text>
      </Flex>
      {/* BUTTONS */}
      <Flex col={isMobile} gap={24} mt={62} px={isMobile ? 39 : undefined}>
        <StyledNavLink to="/quote">
          <Button secondary light width={200} style={{ padding: '15px 50px', borderRadius: '55px' }}>
            <Text warmgradient>Buy Cover</Text>
          </Button>
        </StyledNavLink>
        <StyledNavLink to="/bond">
          <Button light width={200} style={{ padding: '15px 50px', borderRadius: '55px' }}>
            <TextSpan nowrap style={{ color: 'inherit' }}>
              Underwrite Risk
            </TextSpan>
          </Button>
        </StyledNavLink>
      </Flex>
      {!isMobile ? (
        <Flex
          justifyCenter
          style={{
            width: '100%',
            position: 'absolute',
            bottom: '40px',
            right: '40px',
          }}
        >
          <img src={grantsFrom} />
        </Flex>
      ) : (
        <Flex mt={90}>
          <img src={grantsFrom} />
        </Flex>
      )}
    </Flex>
  )
}
