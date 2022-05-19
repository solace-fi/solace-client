import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { BigNumber } from 'ethers'
import { Content, Flex, VerticalSeparator } from '../../components/atoms/Layout'
import { useCoverageContext } from './CoverageContext'
import { Text, TextSpan } from '../../components/atoms/Typography'
import { SolaceRiskProtocol, SolaceRiskScore } from '../../constants/types'
import { Button, GraySquareButton } from '../../components/atoms/Button'
import { accurateMultiply, filterAmount, floatUnits, formatAmount, truncateValue } from '../../utils/formatting'
import { useTierColors } from '../../hooks/internal/useTierColors'
import { Protocol } from './Protocol'
import usePrevious from '../../hooks/internal/usePrevious'
import { StyledTooltip } from '../../components/molecules/Tooltip'
import { SolaceRiskBalance } from '@solace-fi/sdk-nightly'
import { useWeb3React } from '@web3-react/core'
import {
  StyledArrowIosBackOutline,
  StyledArrowIosForwardOutline,
  StyledModelTraining,
} from '../../components/atoms/Icon'
import { Loader } from '../../components/atoms/Loader'
import { ChosenLimit } from '../../constants/enums'
import { ZERO } from '../../constants'
import { formatUnits } from 'ethers/lib/utils'
import { GenericInputSection } from '../../components/molecules/InputSection'
import { TileCard } from '../../components/molecules/TileCard'

