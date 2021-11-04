/*************************************************************************************

    Table of Contents:

    import packages
    import constants
    import components
    import resources
    import hooks

    About
      hooks

  *************************************************************************************/

/* import packages */
import React from 'react'

/* import constants */
import { BKPT_1, BKPT_3, BKPT_NAVBAR } from '../../constants'

/* import components */
import { Button, ButtonWrapper } from '../../components/atoms/Button'
import { FlexRow, HeroContainer } from '../../components/atoms/Layout'
import { Text, TextSpan } from '../../components/atoms/Typography'
import { StyledNavLink } from '../../components/atoms/Link'

/* import resources */
import whiteLogo from '../../resources/svg/solace-logo-white.svg'
import polygonLogo from '../../resources/svg/grants/polygon-logo-white.svg'
import nearLogo from '../../resources/svg/grants/near-logo-white.svg'
import aaveLogo from '../../resources/svg/grants/aave-logo-white.svg'

/* import hooks */
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

function About(): any {
  /* hooks */
  const { width } = useWindowDimensions()

  return (
    <>
      {width > BKPT_3 ? (
        <>
          <HeroContainer style={{ height: '100vh' }}>
            <img src={whiteLogo} style={{ marginLeft: '70px' }} />
            <Text light mont mt={30} style={{ fontSize: '36px', lineHeight: '2' }}>
              Safe. Secure. Simple.
            </Text>
            <Text light t4 textAlignCenter style={{ lineHeight: '1.8', width: '500px', fontSize: '18px' }}>
              We’re here to protect your funds, so you don’t have to stress about getting rekt anymore.
            </Text>
            <ButtonWrapper pt={70} pb={90}>
              <StyledNavLink to="/quote">
                <Button light width={200} style={{ padding: '15px 50px', borderRadius: '55px' }}>
                  Buy Cover
                </Button>
              </StyledNavLink>
              <StyledNavLink to="/invest">
                <Button light width={200} style={{ padding: '15px 50px', borderRadius: '55px' }}>
                  <TextSpan nowrap style={{ color: 'inherit' }}>
                    Underwrite Risk
                  </TextSpan>
                </Button>
              </StyledNavLink>
            </ButtonWrapper>
            <div>
              <Text light mont textAlignCenter style={{ fontSize: '24px' }} mb={10}>
                GRANTS{' '}
                <TextSpan light mont textAlignCenter style={{ fontSize: '24px', fontWeight: 700 }}>
                  FROM
                </TextSpan>
              </Text>
              <FlexRow style={{ justifyContent: 'space-between' }}>
                <img src={polygonLogo} />
                <img src={aaveLogo} />
                <img src={nearLogo} />
              </FlexRow>
            </div>
          </HeroContainer>
          <HeroContainer heightP={75}>
            <div
              style={{
                position: 'absolute',
                border: '20px solid #FFF',
                padding: '300px',
                boxSizing: 'border-box',
                borderRadius: '50%',
                filter:
                  ' drop-shadow(0px 0px 22px rgba(255, 255, 255, 0.7)) drop-shadow(0px 0px 100px rgba(255, 255, 255, 0.7))',
              }}
            ></div>

            <div style={{ marginBottom: '33px' }}>
              <Text textAlignCenter light mont style={{ fontSize: '72px', fontWeight: 300, lineHeight: '72px' }}>
                WHAT IS
              </Text>
              <Text textAlignCenter light mont style={{ fontSize: '72px', fontWeight: 700, lineHeight: '72px' }}>
                SOLACE?
              </Text>
            </div>
            <Text light t4 textAlignCenter style={{ lineHeight: '1.8', width: '400px', fontSize: '18px' }}>
              Solace is a decentralized coverage protocol, insurance-alternative, that allows DeFi liquidity providers
              and market makers to hedge their risk in the event of smart contract exploits.
            </Text>
          </HeroContainer>
        </>
      ) : (
        //mobile version
        <>
          <HeroContainer style={{ height: '100vh', marginTop: 'max(320px, 15%)' }}>
            <img
              src={whiteLogo}
              style={{ marginLeft: '50px', width: '250px', height: '250px', marginBottom: 'max(100px, 15%)' }}
            />
            <Text textAlignCenter light mont mt={30} style={{ fontSize: '18px' }}>
              Safe. Secure. Simple.
            </Text>
            <Text
              light
              t4
              textAlignCenter
              style={{ lineHeight: '1.8', width: '300px', fontSize: '18px', marginTop: '300px' }}
            >
              We’re here to protect your funds, so you don’t have to stress about getting rekt anymore.
            </Text>
            <ButtonWrapper pt={70} pb={90}>
              <StyledNavLink to="/quote">
                <Button light width={150} style={{ padding: '15px 50px', borderRadius: '55px' }}>
                  <TextSpan light nowrap>
                    Buy Cover
                  </TextSpan>
                </Button>
              </StyledNavLink>
              <StyledNavLink to="/invest">
                <Button light width={150} style={{ padding: '15px 50px', borderRadius: '55px' }}>
                  <TextSpan light nowrap>
                    Underwrite Risk
                  </TextSpan>
                </Button>
              </StyledNavLink>
            </ButtonWrapper>
            <div>
              <Text light mont textAlignCenter style={{ fontSize: '24px' }} mb={10}>
                GRANTS{' '}
                <TextSpan light mont textAlignCenter style={{ fontSize: '24px', fontWeight: 700 }}>
                  FROM
                </TextSpan>
              </Text>
              <FlexRow style={{ justifyContent: 'space-between' }}>
                <img src={polygonLogo} />
                <img src={aaveLogo} />
                <img src={nearLogo} />
              </FlexRow>
            </div>
          </HeroContainer>
          <HeroContainer style={{ height: '80vh', marginTop: 'max(350px, 15%)' }}>
            <div
              style={{
                position: 'absolute',
                border: '10px solid #FFF',
                padding: width > BKPT_NAVBAR ? '30vw' : width > BKPT_1 ? '40vw' : '45vw',
                boxSizing: 'border-box',
                borderRadius: '50%',
                filter:
                  ' drop-shadow(0px 0px 22px rgba(255, 255, 255, 0.7)) drop-shadow(0px 0px 10px rgba(255, 255, 255, 0.7))',
              }}
            ></div>

            <div style={{ marginBottom: '33px' }}>
              <Text textAlignCenter light mont style={{ fontSize: '36px', fontWeight: 300, lineHeight: '36px' }}>
                WHAT IS
              </Text>
              <Text textAlignCenter light mont style={{ fontSize: '36px', fontWeight: 700, lineHeight: '36px' }}>
                SOLACE?
              </Text>
            </div>
            <Text light t4 textAlignCenter style={{ lineHeight: '1.8', width: '250px', fontSize: '12px' }}>
              Solace is a decentralized coverage protocol, insurance-alternative, that allows DeFi liquidity providers
              and market makers to hedge their risk in the event of smart contract exploits.
            </Text>
          </HeroContainer>
        </>
      )}
    </>
  )
}

export default About
