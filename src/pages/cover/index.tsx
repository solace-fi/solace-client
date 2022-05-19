import { useWeb3React } from '@web3-react/core'
import React, { useMemo } from 'react'
import { Box } from '../../components/atoms/Box'
import { Button, ButtonWrapper } from '../../components/atoms/Button'
import { StyledClock, StyledInfo, StyledOptions } from '../../components/atoms/Icon'
import { Content, Flex, VerticalSeparator } from '../../components/atoms/Layout'
import { Text, TextSpan } from '../../components/atoms/Typography'
import { PleaseConnectWallet } from '../../components/molecules/PleaseConnectWallet'
import { TileCard } from '../../components/molecules/TileCard'
import { InterfaceState } from '../../constants/enums'
import { useNetwork } from '../../context/NetworkManager'
import CoverageManager, { useCoverageContext } from './CoverageContext'
import { DropdownInputSection, DropdownOptions } from './Dropdown'
import { PortfolioWindow } from './PortfolioWindow'

function Cover(): JSX.Element {
  return (
    <CoverageManager>
      <div
        style={{
          gridTemplateColumns: '1fr 2fr',
          display: 'grid',
          position: 'relative',
          gap: '15px',
        }}
      >
        <PortfolioWindow />
        <CoveragePage />
      </div>
    </CoverageManager>
  )
}

const CoveragePage = (): JSX.Element => {
  const { account } = useWeb3React()
  const { activeNetwork } = useNetwork()
  // const canShowSoteria = useMemo(() => !activeNetwork.config.restrictedFeatures.noSoteria, [
  //   activeNetwork.config.restrictedFeatures.noSoteria,
  // ])
  const canShowSoteria = true

  return (
    <>
      {canShowSoteria && account ? (
        <CoverageContent />
      ) : account ? (
        <Content>
          <Box error pt={10} pb={10} pl={15} pr={15}>
            <TextSpan light textAlignLeft>
              <StyledInfo size={30} />
            </TextSpan>
            <Text light bold style={{ margin: '0 auto' }}>
              This dashboard is not supported on this network.
            </Text>
          </Box>
        </Content>
      ) : (
        <PleaseConnectWallet />
      )}
    </>
  )
}

