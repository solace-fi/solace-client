import React, { RefObject, useEffect, useMemo } from 'react'
import { Flex } from '../../../../components/atoms/Layout'
import { Text } from '../../../../components/atoms/Typography'
import { useWindowDimensions } from '../../../../hooks/internal/useWindowDimensions'
import { Button } from '../../../../components/atoms/Button'
import { HyperLink, StyledNavLink } from '../../../../components/atoms/Link'
import whiteLogo from '../../../../resources/svg/solace-logo-white.svg'
import grantsFrom from '../../../../resources/svg/grants/grants-from.svg'
import { useNetwork } from '../../../../context/NetworkManager'

// export const AboutFirstSection = <AboutFirstSectionFunction />

export function AboutFirstSection({
  sectionRef: ref,
  getScrollerForThisRef,
  isVisible,
}: {
  sectionRef?: React.Ref<HTMLDivElement>
  getScrollerForThisRef?: (ref: ((instance: HTMLDivElement | null) => void) | RefObject<HTMLDivElement>) => () => void
  isVisible?: boolean
}): JSX.Element {
  const { isMobile } = useWindowDimensions()
  const scroller = useMemo(
    () => (ref && getScrollerForThisRef ? getScrollerForThisRef(ref) : () => console.log('no ref')),
    [ref, getScrollerForThisRef]
  )
  useEffect(() => {
    if (isVisible) {
      scroller()
    }
  }, [isVisible, scroller, ref])

  const { activeNetwork } = useNetwork()
  return (
    <Flex
      col
      px={isMobile ? 47 : undefined}
      itemsCenter
      justifyCenter={!isMobile}
      // 100 cuz idk, 192 cuz grants is 59 and it has 133 margin to top and we still want the rest to be centered to screen.
      mt={isMobile ? 100 : undefined}
      mr={!isMobile ? 118 : undefined}
      pt={!isMobile ? 90 : undefined}
      ref={ref}
    >
      <Flex col w={isMobile ? undefined : 507} itemsCenter={isMobile}>
        {/* LOGO */}
        <img
          src={whiteLogo}
          style={{
            width: isMobile ? '232px' : '507px',
            // padding left if mobile is 40px
            paddingLeft: isMobile ? '25px' : undefined,
          }}
        />
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
              // padding: !isMobile ? '0px' : '46px',
            }}
            // pl={isMobile ? undefined : 46}
            // pr={isMobile ? undefined : 46}
          >
            Insurance protocol built to secure DeFi&apos;s future by solving complexity of risk management with
            user-friendly, intelligent and transparent tools.
          </Text>
        </Flex>
        {/* BUTTONS */}
        <Flex col itemsCenter gap={24} mt={62} mr={!isMobile ? 80 : undefined} px={isMobile ? 39 : undefined}>
          <Flex col={isMobile} gap={24}>
            <StyledNavLink to="/cover">
              <Button secondary light width={200} style={{ padding: '17px 50px', borderRadius: '55px' }}>
                <Text
                  warmgradient
                  t3s
                  style={{
                    fontWeight: '400',
                  }}
                >
                  Buy Cover
                </Text>
              </Button>
              {/* <Button secondary light width={200} style={{ padding: '17px 50px', borderRadius: '55px' }}>
              <Text techygradient>Buy Solace Token</Text>
            </Button> */}
            </StyledNavLink>

            {activeNetwork.config.specialFeatures.solaceBuyLink && (
              <HyperLink
                href={activeNetwork.config.specialFeatures.solaceBuyLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ width: '100%' }}
              >
                <Button secondary light width={200} style={{ padding: '17px 0', borderRadius: '55px' }}>
                  <Text
                    techygradient
                    t3s
                    style={{
                      fontWeight: '400',
                    }}
                  >
                    Buy Solace Token
                  </Text>
                </Button>
              </HyperLink>
            )}
          </Flex>
          <StyledNavLink to="/bond">
            <Button light width={200} style={{ padding: '17px 50px', borderRadius: '55px' }}>
              <Text nowrap style={{ color: 'inherit', fontWeight: '400' }} t3s>
                Underwrite Risk
              </Text>
            </Button>
          </StyledNavLink>
        </Flex>
        {!isMobile ? (
          <Flex
            justifyCenter
            style={{
              width: '100%',
              marginTop: '5vh',
              // position: 'absolute',
              // bottom: '40px',
              // right: '40px',
            }}
          >
            {/* height is 59 so margin bottom for the container should be -133px -59px, or a total of 192 */}
            <img
              src={grantsFrom}
              style={{
                marginRight: '96px',
              }}
            />
          </Flex>
        ) : (
          <Flex mt={90}>
            <img src={grantsFrom} />
          </Flex>
        )}
      </Flex>
    </Flex>
  )
}
