import useDebounce from '@rooks/use-debounce'
import { ZERO } from '@solace-fi/sdk-nightly'
import { BigNumber } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import React, { useCallback, useEffect, useState } from 'react'
import { Accordion } from '../../../components/atoms/Accordion'
import { Button } from '../../../components/atoms/Button'
import { Flex } from '../../../components/atoms/Layout'
import { Text } from '../../../components/atoms/Typography'
import { GrayBox } from '../../../components/molecules/GrayBox'
import { SmallerInputSection } from '../../../components/molecules/InputSection'
import { Modal } from '../../../components/molecules/Modal'
import { BKPT_7, BKPT_5 } from '../../../constants'
import { VoteLockData } from '../../../constants/types'
import { useGeneral } from '../../../context/GeneralManager'
import { useWindowDimensions } from '../../../hooks/internal/useWindowDimensions'
import { useBalanceConversion } from '../../../hooks/lock/useUnderwritingHelper'
import { filterAmount, formatAmount, truncateValue } from '../../../utils/formatting'
import { Label } from '../molecules/InfoPair'

export const MultiWithdrawModal = ({
  isOpen,
  handleClose,
  selectedLocks,
}: {
  isOpen: boolean
  handleClose: () => void
  selectedLocks: VoteLockData[]
}): JSX.Element => {
  const { appTheme, rightSidebar } = useGeneral()
  const { width } = useWindowDimensions()
  const { uweToTokens } = useBalanceConversion()

  const [amountTracker, setAmountTracker] = useState<
    {
      lockID: BigNumber
      amount: string
    }[]
  >([])

  const [commonAmount, setCommonAmount] = useState<string>('')
  const [totalAmountToWithdraw, setTotalAmountToWithdraw] = useState<string>('')
  const [equivalentTokenAmounts, setEquivalentTokenAmounts] = useState<BigNumber[]>([])
  const [equivalentUSDValue, setEquivalentUSDValue] = useState<BigNumber>(ZERO)

  const handleAmountInput = useCallback(
    (input: string, index: number) => {
      const filtered = filterAmount(input, amountTracker[index].amount.toString())
      setAmountTracker((prevState) => {
        return [
          ...prevState.slice(0, index),
          {
            ...prevState[index],
            amount: filtered,
          },
          ...prevState.slice(index + 1),
        ]
      })
    },
    [amountTracker]
  )

  const handleCommonAmountInput = useCallback(
    (input: string) => {
      const filtered = filterAmount(input, commonAmount)
      setCommonAmount(filtered)
    },
    [commonAmount]
  )

  const changeAlltoCommonAmount = useDebounce((commonAmount: string) => {
    setAmountTracker(
      amountTracker.map((item) => {
        return {
          ...item,
          amount: commonAmount,
        }
      })
    )
  }, 400)

  const handleTotalAmount = useDebounce((amountTracker: { lockID: BigNumber; amount: string }[]) => {
    const amounts = amountTracker.map((item) => item.amount)
    const total = amounts.reduce((acc, curr) => acc.add(curr == '' ? ZERO : parseUnits(curr, 18)), ZERO)
    setTotalAmountToWithdraw(formatUnits(total, 18))
  }, 300)

  useEffect(() => {
    changeAlltoCommonAmount(commonAmount)
  }, [changeAlltoCommonAmount, commonAmount])

  useEffect(() => {
    handleTotalAmount(amountTracker)
  }, [handleTotalAmount, amountTracker])

  useEffect(() => {
    changeAlltoCommonAmount(commonAmount)
  }, [changeAlltoCommonAmount, commonAmount])

  useEffect(() => {
    if (isOpen)
      setAmountTracker(
        selectedLocks.map((lock) => {
          return {
            lockID: lock.lockID,
            amount: '',
          }
        })
      )
    else {
      setAmountTracker([])
      setCommonAmount('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const getConversion = useDebounce(async () => {
    const res = await uweToTokens(parseUnits(formatAmount(totalAmountToWithdraw), 18))
    setEquivalentTokenAmounts(res.depositTokens)
    setEquivalentUSDValue(res.usdValue)
  }, 400)

  useEffect(() => {
    getConversion()
  }, [totalAmountToWithdraw])

  return (
    <Modal isOpen={isOpen} handleClose={handleClose} modalTitle={'Withdraw'}>
      <Flex col gap={10}>
        <Flex col>
          <Text>Set all to this amount</Text>
          <SmallerInputSection
            placeholder={'Amount'}
            value={commonAmount}
            onChange={(e) => handleCommonAmountInput(e.target.value)}
          />
        </Flex>
        <Accordion isOpen={true} thinScrollbar customHeight={'50vh'}>
          <Flex col gap={10} p={10}>
            {amountTracker.map((lock, i) => (
              <Flex gap={10} key={i}>
                <Text autoAlign>Lock</Text>
                <SmallerInputSection
                  placeholder={'Amount'}
                  value={lock.amount}
                  onChange={(e) => handleAmountInput(e.target.value, i)}
                />
              </Flex>
            ))}
          </Flex>
        </Accordion>
        <Flex column stretch width={500}>
          <Label importance="quaternary" style={{ marginBottom: '8px' }}>
            Projected benefits
          </Label>
          <GrayBox>
            <Flex stretch column>
              <Flex stretch gap={24}>
                <Flex column gap={2}>
                  <Text t5s techygradient={appTheme == 'light'} warmgradient={appTheme == 'dark'}>
                    Tokens to be given on withdrawal
                  </Text>
                  <div style={(rightSidebar ? BKPT_7 : BKPT_5) > width ? { display: 'block' } : { display: 'none' }}>
                    &nbsp;
                  </div>
                  <Text t3s techygradient={appTheme == 'light'} warmgradient={appTheme == 'dark'}>
                    <Flex>${truncateValue(formatUnits(equivalentUSDValue, 18), 2)}</Flex>
                  </Text>
                </Flex>
              </Flex>
            </Flex>
          </GrayBox>
        </Flex>
        <Button secondary warmgradient noborder>
          Make Withdrawals
        </Button>
        <Button noborder matchBg>
          <Text warmgradient>Withdraw everything</Text>
        </Button>
      </Flex>
    </Modal>
  )
}