const CoverageContent = (): JSX.Element => {
  const { intrface, styles, input, dropdowns } = useCoverageContext()
  const { navbarThreshold } = intrface
  const { bigButtonStyle, gradientTextStyle } = styles
  const { enteredAmount, enteredDays, setEnteredAmount, setEnteredDays } = input
  const { daysOptions, coinOptions, daysOpen, coinsOpen, setDaysOpen, setCoinsOpen } = dropdowns

  // const buyCta = useMemo(() => [InterfaceState.BUYING].includes(intrface.interfaceState), [intrface.interfaceState])
  // const extendCta = useMemo(() => [InterfaceState.EXTENDING].includes(intrface.interfaceState), [
  //   intrface.interfaceState,
  // ])
  // const withdrawCta = useMemo(() => [InterfaceState.WITHDRAWING].includes(intrface.interfaceState), [
  //   intrface.interfaceState,
  // ])
  // const neutralCta = useMemo(() => [InterfaceState.NEUTRAL].includes(intrface.interfaceState), [
  //   intrface.interfaceState,
  // ])

  const buyCta = true
  const neutralCta = false
  const extendCta = false
  const withdrawCta = false

  return (
    <Content>
      <Flex col gap={24}>
        <Flex col>
          <Text mont {...gradientTextStyle} t2 textAlignCenter>
            Ready to protect your portfolio?
          </Text>
          <Text mont t3 textAlignCenter pt={8}>
            Here is the best policy price based on your portfolio and optimal coverage limit.
          </Text>
        </Flex>
        <Flex center>
          <div
            style={{
              width: navbarThreshold ? '50%' : '100%',
              gridTemplateColumns: '1fr 1fr',
              display: 'grid',
              position: 'relative',
              gap: '15px',
            }}
          >
            <TileCard bigger padding={16}>
              <Flex between style={{ alignItems: 'center' }}>
                <Text bold>My Portfolio</Text>
                <Text info>
                  <StyledOptions size={20} />
                </Text>
              </Flex>
              <Text t3s bold {...gradientTextStyle} pt={8}>
                $1
              </Text>
              <Flex pt={16}>??</Flex>
            </TileCard>
            <TileCard bigger padding={16}>
              <Flex between style={{ alignItems: 'center' }}>
                <Text bold>Pay as you go</Text>
                <Text info>
                  <StyledOptions size={20} />
                </Text>
              </Flex>
              <Text pt={8}>
                <TextSpan t3s bold {...gradientTextStyle}>
                  $1
                </TextSpan>
                <TextSpan t6 bold pl={5}>
                  / Day
                </TextSpan>
              </Text>
              <Flex col pt={16}>
                <Text t7 bold>
                  Coverage Limit:
                </Text>
                <Text t6>Highest Position + 20%</Text>
              </Flex>
            </TileCard>
          </div>
        </Flex>
        <div style={{ margin: 'auto' }}>
          <TileCard>
            <Flex stretch between center pb={24}>
              <Flex col>
                <Text bold t4>
                  My Balance
                </Text>
                <Text textAlignCenter bold t3 {...gradientTextStyle}>
                  $69
                </Text>
              </Flex>
              <VerticalSeparator />
              <Flex col>
                <Text bold t4>
                  Policy Status
                </Text>
                <Text textAlignCenter bold t3 success>
                  Active
                </Text>
              </Flex>
              <VerticalSeparator />
              <Flex col>
                <Text bold t4>
                  Est. Days
                </Text>
                <Text textAlignCenter bold t3 {...gradientTextStyle}>
                  365
                </Text>
              </Flex>
            </Flex>
            <Flex col gap={12}>
              <Flex col>
                <Text mont t4s textAlignCenter>
                  Enter the number of days or the amount of funds.
                </Text>
                <Text mont info t5s textAlignCenter italics underline pt={4}>
                  Paid daily. Cancel and withdraw any time.
                </Text>
              </Flex>
              {(buyCta || extendCta) && (
                <>
                  <div>
                    <DropdownInputSection
                      hasArrow
                      isOpen={daysOpen}
                      placeholder={'Enter days'}
                      icon={<StyledClock size={16} />}
                      text={'Days'}
                      value={enteredDays}
                      onChange={(e) => setEnteredDays(e.target.value)}
                      onClick={() => setDaysOpen(!daysOpen)}
                    />
                    <DropdownOptions
                      isOpen={daysOpen}
                      list={daysOptions}
                      onClick={(value: string) => {
                        setEnteredDays(value)
                        setDaysOpen(false)
                      }}
                    />
                  </div>
                  <div>
                    <DropdownInputSection
                      hasArrow
                      isOpen={coinsOpen}
                      placeholder={'Enter amount'}
                      icon={<img src={`https://assets.solace.fi/zapperLogos/frax`} height={16} />}
                      text={'FRAX'}
                      value={enteredAmount}
                      onChange={(e) => setEnteredAmount(e.target.value)}
                      onClick={() => setCoinsOpen(!coinsOpen)}
                    />
                    <DropdownOptions
                      isOpen={coinsOpen}
                      list={coinOptions}
                      onClick={(value: string) => {
                        setEnteredAmount(value)
                        setCoinsOpen(false)
                      }}
                    />
                  </div>
                </>
              )}
              {withdrawCta && (
                <DropdownInputSection
                  placeholder={'Enter amount'}
                  icon={<img src={`https://assets.solace.fi/solace`} height={16} />}
                  text={'SOLACE'}
                  value={enteredAmount}
                  onChange={(e) => setEnteredAmount(e.target.value)}
                />
              )}
              <ButtonWrapper isColumn p={0}>
                {buyCta && (
                  <Button {...gradientTextStyle} {...bigButtonStyle} secondary noborder>
                    <Text bold t4s>
                      Purchase Policy
                    </Text>
                  </Button>
                )}
                {neutralCta && (
                  <Button {...gradientTextStyle} {...bigButtonStyle} secondary noborder>
                    <Text bold t4s>
                      Extend Policy
                    </Text>
                  </Button>
                )}
                {neutralCta && (
                  <Button secondary matchBg {...bigButtonStyle} noborder>
                    <Text bold t4s>
                      Withdraw Funds
                    </Text>
                  </Button>
                )}
                {extendCta && (
                  <ButtonWrapper style={{ width: '100%' }} p={0}>
                    <Button pt={16} pb={16} separator>
                      Cancel
                    </Button>
                    <Button {...bigButtonStyle} {...gradientTextStyle} secondary noborder>
                      Extend Policy
                    </Button>
                  </ButtonWrapper>
                )}
                {withdrawCta && (
                  <ButtonWrapper style={{ width: '100%' }} p={0}>
                    <Button pt={16} pb={16} separator>
                      Cancel
                    </Button>
                    <Button {...bigButtonStyle} matchBg secondary noborder>
                      <Text {...gradientTextStyle}>Withdraw</Text>
                    </Button>
                  </ButtonWrapper>
                )}
              </ButtonWrapper>
            </Flex>
          </TileCard>
          {(buyCta || extendCta || neutralCta) && (
            <Button {...bigButtonStyle} error mt={16}>
              Cancel Policy
            </Button>
          )}
        </div>
      </Flex>
    </Content>
  )
}

export default Cover
