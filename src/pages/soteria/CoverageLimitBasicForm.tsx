import React, { useEffect, useState, useMemo } from 'react'
import { Flex } from '../../components/atoms/Layout'
import { FixedHeightGrayBox } from '../../components/molecules/GrayBox'
import commaNumber from '../../utils/commaNumber'
import { ZERO } from '../../constants'
import { BigNumber } from 'ethers'
import { SolaceRiskScore } from '@solace-fi/sdk-nightly'
import { accurateMultiply, floatUnits, truncateValue } from '../../utils/formatting'
import { formatUnits } from 'ethers/lib/utils'
import { Text } from '../../components/atoms/Typography'
import { useGeneral } from '../../context/GeneralManager'
import { CoverageLimitSelector } from './CoverageLimitSelector'

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
  const { appTheme } = useGeneral()

  const highestPosition = useMemo(
    () =>
      portfolio && portfolio.protocols.length > 0
        ? portfolio.protocols.reduce((pn, cn) => (cn.balanceUSD > pn.balanceUSD ? cn : pn))
        : undefined,
    [portfolio]
  )

  const [highestAmount, setHighestAmount] = useState<BigNumber>(ZERO)

  useEffect(() => {
    if (!highestPosition) return
    /** Big Number Balance */ const bnBal = BigNumber.from(accurateMultiply(highestPosition.balanceUSD, 18))
    setHighestAmount(bnBal)
  }, [highestPosition])
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
            <Flex center>
              <Text techygradient={appTheme == 'light'} warmgradient={appTheme == 'dark'} t2 bold>
                {commaNumber(truncateValue(floatUnits(currentCoverageLimit, 18), 2, false))}{' '}
                <Text techygradient={appTheme == 'light'} warmgradient={appTheme == 'dark'} t4 bold inline>
                  USD
                </Text>
              </Text>
            </Flex>
          </FixedHeightGrayBox>
        ) : (
          <CoverageLimitSelector portfolioScore={portfolio} setNewCoverageLimit={setNewCoverageLimit} />
        )}
        {portfolio && portfolio.protocols.length > 0 && (
          <Flex col stretch>
            <Flex center mt={20}>
              <Flex gap={4} center>
                <Text t4>Highest position in your portfolio:</Text>
              </Flex>
            </Flex>
            <Flex center mt={4}>
              <Flex gap={4} center>
                <Flex
                  gap={4}
                  mt={2}
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
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
