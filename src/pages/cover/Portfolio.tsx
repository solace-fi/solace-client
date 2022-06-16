import { SolaceRiskProtocol } from '@solace-fi/sdk-nightly'
import React, { useEffect, useState } from 'react'
import { Button } from '../../components/atoms/Button'
import { Flex, VerticalSeparator } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { LoaderText } from '../../components/molecules/LoaderText'
import { ModalCloseButton } from '../../components/molecules/Modal'
import { useGeneral } from '../../context/GeneralManager'
import { useTierColors } from '../../hooks/internal/useTierColors'
import { truncateValue } from '../../utils/formatting'
import { useCoverageContext } from './CoverageContext'
import { ReadOnlyProtocol } from './Protocol'

export const Portfolio = (): JSX.Element => {
  const { appTheme } = useGeneral()
  const { intrface, portfolioKit, styles } = useCoverageContext()
  const { portfolioLoading, handleShowPortfolioModal, handleShowSimulatorModal } = intrface
  const { curPortfolio, curUsdBalanceSum } = portfolioKit
  const { gradientStyle } = styles

  const [protocols, setProtocols] = useState<SolaceRiskProtocol[]>([])

  const tierColors = useTierColors(protocols.map((p) => p.tier))

  const getColorByTier = (tier: number) => {
    const index = tier - 1
    if (index < 0) {
      return tierColors[tierColors.length - 1]
    } else {
      return tierColors[index]
    }
  }

  useEffect(() => {
    if (!curPortfolio) return
    setProtocols(
      [...curPortfolio.protocols].map((p) => {
        return { ...p, index: 0 }
      })
    )
  }, [curPortfolio])

  return (
    <Flex col style={{ height: 'calc(100vh - 60px)', position: 'relative', overflow: 'hidden' }}>
      <Flex py={18} itemsCenter between px={20} zIndex={3} bgSecondary>
        <Flex gap={8}>
          <Text t3s mont semibold>
            My Portfolio
          </Text>
          <VerticalSeparator />
          <Text t3s mont semibold techygradient>
            ${truncateValue(curUsdBalanceSum, 2)}
          </Text>
        </Flex>
        <Flex onClick={() => handleShowPortfolioModal(false)}>
          <ModalCloseButton lightColor={appTheme == 'dark'} />
        </Flex>
      </Flex>
      <Flex
        thinScrollbar
        col
        gap={12}
        pt={20}
        px={20}
        pb={10}
        style={{
          overflowY: 'auto',
          height: '100%',
          // why this height specifically? i have no clue, but it works pixel-perfectly and it's responive (??)
          // height: `calc(100% - ${376}px)`,
          justifyContent: protocols.length == 0 ? 'center' : 'unset',
        }}
        bgLightGray
      >
        {portfolioLoading && <LoaderText />}
        {!portfolioLoading &&
          protocols.length >= 0 &&
          protocols.map((protocol: SolaceRiskProtocol) => {
            const riskColor = getColorByTier(protocol.tier)
            return <ReadOnlyProtocol key={protocol.appId} protocol={protocol} riskColor={riskColor} />
          })}
        {!portfolioLoading && protocols.length == 0 && (
          <Flex col stretch gap={5}>
            <Text textAlignCenter>Your portfolio is empty.</Text>
            <Text textAlignCenter>To estimate your cost of coverage, you may use our quote simulator.</Text>
            <Button
              {...gradientStyle}
              secondary
              noborder
              p={20}
              onClick={() => {
                handleShowPortfolioModal(false)
                handleShowSimulatorModal(true)
              }}
            >
              <Text t2>Open Portfolio Editor</Text>
            </Button>
          </Flex>
        )}
      </Flex>
    </Flex>
  )
}
