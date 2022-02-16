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
import React, { useEffect, useState } from 'react'

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
import solaceGradient from '../../resources/svg/solace-gradient.svg'
import grantsFrom from '../../resources/svg/grants/grants-from.svg'
import whiteCircle from '../../resources/svg/white-circle.svg'

/* import hooks */
import { useWindowDimensions } from '../../hooks/useWindowDimensions'
import Flex from '../stake/atoms/Flex'
import { ScrollDot } from '../../components/atoms/Icon/ScrollDot'
import { WhiteCircle } from '../../components/atoms/Icon/WhiteCircle'
import styled from 'styled-components'
import team from '../../resources/team'
import advisorsAndContributors from '../../resources/advisorsAndContributors'

function AboutThesis({ title, text }: { title: string; text: string | React.ReactNode }) {
  return (
    <Flex mt={10}>
      <Flex
        style={{
          minWidth: '30px',
        }}
      >
        {/* <img src={whiteCircle} alt="small circle" /> */}
        <WhiteCircle />
      </Flex>
      <Flex col gap={10}>
        <Text
          style={{
            lineHeight: '16px',
          }}
          mont
          extrabold
          light
          t1s
          mt={4}
        >
          {title}
        </Text>
        <Text
          light
          regular
          style={{
            lineHeight: '24px',
          }}
          mt={10}
          t3s
        >
          {text}
        </Text>
      </Flex>
    </Flex>
  )
}

