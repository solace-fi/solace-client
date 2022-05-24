import React, { useMemo } from 'react'
import { Flex } from '../../components/atoms/Layout'
import { Button } from '../../components/atoms/Button'
import { useGeneral } from '../../context/GeneralManager'
import { SolaceRiskScore } from '../../constants/types'
import { truncateValue } from '../../utils/formatting'
import { Text } from '../../components/atoms/Typography'

import Zapper from '../../resources/svg/zapper.svg'
import ZapperDark from '../../resources/svg/zapper-dark.svg'
import { TileCard } from '../../components/molecules/TileCard'
import { ReferralSource } from '.'

export function WelcomeMessage({
  portfolio,
  type,
  goToSecondStage,
}: {
  portfolio: SolaceRiskScore | undefined
  type: ReferralSource
  goToSecondStage: () => void
}): JSX.Element {
  const { appTheme } = useGeneral()
  const annualCost = useMemo(() => (portfolio && portfolio.address_rp ? portfolio.address_rp : 0), [portfolio])

  switch (type) {
    case ReferralSource.Custom:
      return (
        <TileCard>
          <Flex col gap={30} itemsCenter>
            <Text t2s>Solace Wallet Coverage</Text>
            <Flex col gap={10} itemsCenter>
              <Text t2>Cover your wallet on any of our supported chains with one policy!</Text>
              <Text t2>Your annual cost based on your portfolio: {truncateValue(annualCost, 2)} USD/yr</Text>
              <Text t5s>By funding a single policy for your entire portfolio, you will be covered.</Text>
              <Text t5s>The table below is a list of your positions on protocols available for coverage.</Text>
            </Flex>
            <Button info secondary pl={23} pr={23} onClick={goToSecondStage}>
              Get Started
            </Button>
            {appTheme == 'light' && (
              <Flex center>
                <img src={Zapper} style={{ width: '145px' }} />
              </Flex>
            )}
            {appTheme == 'dark' && (
              <Flex center>
                <img src={ZapperDark} style={{ width: '145px' }} />
              </Flex>
            )}
          </Flex>
        </TileCard>
      )
    case ReferralSource.Standard:
      return (
        <TileCard>
          <Flex col gap={30} itemsCenter>
            <Text t2s>Solace Wallet Coverage</Text>
            <Flex col gap={10} itemsCenter>
              <Text t2>Cover your wallet on any of our supported chains with one policy!</Text>
              <Text t2>Your annual cost based on your portfolio: {truncateValue(annualCost, 2)} USD/yr</Text>
              <Text t5s>By funding a single policy for your entire portfolio, you will be covered.</Text>
              <Text t5s>The table below is a list of your positions on protocols available for coverage.</Text>
            </Flex>
            <Button info secondary pl={23} pr={23} onClick={goToSecondStage}>
              Get Started
            </Button>
            {appTheme == 'light' && (
              <Flex center>
                <img src={Zapper} style={{ width: '200px' }} />
              </Flex>
            )}
            {appTheme == 'dark' && (
              <Flex center>
                <img src={ZapperDark} style={{ width: '200px' }} />
              </Flex>
            )}
          </Flex>
        </TileCard>
      )
    case ReferralSource.StakeDAO:
      return (
        <TileCard>
          <Flex col gap={30} itemsCenter>
            <Text t2s>Solace Wallet Coverage</Text>
            <Flex col gap={10} itemsCenter>
              <Text t2>Cover your wallet on any of our supported chains with one policy!</Text>
              <Text t2>Your annual cost based on your portfolio: {truncateValue(annualCost, 2)} USD/yr</Text>
              <Text t5s>By funding a single policy for your entire portfolio, you will be covered.</Text>
              <Text t5s>The table below is a list of your positions on protocols available for coverage.</Text>
            </Flex>
            <Button info secondary pl={23} pr={23} onClick={goToSecondStage}>
              Get Started
            </Button>
            {appTheme == 'light' && (
              <Flex center>
                <img src={Zapper} style={{ width: '200px' }} />
              </Flex>
            )}
            {appTheme == 'dark' && (
              <Flex center>
                <img src={ZapperDark} style={{ width: '200px' }} />
              </Flex>
            )}
          </Flex>
        </TileCard>
      )
  }
}
