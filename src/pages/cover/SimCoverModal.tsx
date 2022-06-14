import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ModalCloseButton } from '../../components/molecules/Modal'
import { useGeneral } from '../../context/GeneralManager'
import { CoverageLimitSelector2 } from '../soteria/CoverageLimitSelector'
import { Text } from '../../components/atoms/Typography'
import { useCoverageContext } from './CoverageContext'
import { ButtonWrapper, Button } from '../../components/atoms/Button'
import { BigNumber } from 'ethers'
import { useWeb3React } from '@web3-react/core'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { FunctionName, InterfaceState } from '../../constants/enums'
import { useNetwork } from '../../context/NetworkManager'
import { useTransactionExecution } from '../../hooks/internal/useInputAmount'
import { useCoverageFunctions } from '../../hooks/policy/useSolaceCoverProductV3'
import {
  accurateMultiply,
  convertSciNotaToPrecise,
  filterAmount,
  formatAmount,
  truncateValue,
} from '../../utils/formatting'
import { Flex, ShadowDiv } from '../../components/atoms/Layout'
import { GraySquareButton } from '../../components/atoms/Button'
import { GenericInputSection } from '../../components/molecules/InputSection'
import { ZERO } from '../../constants'
import { StyledArrowIosBackOutline, StyledArrowIosForwardOutline } from '../../components/atoms/Icon'
import { ChosenLimit } from '../../constants/enums'

const ChosenLimitLength = Object.values(ChosenLimit).filter((x) => typeof x === 'number').length

const nextChosenLimit = (chosenLimit: ChosenLimit) => ((chosenLimit + 1) % ChosenLimitLength) as ChosenLimit
const prevChosenLimit = (chosenLimit: ChosenLimit) =>
  ((chosenLimit - 1 + ChosenLimitLength) % ChosenLimitLength) as ChosenLimit

export const SimCoverModal = () => {
  const { appTheme } = useGeneral()
  const { intrface, portfolioKit, input, dropdowns, styles, policy } = useCoverageContext()
  const { gradientStyle, bigButtonStyle } = styles
  const { showSimCoverModal, handleShowSimCoverModal, transactionLoading, handleTransactionLoading } = intrface
  const { simPortfolio, curPortfolio } = portfolioKit
  const { simCoverLimit, handleSimCoverLimit } = input

  const [chosenLimit, setChosenLimit] = useState<ChosenLimit>(ChosenLimit.Recommended)

  const [highestAmount, setHighestAmount] = useState<BigNumber>(ZERO)
  const [recommendedAmount, setRecommendedAmount] = useState<BigNumber>(ZERO)
  const [customInputAmount, setCustomInputAmount] = useState<string>('')

  const [localNewCoverageLimit, setLocalNewCoverageLimit] = useState<string>('')

  const highestPosition = useMemo(
    () =>
      simPortfolio?.protocols?.length && simPortfolio.protocols.length > 0
        ? simPortfolio.protocols.reduce((pn, cn) => (cn.balanceUSD > pn.balanceUSD ? cn : pn))
        : undefined,
    [simPortfolio]
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
    setLocalNewCoverageLimit(filtered)
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
        setLocalNewCoverageLimit(formatUnits(recommendedAmount, 18))
        setCustomInputAmount(formatUnits(recommendedAmount, 18))
        break
      case ChosenLimit.MaxPosition:
        setLocalNewCoverageLimit(formatUnits(highestAmount, 18))
        setCustomInputAmount(formatUnits(highestAmount, 18))
        break
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chosenLimit, highestAmount, recommendedAmount])

  useEffect(() => {
    if (chosenLimit == ChosenLimit.Recommended) {
      setLocalNewCoverageLimit(formatUnits(recommendedAmount, 18))
      handleSimCoverLimit(recommendedAmount)
    }
    if (chosenLimit == ChosenLimit.MaxPosition) {
      setLocalNewCoverageLimit(formatUnits(highestAmount, 18))
      handleSimCoverLimit(highestAmount)
    }
  }, [recommendedAmount, chosenLimit, handleSimCoverLimit, highestAmount])

  return (
    <Flex col style={{ height: 'calc(100vh - 170px)', position: 'relative' }} justifyCenter>
      <Flex
        itemsCenter
        justifyCenter
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          height: '50px',
          width: '50px',
        }}
      >
        <Flex onClick={() => handleShowSimCoverModal(false)}>
          <ModalCloseButton lightColor={appTheme == 'dark'} />
        </Flex>
      </Flex>
      <Flex justifyCenter mb={4}>
        <Text big3 mont semibold style={{ lineHeight: '29.26px' }}>
          Simulated Cover Limit
        </Text>
      </Flex>
      <Flex col stretch>
        <Flex justifyCenter>
          <Text t4s textAlignCenter>
            Maximum payout in the case of an exploit.
          </Text>
        </Flex>
        <Flex col stretch between mt={36}>
          <Flex between>
            <ShadowDiv>
              <GraySquareButton
                onClick={() => setChosenLimit(prevChosenLimit(chosenLimit))}
                width={48}
                height={48}
                noborder
              >
                <StyledArrowIosBackOutline height={22} />
              </GraySquareButton>
            </ShadowDiv>
            <Flex col itemsCenter>
              <Text techygradient t3 bold>
                {
                  {
                    [ChosenLimit.Recommended]: 'Extra safe',
                    [ChosenLimit.MaxPosition]: 'Highest position',
                    [ChosenLimit.Custom]: 'Manual',
                  }[chosenLimit]
                }
              </Text>
              <Text t5s>
                {
                  {
                    [ChosenLimit.Recommended]: (
                      <>
                        Highest Position
                        <Text success inline>
                          {' '}
                          + 20%
                        </Text>
                      </>
                    ),
                    [ChosenLimit.MaxPosition]: `in Portfolio`,
                    [ChosenLimit.Custom]: `Enter amount below`,
                  }[chosenLimit]
                }
              </Text>
            </Flex>
            <ShadowDiv>
              <GraySquareButton
                onClick={() => setChosenLimit(nextChosenLimit(chosenLimit))}
                width={48}
                height={48}
                noborder
                actuallyWhite
              >
                <StyledArrowIosForwardOutline height={22} />
              </GraySquareButton>
            </ShadowDiv>
          </Flex>
          <GenericInputSection
            onChange={(e) => handleInputChange(e.target.value)}
            value={localNewCoverageLimit}
            disabled={false}
            style={{
              marginTop: '20px',
            }}
            icon={
              <Text success big3>
                $
              </Text>
            }
            iconAndTextWidth={20}
            displayIconOnMobile
          />
        </Flex>
      </Flex>
      <ButtonWrapper>
        <Button
          {...gradientStyle}
          {...bigButtonStyle}
          onClick={() => {
            handleSimCoverLimit(parseUnits(localNewCoverageLimit, 18))
            handleShowSimCoverModal(false)
          }}
          secondary
          noborder
          disabled={parseFloat(formatAmount(localNewCoverageLimit)) == 0}
        >
          Set
        </Button>
      </ButtonWrapper>
    </Flex>
  )
}