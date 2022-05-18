import React, { useEffect, useMemo, useState } from 'react'
import { Content, Flex, VerticalSeparator } from '../../components/atoms/Layout'
import { useCoverageContext } from './CoverageContext'
import { Text, TextSpan } from '../../components/atoms/Typography'
import { SolaceRiskProtocol } from '../../constants/types'
import { Button } from '../../components/atoms/Button'
import { useGeneral } from '../../context/GeneralManager'
import { capitalizeFirstLetter, truncateValue } from '../../utils/formatting'
import { useTierColors } from '../../hooks/internal/useTierColors'
import { Protocol } from './Protocol'
import usePrevious from '../../hooks/internal/usePrevious'
import { StyledTooltip } from '../../components/molecules/Tooltip'

export const PortfolioWindow = (): JSX.Element => {
  const { appTheme } = useGeneral()
  const { portfolio: portfolioScore, styles } = useCoverageContext()
  const { gradientTextStyle, bigButtonStyle } = styles
  const [editableProtocols, setEditableProtocols] = useState<SolaceRiskProtocol[]>([])

  const usdBalanceSum = useMemo(
    () =>
      portfolioScore && portfolioScore.protocols.length > 0
        ? portfolioScore.protocols.reduce((total, protocol) => (total += protocol.balanceUSD), 0)
        : 0,
    [portfolioScore]
  )

  const annualRate = useMemo(() => (portfolioScore && portfolioScore.current_rate ? portfolioScore.current_rate : 0), [
    portfolioScore,
  ])

  const annualCost = useMemo(() => (portfolioScore && portfolioScore.address_rp ? portfolioScore.address_rp : 0), [
    portfolioScore,
  ])

  const dailyRate = useMemo(() => annualRate / 365.25, [annualRate])

  const portfolioPrev = usePrevious(portfolioScore)

  const tierColors = useTierColors(editableProtocols.map((p) => p.tier))

  const getColorByTier = (tier: number) => {
    const index = tier - 1
    if (index < 0) {
      return tierColors[tierColors.length - 1]
    } else {
      return tierColors[index]
    }
  }

  const deleteItem = (protocolAppId: string) => {
    const newEditableProtocols = editableProtocols.filter((p) => p.appId !== protocolAppId)
    setEditableProtocols(newEditableProtocols)
  }

  useEffect(() => {
    if (portfolioPrev == undefined && portfolioScore != undefined) {
      setEditableProtocols(portfolioScore.protocols ?? [])
    }
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
        <Button info secondary {...bigButtonStyle}>
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
            />
          )
        })}
      </Flex>
    </Content>
  )
}