function About1(): any {
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
              We&apos;re here to protect your funds, so you don&apos;t have to stress about getting rekt anymore.
            </Text>
            <ButtonWrapper pt={70} pb={90}>
              <StyledNavLink to="/quote">
                <Button light width={200} style={{ padding: '15px 50px', borderRadius: '55px' }}>
                  Buy Cover
                </Button>
              </StyledNavLink>
              <StyledNavLink to="/bond">
                <Button light width={200} style={{ padding: '15px 50px', borderRadius: '55px' }}>
                  <TextSpan nowrap style={{ color: 'inherit' }}>
                    Buy Bonds
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
              <FlexRow jc={'space-between'}>
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
              We&apos;re here to protect your funds, so you don&apos;t have to stress about getting rekt anymore.
            </Text>
            <ButtonWrapper pt={70} pb={90}>
              <StyledNavLink to="/quote">
                <Button light width={150} style={{ padding: '15px 50px', borderRadius: '55px' }}>
                  <TextSpan light nowrap>
                    Buy Cover
                  </TextSpan>
                </Button>
              </StyledNavLink>
              <StyledNavLink to="/bond">
                <Button light width={150} style={{ padding: '15px 50px', borderRadius: '55px' }}>
                  <TextSpan light nowrap>
                    Buy Bonds
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
              <FlexRow jc={'space-between'}>
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

const AboutFirstSection = (
  <Flex col w={507}>
    <img src={whiteLogo} style={{ width: '507px', height: '157px' }} />
    <Flex col pr={50} mt={40}>
      <Text
        t2s
        light
        regular
        style={{
          lineHeight: '1.6',
          fontWeight: 400,
        }}
      >
        Insurance protocol built to secure DeFi&apos;s future by solving complexity of risk management with
        user-friendly, intelligent and transparent tools.
      </Text>
    </Flex>

    <Flex gap={24} mt={60}>
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
  </Flex>
)

const SectionTitle = styled(Text)<{
  extrabold?: boolean
}>`
  font-size: 48px;
  line-height: 82px;
  font-family: Montserrat;
  font-weight: ${({ extrabold }) => (extrabold ? 700 : 400)};
`

const ExploitsCoverageSection = (
  <Flex col stretch pr={70}>
    <SectionTitle light>
      Exploits{' '}
      <SectionTitle inline extrabold>
        Coverage
      </SectionTitle>
    </SectionTitle>
    <Flex col gap={70} mt={70}>
      <div
        style={{
          // 2 by 2 grid with 70px gap
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gridGap: '60px',
        }}
      >
        <AboutThesis
          title="Simple"
          text={
            <>
              Set a coverage limit and get a{' '}
              <Text extrabold inline light>
                single policy for your entire portfolio.
              </Text>
            </>
          }
        />
        <AboutThesis
          title="Dynamic"
          text={
            <>
              System monitors changes in your portfolio positions and{' '}
              <Text
                inline
                extrabold
                light
                // style={{
                //   display: 'inline',
                // }}
              >
                adjusts the rate for coverage accordingly.
              </Text>
            </>
          }
        />
        <AboutThesis
          title="Fast and hassle-free"
          text={
            <>
              Parametric claims assessment system does not require filing a claim and allows you to{' '}
              <Text extrabold inline>
                receive a payout within one week.
              </Text>
            </>
          }
        />
        <AboutThesis
          title="Transparent"
          text={
            <>
              Solace is the only crypto protection protocol to publish its{' '}
              <Text extrabold inline>
                pricing, risk data and risk models to GitHub
              </Text>{' '}
              and decentralized storage using IPFS.
            </>
          }
        />
      </div>
      {/* <Flex gap={70}>
      </Flex> */}
    </Flex>
  </Flex>
)

const StakingSection = (
  <Flex col stretch pr={70}>
    <SectionTitle light extrabold>
      Staking
    </SectionTitle>
    <Flex mt={70}>
      <div
        style={{
          // 2 by 2 grid with 70px gap
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gridGap: '60px',
        }}
      >
        <AboutThesis
          title="No risk of loss"
          text={
            <Text light regular>
              Users earn revenue from the underwriting activity and further $SOLACE distribution, while the{' '}
              <Text extrabold inline light>
                risk of underwriting falls on the protocol’s owned pool.
              </Text>
            </Text>
          }
        />
        <AboutThesis
          title="Stake and get votes"
          text={
            <>
              Each staked $SOLACE gives you one{' '}
              <Text
                inline
                extrabold
                light
                // style={{
                //   display: 'inline',
                // }}
              >
                vote in the DAO.
              </Text>
            </>
          }
        />
        <AboutThesis
          title="Long-term bonuses"
          text={
            <>
              Users can{' '}
              <Text extrabold inline>
                multiply
              </Text>{' '}
              their{' '}
              <Text extrabold inline>
                rewards
              </Text>{' '}
              (up to 2.5x) and voting rights (up to 4x) as they lock $SOLACE for chosen period.
            </>
          }
        />
        <AboutThesis
          title="Multiple revenue streams"
          text={
            <>
              Staked $SOLACE provides you with exposure to underwriting{' '}
              <Text extrabold inline>
                rewards
              </Text>
              , underwriting pool{' '}
              <Text extrabold inline>
                investments
              </Text>
              , plus $SOLACE{' '}
              <Text extrabold inline>
                emissions
              </Text>
              .
            </>
          }
        />
      </div>
    </Flex>
  </Flex>
)

const RoadmapSection = (
  <Flex col itemsCenter pr={70}>
    <SectionTitle light extrabold>
      Roadmap
    </SectionTitle>
    <Text>Coming Soon</Text>
  </Flex>
)

const AdvisorsAndContributorsSection = (
  <Flex col stretch pr={70} gap={70}>
    <SectionTitle light extrabold>
      Advisors & Contributors
    </SectionTitle>
    <div
      style={{
        // 2 by 2 grid with 70px gap
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        columnGap: '60px',
        rowGap: '30px',
      }}
    >
      {advisorsAndContributors.map(({ name, role, twitter }) => (
        <TeamMember
          key={name}
          name={name}
          role={role}
          twitter={
            twitter
              ? {
                  username: twitter,
                  url: `https://twitter.com/${twitter}`,
                }
              : undefined
          }
        />
      ))}
    </div>
  </Flex>
)

function TeamMember({
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
}) {
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

const TeamSection = (
  <Flex col stretch pr={70} gap={70}>
    <SectionTitle light extrabold>
      Team
    </SectionTitle>

    <div
      style={{
        // 2 by 2 grid with 70px gap
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        columnGap: '60px',
        rowGap: '30px',
      }}
    >
      {team.map(({ name, role, twitter }) => (
        <TeamMember
          key={name}
          name={name}
          role={role}
          twitter={
            twitter
              ? {
                  username: twitter,
                  url: `https://twitter.com/${twitter}`,
                }
              : undefined
          }
        />
      ))}
    </div>
  </Flex>
)

const AboutSections = [
  AboutFirstSection,
  ExploitsCoverageSection,
  StakingSection,
  // RoadmapSection,
  AdvisorsAndContributorsSection,
  TeamSection,
] as const

const AboutContent = ({ section }: { section: number }) => <>{AboutSections[section]}</>

function About(): JSX.Element {
  /* hooks */
  const { isMobile, height } = useWindowDimensions()
  const [section, setSection] = useState<number>(0)

  useEffect(
    () => {
      // desktop cannot scroll normally
      if (!isMobile) {
        window.document.body.style.overflowY = 'hidden'
      }
      const setPreviousSection = () => setSection((section) => (section <= 0 ? 0 : section - 1))
      const setNextSection = () =>
        setSection((section) => (section >= AboutSections.length - 1 ? AboutSections.length - 1 : section + 1))
      // detect scrolling
      window.addEventListener('wheel', (e) => (e.deltaY < 0 ? setPreviousSection() : e.deltaY > 0 && setNextSection()))
      // detect arrow keys
      window.addEventListener('keydown', (e) => {
        // up arrow or page up
        if (e.code === 'ArrowUp' || e.code === 'PageUp') {
          setPreviousSection()
        }
        // down arrow, page down, or space
        if (e.code === 'ArrowDown' || e.code === 'PageDown' || e.code === 'Space') {
          setNextSection()
        }
        // start or end
        if (e.code === 'Home' || e.code === 'End') {
          setSection(e.code === 'Home' ? 0 : AboutSections.length - 1)
        }
      })
      return () => {
        window.document.body.style.overflowY = 'auto'
        window.removeEventListener('wheel', () => {
          1
        })
        window.removeEventListener('keydown', () => {
          1
        })
      }
    },
    [isMobile] /* eslint-disable-line react-hooks/exhaustive-deps */
  )

  return isMobile ? (
    <About1 />
  ) : (
    <>
      <Flex
        itemsCenter
        justifyCenter
        col
        style={{
          height: height - 100 + 'px',
          // border: '5px solid black',
          position: 'relative',
        }}
      >
        <AboutContent section={section} />
        <div
          style={{
            position: 'absolute',
            right: '50px',
            bottom: '40px',
          }}
        >
          <img src={grantsFrom} />
        </div>
        <Flex
          col
          gap={20}
          justifyCenter
          w={8}
          style={{
            position: 'absolute',
            right: '30px',
            height: '100%',
          }}
        >
          {AboutSections.map((_, index) => (
            <ScrollDot hoverable key={index} active={index === section} onClick={() => setSection(index)} />
          ))}
        </Flex>
      </Flex>
    </>
  )
}
export default About
