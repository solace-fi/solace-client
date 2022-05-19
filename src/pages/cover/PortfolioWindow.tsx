import React, { useEffect, useMemo, useState } from 'react'
import { Content, Flex, VerticalSeparator } from '../../components/atoms/Layout'
import { useCoverageContext } from './CoverageContext'
import { Text, TextSpan } from '../../components/atoms/Typography'
import { SolaceRiskBalance, SolaceRiskProtocol, SolaceRiskScore } from '../../constants/types'
import { Button } from '../../components/atoms/Button'
import { formatAmount, truncateValue } from '../../utils/formatting'
import { useTierColors } from '../../hooks/internal/useTierColors'
import { Protocol } from './Protocol'
import usePrevious from '../../hooks/internal/usePrevious'
import { StyledTooltip } from '../../components/molecules/Tooltip'
import { Risk } from '@solace-fi/sdk-nightly'
import { useWeb3React } from '@web3-react/core'

export const PortfolioWindow = (): JSX.Element => {
  const { account } = useWeb3React()
  const { portfolio: portfolioScore, styles } = useCoverageContext()
  const { gradientTextStyle, bigButtonStyle } = styles
  const [fetchedProtocols, setFetchedProtocols] = useState<SolaceRiskProtocol[]>([])
  const [customProtocols, setCustomProtocols] = useState<SolaceRiskProtocol[]>([])
  const [simulatedPortfolioScore, setSimulatedPortfolioScore] = useState<SolaceRiskScore | undefined>(undefined)
  const [simulating, setSimulating] = useState(false)

  const scoreToUse = useMemo(() => simulatedPortfolioScore ?? portfolioScore, [portfolioScore, simulatedPortfolioScore])

  const editableProtocols = useMemo(() => [...customProtocols, ...fetchedProtocols], [
    customProtocols,
    fetchedProtocols,
  ])

  const usdBalanceSum = useMemo(
    () =>
      scoreToUse && scoreToUse.protocols.length > 0
        ? scoreToUse.protocols.reduce((total, protocol) => (total += protocol.balanceUSD), 0)
        : 0,
    [scoreToUse]
  )

  const annualRate = useMemo(() => (scoreToUse && scoreToUse.current_rate ? scoreToUse.current_rate : 0), [scoreToUse])

  const dailyRate = useMemo(() => annualRate / 365.25, [annualRate])

  const portfolioPrev = usePrevious(scoreToUse)

  const tierColors = useTierColors(editableProtocols.map((p) => p.tier))

  const getColorByTier = (tier: number) => {
    const index = tier - 1
    if (index < 0) {
      return tierColors[tierColors.length - 1]
    } else {
      return tierColors[index]
    }
  }

  const addItem = () => {
    setCustomProtocols((prev) => [
      ...prev,
      {
        appId: `Unknown ${Date.now().toString()}`,
        balanceUSD: 0,
        category: 'Unknown',
        network: '',
        riskLoad: 0,
        rol: 0,
        rrol: 0,
        tier: 0,
        'rp-usd': 0,
        'risk-adj': 0,
      },
    ])
  }

  const editItem = (targetAppId: string, newAppId: string, newAmount: string) => {
    const numberifiedNewAmount = parseFloat(formatAmount(newAmount))
    const fetchedP = fetchedProtocols.find((p) => p.appId.toLowerCase() === targetAppId.toLowerCase())
    if (fetchedP) {
      setFetchedProtocols(
        fetchedProtocols.map((p) => {
          if (p.appId === targetAppId) {
            return {
              ...p,
              appId: newAppId,
              balanceUSD: numberifiedNewAmount,
            }
          } else {
            return p
          }
        })
      )
      return
    }
    const customP = customProtocols.find((p) => p.appId.toLowerCase() === targetAppId.toLowerCase())
    if (customP) {
      setCustomProtocols(
        customProtocols.map((p) => {
          if (p.appId === targetAppId) {
            return {
              ...p,
              appId: newAppId,
              balanceUSD: numberifiedNewAmount,
            }
          } else {
            return p
          }
        })
      )
    }
  }

  const deleteItem = (protocolAppId: string) => {
    const fetchedP = fetchedProtocols.find((p) => p.appId.toLowerCase() === protocolAppId.toLowerCase())
    if (fetchedP) {
      const newFetchedP = fetchedProtocols.filter((p) => p.appId !== protocolAppId)
      setFetchedProtocols(newFetchedP)
      return
    }
    const customP = customProtocols.find((p) => p.appId.toLowerCase() === protocolAppId.toLowerCase())
    if (customP) {
      const newCustomP = customProtocols.filter((p) => p.appId !== protocolAppId)
      setCustomProtocols(newCustomP)
    }
  }

  const runSimulation = async () => {
    if (!account) return
    setSimulating(true)
    const riskBalances: SolaceRiskBalance[] = editableProtocols.map((p) => ({
      appId: p.appId,
      balanceUSD: p.balanceUSD,
      network: p.network,
    }))
    const risk = new Risk()
    const score = await risk.getSolaceRiskScores(account, riskBalances)
    setSimulatedPortfolioScore(score)
    setSimulating(false)
  }

  useEffect(() => {
    if (portfolioPrev == undefined && portfolioScore != undefined) {
      setFetchedProtocols([...portfolioScore.protocols])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolioScore, portfolioPrev])

  return (
    <Content>
      <Flex col gap={8}>
        <Flex stretch evenly center pb={24}>
          <Flex col>
            <Text bold t4 textAlignCenter>
              Assets
            </Text>
            <Text textAlignCenter bold t3s {...gradientTextStyle}>
              {editableProtocols.length}
            </Text>
          </Flex>
          <VerticalSeparator />
          <Flex col>
            <Text bold t4 textAlignCenter>
              Total
            </Text>
            <Text textAlignCenter bold t3s {...gradientTextStyle}>
              ${truncateValue(usdBalanceSum, 2)}
            </Text>
          </Flex>
          <VerticalSeparator />
          <StyledTooltip
            id={`projected-premium`}
            tip={`$${dailyRate}`}
            alwaysShowChildren
            disabled={dailyRate >= 0.01 || dailyRate == 0}
          >
            <Flex col>
              <Text bold t4 textAlignCenter>
                Premium
              </Text>
              <Text textAlignCenter>
                <TextSpan t3s bold {...gradientTextStyle}>
                  ${truncateValue(dailyRate, 2)}
                </TextSpan>
                <TextSpan t6 bold pl={5}>
                  / Day
                </TextSpan>
              </Text>
            </Flex>
          </StyledTooltip>
        </Flex>
        <Button info secondary {...bigButtonStyle} onClick={addItem}>
          + Add Asset
        </Button>
        {editableProtocols.map((protocol: SolaceRiskProtocol) => {
          const riskColor = getColorByTier(protocol.tier)
          return (
            <Protocol
              key={protocol.appId}
              protocol={protocol}
              editableProtocols={editableProtocols}
              riskColor={riskColor}
              deleteItem={deleteItem}
              editItem={editItem}
              runSimulation={runSimulation}
              simulating={simulating}
            />
          )
        })}
      </Flex>
    </Content>
  )
}
