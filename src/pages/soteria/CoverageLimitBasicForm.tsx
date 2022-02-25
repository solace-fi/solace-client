import React, { useEffect, useState, useMemo } from 'react'
import { Flex } from '../../components/atoms/Layout'
import { GraySquareButton } from '../../components/atoms/Button'
import { FixedHeightGrayBox } from '../../components/molecules/GrayBox'
import { GenericInputSection } from '../../components/molecules/InputSection'
import commaNumber from '../../utils/commaNumber'
import { ZERO } from '../../constants'
import { BigNumber } from 'ethers'
import { StyledArrowIosBackOutline, StyledArrowIosForwardOutline } from '../../components/atoms/Icon'
import { SolaceRiskScore } from '../../constants/types'
import { accurateMultiply, filterAmount, floatUnits, truncateValue } from '../../utils/formatting'
import { formatUnits } from 'ethers/lib/utils'
import { Text } from '../../components/atoms/Typography'

enum ChosenLimit {
  Custom,
  MaxPosition,
  Recommended,
}

const ChosenLimitLength = Object.values(ChosenLimit).filter((x) => typeof x === 'number').length

const nextChosenLimit = (chosenLimit: ChosenLimit) => ((chosenLimit + 1) % ChosenLimitLength) as ChosenLimit
const prevChosenLimit = (chosenLimit: ChosenLimit) =>
  ((chosenLimit - 1 + ChosenLimitLength) % ChosenLimitLength) as ChosenLimit

export function CoverageLimitBasicForm({
  portfolio,
  currentCoverageLimit,
  isEditing,
  setNewCoverageLimit,
}: {
  portfolio: SolaceRiskScore | undefined
  currentCoverageLimit: BigNumber
  isEditing: boolean
  setNewCoverageLimit: (newCoverageLimit: BigNumber) => void
}): JSX.Element {
  const [chosenLimit, setChosenLimit] = useState<ChosenLimit>(ChosenLimit.Recommended)

  const highestPosition = useMemo(
    () =>
      portfolio && portfolio.protocols.length > 0
        ? portfolio.protocols.reduce((pn, cn) => (cn.balanceUSD > pn.balanceUSD ? cn : pn))
        : undefined,
    [portfolio]
  )

  // const usdBalanceSum = useMemo(
  //   () =>
  //     portfolio && portfolio.protocols.length > 0
  //       ? portfolio.protocols.reduce((total, protocol) => (total += protocol.balanceUSD), 0)
  //       : 0,
  //   [portfolio]
  // )

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
    setNewCoverageLimit(bnFiltered)
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
        setNewCoverageLimit(recommendedAmount)
        setCustomInputAmount(formatUnits(recommendedAmount, 18))
        break
      case ChosenLimit.MaxPosition:
        setNewCoverageLimit(highestAmount)
        setCustomInputAmount(formatUnits(highestAmount, 18))
        break
    }
  }, [chosenLimit, highestAmount, setNewCoverageLimit, recommendedAmount, customInputAmount])

  return (
    <>
      <Flex col justifyStart gap={30} stretch>
        {!isEditing ? (
          <FixedHeightGrayBox
            h={66}
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: '40px',
            }}
          >
            <Flex baseline center>
              <Text techygradient t2 bold>
                {commaNumber(truncateValue(floatUnits(currentCoverageLimit, 18), 2, false))}{' '}
                <Text techygradient t4 bold inline>
                  USD
                </Text>
              </Text>
            </Flex>
          </FixedHeightGrayBox>
        ) : (
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
                      [ChosenLimit.Recommended]: `120% of your highest position`,
                      [ChosenLimit.MaxPosition]: `100% of your highest position`,
                      [ChosenLimit.Custom]: `Enter custom amount below`,
                    }[chosenLimit]
                  }
                </Text>
              </Flex>
              <GraySquareButton onClick={() => setChosenLimit(nextChosenLimit(chosenLimit))}>
                <StyledArrowIosForwardOutline height={18} />
              </GraySquareButton>
            </Flex>
            <GenericInputSection
              // icon={<img src={DAI} alt="DAI" height={20} />}
              onChange={(e) => handleInputChange(e.target.value)}
              text="DAI"
              value={customInputAmount}
              disabled={false}
              style={{
                marginTop: '20px',
              }}
              iconAndTextWidth={80}
              displayIconOnMobile
            />
          </Flex>
        )}
        {portfolio && portfolio.protocols.length > 0 && (
          <Flex col stretch>
            {/* <Flex center mt={4}>
                <Flex baseline gap={4} center>
                  <Text t4>Net worth found in your portfolio:</Text>
                </Flex>
              </Flex>
              <Flex center mt={4}>
                <Flex baseline gap={4} center>
                  <Flex gap={4} baseline mt={2}>
                    <Text t3 bold>
                      {truncateValue(usdBalanceSum, 2, false)}
                    </Text>
                    <Text t4 bold>
                      USD
                    </Text>
                  </Flex>
                </Flex>
              </Flex> */}
            <Flex center mt={20}>
              <Flex baseline gap={4} center>
                <Text t4>Highest position in your portfolio:</Text>
              </Flex>
            </Flex>
            <Flex center mt={4}>
              <Flex baseline gap={4} center>
                <Flex gap={4} baseline mt={2}>
                  <Text t2 bold>
                    {truncateValue(formatUnits(highestAmount, 18), 2, false)}
                  </Text>
                  <Text t4 bold>
                    USD
                  </Text>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        )}
      </Flex>
    </>
  )
}
