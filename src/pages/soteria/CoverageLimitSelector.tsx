import React, { useEffect, useState, useMemo } from 'react'
import { Flex } from '../../components/atoms/Layout'
import { GraySquareButton } from '../../components/atoms/Button'
import { GenericInputSection } from '../../components/molecules/InputSection'
import { ZERO } from '../../constants'
import { BigNumber } from 'ethers'
import { StyledArrowIosBackOutline, StyledArrowIosForwardOutline } from '../../components/atoms/Icon'
import { SolaceRiskScore } from '../../constants/types'
import { accurateMultiply, filterAmount } from '../../utils/formatting'
import { formatUnits } from 'ethers/lib/utils'
import { Text } from '../../components/atoms/Typography'
import useDebounce from '@rooks/use-debounce'

enum ChosenLimit {
  Custom,
  MaxPosition,
  Recommended,
}

const ChosenLimitLength = Object.values(ChosenLimit).filter((x) => typeof x === 'number').length

const nextChosenLimit = (chosenLimit: ChosenLimit) => ((chosenLimit + 1) % ChosenLimitLength) as ChosenLimit
const prevChosenLimit = (chosenLimit: ChosenLimit) =>
  ((chosenLimit - 1 + ChosenLimitLength) % ChosenLimitLength) as ChosenLimit

export const CoverageLimitSelector = ({
  portfolioScore,
  setNewCoverageLimit,
}: {
  portfolioScore?: SolaceRiskScore
  setNewCoverageLimit: (newCoverageLimit: BigNumber) => void
}): JSX.Element => {
  const [chosenLimit, setChosenLimit] = useState<ChosenLimit>(ChosenLimit.Recommended)

  const [highestAmount, setHighestAmount] = useState<BigNumber>(ZERO)
  const [recommendedAmount, setRecommendedAmount] = useState<BigNumber>(ZERO)
  const [customInputAmount, setCustomInputAmount] = useState<string>('')

  const [localNewCoverageLimit, setLocalNewCoverageLimit] = useState<BigNumber>(recommendedAmount)

  const highestPosition = useMemo(
    () =>
      portfolioScore && portfolioScore.protocols.length > 0
        ? portfolioScore.protocols.reduce((pn, cn) => (cn.balanceUSD > pn.balanceUSD ? cn : pn))
        : undefined,
    [portfolioScore]
  )

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
    setLocalNewCoverageLimit(bnFiltered)
    setCustomInputAmount(filtered)
    if (!recommendedAmount.eq(bnFiltered) && !highestAmount.eq(bnFiltered)) {
      setChosenLimit(ChosenLimit.Custom)
    }
  }

  useEffect(() => {
    if (!highestPosition) return
    /** Big Number Balance */ const bnBal = BigNumber.from(accurateMultiply(highestPosition.balanceUSD, 18))
    /** balance + 20% */ const bnHigherBal = bnBal.add(bnBal.div(BigNumber.from('5')))
    setHighestAmount(bnBal)
    setRecommendedAmount(bnHigherBal)
  }, [highestPosition])

  useEffect(() => {
    switch (chosenLimit) {
      case ChosenLimit.Recommended:
        setLocalNewCoverageLimit(recommendedAmount)
        setCustomInputAmount(formatUnits(recommendedAmount, 18))
        break
      case ChosenLimit.MaxPosition:
        setLocalNewCoverageLimit(highestAmount)
        setCustomInputAmount(formatUnits(highestAmount, 18))
        break
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chosenLimit, highestAmount, recommendedAmount, customInputAmount])

  const _setNewCoverageLimit = useDebounce(() => {
    setNewCoverageLimit(localNewCoverageLimit)
  }, 300)

  useEffect(() => {
    _setNewCoverageLimit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localNewCoverageLimit])

  return (
    <Flex col stretch>
      <Flex justifyCenter>
        <Text t4s>Select Limit</Text>
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
  )
}
