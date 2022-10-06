import useDebounce from '@rooks/use-debounce'
import { ZERO } from '@solace-fi/sdk-nightly'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Accordion } from '../../../components/atoms/Accordion'
import { Button } from '../../../components/atoms/Button'
import { StyledFire } from '../../../components/atoms/Icon'
import { Flex } from '../../../components/atoms/Layout'
import { Text } from '../../../components/atoms/Typography'
import { GrayBox } from '../../../components/molecules/GrayBox'
import { SmallerInputSection } from '../../../components/molecules/InputSection'
import { Modal } from '../../../components/molecules/Modal'
import { FunctionName } from '../../../constants/enums'
import { VoteLockData } from '../../../constants/types'
import { useGeneral } from '../../../context/GeneralManager'
import { useProvider } from '../../../context/ProviderManager'
import { useTransactionExecution } from '../../../hooks/internal/useInputAmount'
import { useWindowDimensions } from '../../../hooks/internal/useWindowDimensions'
import { useBalanceConversion } from '../../../hooks/lock/useUnderwritingHelper'
import { useUwLocker } from '../../../hooks/lock/useUwLocker'
import { filterAmount, floatUnits, formatAmount, truncateValue } from '../../../utils/formatting'
import { useLockContext } from '../LockContext'

export const MultiWithdrawModal = ({
  isOpen,
  handleClose,
  selectedLocks,
}: {
  isOpen: boolean
  handleClose: () => void
  selectedLocks: VoteLockData[]
}): JSX.Element => {
  const { account } = useWeb3React()
  const { appTheme } = useGeneral()
  const { isMobile } = useWindowDimensions()
  const { uweToTokens } = useBalanceConversion()
  const { paymentCoins, locker } = useLockContext()
  const { latestBlock } = useProvider()
  const { stakedBalance } = locker
  const {
    withdraw,
    withdrawInPart,
    withdrawMultiple,
    withdrawInPartMultiple,
    getBurnOnWithdrawAmount,
    getBurnOnWithdrawInPartAmount,
  } = useUwLocker()
  const { batchBalanceData } = paymentCoins
  const { handleToast, handleContractCallError } = useTransactionExecution()

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
  const [amountOverTotalSupply, setAmountOverTotalSupply] = useState<boolean>(false)
  const [maxSelected, setMaxSelected] = useState<boolean>(false)
  const [actualUweWithdrawal, setActualUweWithdrawal] = useState<BigNumber>(ZERO)
  const [burnAmount, setBurnAmount] = useState<BigNumber>(ZERO)

  const callWithdraw = async () => {
    if (!account) return
    const chosenlocks = amountTracker.filter((lock) => !parseUnits(formatAmount(lock.amount), 18).isZero())
    if (chosenlocks.length === 0) return
    if (chosenlocks.length == 1) {
      let type = FunctionName.WITHDRAW_LOCK_IN_PART
      const isMax = parseUnits(formatAmount(totalAmountToWithdraw), 18).eq(
        parseUnits(formatAmount(chosenlocks[0].amount), 18)
      )
      if (isMax) {
        type = FunctionName.WITHDRAW_LOCK
      }
      if (!isMax) {
        await withdrawInPart(chosenlocks[0].lockID, parseUnits(formatAmount(totalAmountToWithdraw), 18), account)
          .then((res) => handleToast(res.tx, res.localTx))
          .catch((err) => handleContractCallError('callWithdrawInPart', err, type))
      } else {
        await withdraw(chosenlocks[0].lockID, account)
          .then((res) => handleToast(res.tx, res.localTx))
          .catch((err) => handleContractCallError('callWithdraw', err, type))
      }
    } else {
      let type = FunctionName.WITHDRAW_LOCK_IN_PART_MULTIPLE
      if (maxSelected) type = FunctionName.WITHDRAW_LOCK_MULTIPLE
      if (!maxSelected) {
        await withdrawInPartMultiple(
          chosenlocks.map((item) => item.lockID),
          chosenlocks.map((item) => parseUnits(formatAmount(item.amount), 18)),
          account
        )
          .then((res) => handleToast(res.tx, res.localTx))
          .catch((err) => handleContractCallError('callWithdrawInPartMultiple', err, type))
      } else {
        await withdrawMultiple(
          chosenlocks.map((item) => item.lockID),
          account
        )
          .then((res) => handleToast(res.tx, res.localTx))
          .catch((err) => handleContractCallError('callWithdrawMultiple', err, type))
      }
    }
  }

  const areWithdrawAmountsValid = useMemo(() => {
    const invalidAmounts = amountTracker.filter((item, i) => {
      return parseUnits(formatAmount(item.amount), 18).gt(selectedLocks[i].amount)
    })
    return invalidAmounts.length === 0
  }, [amountTracker, selectedLocks])

  const isTotalWithdrawalValid = useMemo(() => {
    const BN_totalAmountToWithdraw = parseUnits(formatAmount(totalAmountToWithdraw), 18)
    return BN_totalAmountToWithdraw.lte(stakedBalance) && !BN_totalAmountToWithdraw.isZero()
  }, [totalAmountToWithdraw, stakedBalance])

  const handleAmountInput = useCallback(
    (input: string, index: number) => {
      const filtered = filterAmount(input, amountTracker[index].amount.toString())
      setMaxSelected(false)
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

  const handleMax = useCallback(() => {
    setMaxSelected(true)
    setAmountTracker((prevState) => {
      return prevState.map((item, i) => {
        return {
          ...item,
          amount: formatUnits(selectedLocks[i].amount, 18),
        }
      })
    })
  }, [selectedLocks])

  const changeAlltoCommonAmount = useDebounce((commonAmount: string) => {
    setMaxSelected(false)
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
    if (isOpen) {
      setMaxSelected(false)
      setAmountTracker(
        selectedLocks.map((lock) => {
          return {
            lockID: lock.lockID,
            amount: '',
          }
        })
      )
    } else {
      setAmountTracker([])
      setCommonAmount('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const getConversion = useDebounce(async () => {
    const totalUweToWithdraw = totalAmountToWithdraw
    const burnAmountArray = await Promise.all(
      amountTracker.map((item) =>
        maxSelected
          ? getBurnOnWithdrawAmount(item.lockID)
          : getBurnOnWithdrawInPartAmount(item.lockID, parseUnits(formatAmount(item.amount), 18))
      )
    )
    const totalBurnAmount = burnAmountArray.reduce((acc, curr) => acc.add(curr), ZERO)
    const _actualUweWithdrawal = parseUnits(formatAmount(totalUweToWithdraw), 18).sub(totalBurnAmount)
    setBurnAmount(totalBurnAmount)
    setActualUweWithdrawal(_actualUweWithdrawal.gt(ZERO) ? _actualUweWithdrawal : ZERO)
    // const res = await uweToTokens(_actualUweWithdrawal)
    // setEquivalentTokenAmounts(res.depositTokens)
    // setEquivalentUSDValue(res.usdValueOfUwpAmount)
    // setAmountOverTotalSupply(!res.successful)
  }, 400)

  useEffect(() => {
    getConversion()
  }, [totalAmountToWithdraw, latestBlock])

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
        <Flex col={isMobile} gap={10}>
          <Accordion isOpen={true} thinScrollbar customHeight={'50vh'}>
            <Flex col gap={10} p={10}>
              {amountTracker.map((lock, i) => (
                <Flex gap={10} key={i}>
                  <Text error={parseUnits(formatAmount(lock.amount), 18).gt(selectedLocks[i].amount)} autoAlignVertical>
                    #{lock.lockID.toNumber()}
                  </Text>
                  <SmallerInputSection
                    placeholder={'Amount'}
                    value={lock.amount}
                    onChange={(e) => handleAmountInput(e.target.value, i)}
                  />
                </Flex>
              ))}
            </Flex>
          </Accordion>
          <Flex column stretch>
            <GrayBox>
              <Flex stretch column>
                <Flex stretch gap={24}>
                  {!amountOverTotalSupply ? (
                    <Flex column gap={15}>
                      <Text t5s techygradient={appTheme == 'light'} warmgradient={appTheme == 'dark'}>
                        Tokens to be given on withdrawal
                      </Text>
                      {/* <Text t3s techygradient={appTheme == 'light'} warmgradient={appTheme == 'dark'}>
                        ${truncateValue(formatUnits(equivalentUSDValue, 18), 2)}
                      </Text>
                      <Flex col gap={2}>
                        {batchBalanceData.length > 0 &&
                          equivalentTokenAmounts.length > 0 &&
                          equivalentTokenAmounts.map((item, i) => (
                            <Flex key={i} between>
                              <Text>
                                <img
                                  src={`https://assets.solace.fi/${batchBalanceData[i].name.toLowerCase()}`}
                                  height={20}
                                />
                              </Text>
                              <Text>{truncateValue(formatUnits(item, batchBalanceData[i].decimals), 3)}</Text>
                              <Text>
                                ~$
                                {truncateValue(
                                  floatUnits(item, batchBalanceData[i].decimals) * batchBalanceData[i].price,
                                  2
                                )}
                              </Text>
                            </Flex>
                          ))}
                      </Flex> */}
                      <Text t3s techygradient={appTheme == 'light'} warmgradient={appTheme == 'dark'}>
                        <Flex>{formatUnits(actualUweWithdrawal, 18)} UWE</Flex>
                      </Text>
                      <Flex>
                        <Text error>
                          <StyledFire size={18} />
                        </Text>
                        <Text t4s error>
                          {burnAmount.gt(ZERO) ? formatUnits(burnAmount, 18) : '0'} UWE
                        </Text>
                      </Flex>
                    </Flex>
                  ) : (
                    <Text warning>Withdrawal amount is over total supply</Text>
                  )}
                </Flex>
              </Flex>
            </GrayBox>
          </Flex>
        </Flex>
        <Flex col={isMobile} gap={10}>
          <Button
            widthP={100}
            secondary
            warmgradient
            noborder
            disabled={(!maxSelected && (!areWithdrawAmountsValid || !isTotalWithdrawalValid)) || amountOverTotalSupply}
            onClick={callWithdraw}
          >
            Make Withdrawals
          </Button>
          <Button widthP={100} noborder matchBg onClick={handleMax}>
            <Text warmgradient>MAX</Text>
          </Button>
        </Flex>
      </Flex>
    </Modal>
  )
}