export const PortfolioWindow = (): JSX.Element => {
  const { account } = useWeb3React()
  const { portfolioKit, styles, series } = useCoverageContext()
  const { portfolio: portfolioScore, riskScores } = portfolioKit
  const { gradientTextStyle, bigButtonStyle } = styles
  const [fetchedProtocols, setFetchedProtocols] = useState<SolaceRiskProtocol[]>([])
  const [customProtocols, setCustomProtocols] = useState<SolaceRiskProtocol[]>([])
  const [simulatedPortfolioScore, setSimulatedPortfolioScore] = useState<SolaceRiskScore | undefined>(undefined)
  const [canSimulate, setCanSimulate] = useState(false)
  const [simCoverageLimit, setSimCoverageLimit] = useState<BigNumber>(BigNumber.from(0))

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

  const [chosenLimit, setChosenLimit] = useState<ChosenLimit>(ChosenLimit.Recommended)
  const ChosenLimitLength = Object.values(ChosenLimit).filter((x) => typeof x === 'number').length
  const nextChosenLimit = useCallback(
    (chosenLimit: ChosenLimit) => {
      setCanSimulate(true)
      return ((chosenLimit + 1) % ChosenLimitLength) as ChosenLimit
    },
    [ChosenLimitLength]
  )
  const prevChosenLimit = useCallback(
    (chosenLimit: ChosenLimit) => {
      setCanSimulate(true)
      return ((chosenLimit - 1 + ChosenLimitLength) % ChosenLimitLength) as ChosenLimit
    },
    [ChosenLimitLength]
  )

  const highestSimPosition = useMemo(
    () =>
      scoreToUse && scoreToUse.protocols.length > 0
        ? scoreToUse.protocols.reduce((pn, cn) => (cn.balanceUSD > pn.balanceUSD ? cn : pn))
        : undefined,
    [scoreToUse]
  )

  const [highestAmount, setHighestAmount] = useState<BigNumber>(ZERO)
  const [recommendedAmount, setRecommendedAmount] = useState<BigNumber>(ZERO)
  const [customInputAmount, setCustomInputAmount] = useState<string>('')

  const handleInputChange = (input: string) => {
    // allow only numbers and decimals
    const filtered = filterAmount(input, customInputAmount)

    // if filtered is only "0." or "." or '', filtered becomes '0.0'
    // const formatted = formatAmount(filtered)

    // if number has more than max decimal places, do not update
    if (filtered.includes('.') && filtered.split('.')[1]?.length > 18) return

    // if number is greater than available cover capacity, do not update
    // if (parseUnits(formatted, 18).gt(availableCoverCapacity)) return

    const bnFiltered = BigNumber.from(accurateMultiply(filtered, 18))
    setSimCoverageLimit(bnFiltered)
    setCustomInputAmount(filtered)
    if (!recommendedAmount.eq(bnFiltered) && !highestAmount.eq(bnFiltered)) {
      setChosenLimit(ChosenLimit.Custom)
      setCanSimulate(true)
    }
  }

  const dailyCost = useMemo(() => {
    const numberifiedSimCoverageLimit = floatUnits(simCoverageLimit, 18)
    if (usdBalanceSum < numberifiedSimCoverageLimit) return usdBalanceSum * dailyRate
    return numberifiedSimCoverageLimit * dailyRate
  }, [simCoverageLimit, dailyRate, usdBalanceSum])

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
    const matchingProtocol = series?.data.protocolMap.find((p) => p.appId.toLowerCase() === newAppId.toLowerCase())
    const fetchedP = fetchedProtocols.find((p) => p.appId.toLowerCase() === targetAppId.toLowerCase())
    let editedSomething = false
    if (fetchedP && matchingProtocol && !editedSomething) {
      setFetchedProtocols(
        fetchedProtocols.map((p) => {
          if (p.appId === targetAppId) {
            return {
              ...p,
              appId: newAppId,
              balanceUSD: numberifiedNewAmount,
              category: matchingProtocol.category,
              tier: matchingProtocol.tier,
            }
          } else {
            return p
          }
        })
      )
      editedSomething = true
    }
    const customP = customProtocols.find((p) => p.appId.toLowerCase() === targetAppId.toLowerCase())
    if (customP && matchingProtocol && !editedSomething) {
      setCustomProtocols(
        customProtocols.map((p) => {
          if (p.appId === targetAppId) {
            return {
              ...p,
              appId: newAppId,
              balanceUSD: numberifiedNewAmount,
              category: matchingProtocol.category,
              tier: matchingProtocol.tier,
            }
          } else {
            return p
          }
        })
      )
      editedSomething = true
    }
    if (editedSomething) setCanSimulate(true)
  }

  const deleteItem = (protocolAppId: string) => {
    const fetchedP = fetchedProtocols.find((p) => p.appId.toLowerCase() === protocolAppId.toLowerCase())
    let deletedSomething = false
    if (fetchedP && !deletedSomething) {
      const newFetchedP = fetchedProtocols.filter((p) => p.appId !== protocolAppId)
      setFetchedProtocols(newFetchedP)
      deletedSomething = true
    }
    const customP = customProtocols.find((p) => p.appId.toLowerCase() === protocolAppId.toLowerCase())
    if (customP && !deletedSomething) {
      const newCustomP = customProtocols.filter((p) => p.appId !== protocolAppId)
      setCustomProtocols(newCustomP)
      deletedSomething = true
    }
    if (deletedSomething) setCanSimulate(true)
  }

  const runSimulation = async () => {
    if (!account) return
    setSimulating(true)
    const riskBalances: SolaceRiskBalance[] = editableProtocols
      .filter((p) => !p.appId.includes('Unknown'))
      .map((p) => ({
        appId: p.appId,
        network: p.network,
        balanceUSD: p.balanceUSD,
      }))
    if (riskBalances.length === 0) return
    const score: SolaceRiskScore | undefined = await riskScores(riskBalances)
    setSimulatedPortfolioScore(score)
    setCanSimulate(false)
    setSimulating(false)
  }

  useEffect(() => {
    if (portfolioPrev == undefined && portfolioScore != undefined) {
      setFetchedProtocols([...portfolioScore.protocols])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolioScore, portfolioPrev])

  useEffect(() => {
    if (!highestSimPosition) return
    /** Big Number Balance */ const bnBal = BigNumber.from(accurateMultiply(highestSimPosition.balanceUSD, 18))
    /** balance + 20% */ const bnHigherBal = bnBal.add(bnBal.div(BigNumber.from('5')))
    setHighestAmount(bnBal)
    setRecommendedAmount(bnHigherBal)
  }, [highestSimPosition])

  useEffect(() => {
    switch (chosenLimit) {
      case ChosenLimit.Recommended:
        setSimCoverageLimit(recommendedAmount)
        setCustomInputAmount(formatUnits(recommendedAmount, 18))
        break
      case ChosenLimit.MaxPosition:
        setSimCoverageLimit(highestAmount)
        setCustomInputAmount(formatUnits(highestAmount, 18))
        break
    }
  }, [chosenLimit, highestAmount, setSimCoverageLimit, recommendedAmount, customInputAmount])

  return (
    <Content style={{ transition: 'all 350ms ease 0s' }}>
      <Flex col gap={8}>
        <Flex stretch evenly center pb={24}>
          <Flex col>
            <Text bold t2 textAlignCenter>
              Total
            </Text>
            <Text textAlignCenter bold t1 {...gradientTextStyle}>
              ${truncateValue(usdBalanceSum, 2)}
            </Text>
          </Flex>
          <VerticalSeparator />
          <StyledTooltip
            id={`projected-premium`}
            tip={`$${dailyCost * 365.25} / Year`}
            alwaysShowChildren
            disabled={dailyCost >= 0.01 || dailyCost == 0}
          >
            <Flex col>
              <Text bold t2 textAlignCenter>
                Daily Premium
              </Text>
              <Text textAlignCenter>
                <TextSpan t1 bold {...gradientTextStyle}>
                  ${truncateValue(dailyCost, 2)}
                </TextSpan>
                <TextSpan t5s bold pl={5}>
                  / Day
                </TextSpan>
              </Text>
            </Flex>
          </StyledTooltip>
        </Flex>
        {simulating ? (
          <Loader />
        ) : (
          <>
            <TileCard>
              <Flex col stretch>
                <Flex justifyCenter>
                  <Text t4s>Coverage Limit: </Text>
                </Flex>
                <Flex between itemsCenter mt={10}>
                  <GraySquareButton onClick={() => setChosenLimit(prevChosenLimit(chosenLimit))}>
                    <StyledArrowIosBackOutline height={18} />
                  </GraySquareButton>
                  <Flex col itemsCenter>
                    <Text info t3 bold>
                      {
                        {
                          [ChosenLimit.Recommended]: 'Recommended',
                          [ChosenLimit.MaxPosition]: 'Base',
                          [ChosenLimit.Custom]: 'Manual',
                        }[chosenLimit]
                      }
                    </Text>
                    <Text info t5s>
                      {
                        {
                          [ChosenLimit.Recommended]: `Highest Position + 20%`,
                          [ChosenLimit.MaxPosition]: `Highest Position`,
                          [ChosenLimit.Custom]: `Custom Amount`,
                        }[chosenLimit]
                      }
                    </Text>
                  </Flex>
                  <GraySquareButton onClick={() => setChosenLimit(nextChosenLimit(chosenLimit))}>
                    <StyledArrowIosForwardOutline height={18} />
                  </GraySquareButton>
                </Flex>
                <GenericInputSection
                  onChange={(e) => handleInputChange(e.target.value)}
                  value={customInputAmount}
                  disabled={false}
                  style={{
                    marginTop: '20px',
                  }}
                  iconAndTextWidth={80}
                  displayIconOnMobile
                />
              </Flex>
            </TileCard>
            <Button success secondary {...bigButtonStyle} onClick={runSimulation} disabled={!canSimulate}>
              <StyledModelTraining size={20} />
              Simulate
            </Button>
            <Button info secondary {...bigButtonStyle} onClick={addItem}>
              + Add Asset
            </Button>
          </>
        )}
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
              simulating={simulating}
            />
          )
        })}
      </Flex>
    </Content>
  )
}
