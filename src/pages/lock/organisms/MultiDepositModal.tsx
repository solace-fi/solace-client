import useDebounce from '@rooks/use-debounce'
import { ERC20_ABI, ZERO } from '@solace-fi/sdk-nightly'
import { BigNumber, Contract } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Accordion } from '../../../components/atoms/Accordion'
import { Button } from '../../../components/atoms/Button'
import { StyledArrowDropDown } from '../../../components/atoms/Icon'
import { Flex, GrayBgDiv } from '../../../components/atoms/Layout'
import { Text } from '../../../components/atoms/Typography'
import { SmallerInputSection } from '../../../components/molecules/InputSection'
import { Modal } from '../../../components/molecules/Modal'
import { FunctionName } from '../../../constants/enums'
import { VoteLockData } from '../../../constants/types'
import { useGeneral } from '../../../context/GeneralManager'
import { useProvider } from '../../../context/ProviderManager'
import { useTokenAllowance } from '../../../hooks/contract/useToken'
import { useInputAmount, useTransactionExecution } from '../../../hooks/internal/useInputAmount'
import { useUwpLocker } from '../../../hooks/lock/useUwpLocker'
import { filterAmount } from '../../../utils/formatting'
import { useLockContext } from '../LockContext'

export const MultiDepositModal = ({
  isOpen,
  handleClose,
  selectedLocks,
}: {
  isOpen: boolean
  handleClose: () => void
  selectedLocks: VoteLockData[]
}): JSX.Element => {
  const [amountTracker, setAmountTracker] = useState<
    {
      lockID: BigNumber
      amount: string
    }[]
  >([])

  const { appTheme } = useGeneral()
  const { signer } = useProvider()
  const { isAppropriateAmount } = useInputAmount()
  const { increaseAmountMultiple } = useUwpLocker()
  const { handleToast, handleContractCallError } = useTransactionExecution()
  const { paymentCoins, input } = useLockContext()
  const { batchBalanceData, coinsOpen, setCoinsOpen, approveCPM } = paymentCoins
  const { selectedCoin } = input

  const selectedCoinContract = useMemo(() => new Contract(selectedCoin.address, ERC20_ABI, signer), [
    selectedCoin.address,
    signer,
  ])

  const selectedCoinBalance = useMemo(() => {
    return batchBalanceData.find((d) => d.address.toLowerCase() == selectedCoin.address.toLowerCase())?.balance ?? ZERO
  }, [batchBalanceData, selectedCoin])

  const [commonAmount, setCommonAmount] = useState<string>('')
  const [totalAmountToDeposit, setTotalAmountToDeposit] = useState<string>('')

  const depositApproval = useTokenAllowance(
    selectedCoinContract,
    null,
    totalAmountToDeposit && totalAmountToDeposit != '.'
      ? parseUnits(totalAmountToDeposit, selectedCoin.decimals).toString()
      : '0'
  )

  const isAcceptableDeposit = useMemo(() => {
    if (!selectedCoinBalance) return false
    return isAppropriateAmount(totalAmountToDeposit, selectedCoin.decimals, selectedCoinBalance)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchBalanceData, totalAmountToDeposit, selectedCoin.address, selectedCoin.decimals])

  const callIncreaseLockAmountMultiple = async () => {
    await increaseAmountMultiple(
      amountTracker.map((d) => d.lockID),
      amountTracker.map((d) => parseUnits(d.amount, selectedCoin.decimals))
    )
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callIncreaseAmountMultiple', err, FunctionName.INCREASE_AMOUNT_MULTIPLE))
  }

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
    const total = amounts.reduce(
      (acc, curr) => acc.add(curr == '' ? ZERO : parseUnits(curr, selectedCoin.decimals)),
      ZERO
    )
    setTotalAmountToDeposit(formatUnits(total, selectedCoin.decimals))
  }, 300)

  useEffect(() => {
    changeAlltoCommonAmount(commonAmount)
  }, [changeAlltoCommonAmount, commonAmount])

  useEffect(() => {
    handleTotalAmount(amountTracker)
  }, [handleTotalAmount, amountTracker])

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

  return (
    <Modal isOpen={isOpen} handleClose={handleClose} modalTitle={'Deposit'}>
      <Flex col gap={10}>
        <Flex col>
          <Button
            nohover
            noborder
            p={8}
            mt={12}
            ml={12}
            mb={12}
            widthP={100}
            style={{
              justifyContent: 'center',
              height: '32px',
              backgroundColor: appTheme === 'light' ? '#FFFFFF' : '#2a2f3b',
            }}
            onClick={() => setCoinsOpen(!coinsOpen)}
          >
            <Flex center gap={4}>
              <Text autoAlignVertical>
                <img src={`https://assets.solace.fi/${selectedCoin.name.toLowerCase()}`} height={16} />
              </Text>
              <Text t4>{selectedCoin.symbol}</Text>
              <StyledArrowDropDown style={{ transform: coinsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} size={18} />
            </Flex>
          </Button>
        </Flex>
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
        <GrayBgDiv>
          <Flex col>
            <Text>Amount of UWE minted in exchange</Text>
            <Text>$$$</Text>
          </Flex>
        </GrayBgDiv>
        {depositApproval && (
          <Button
            secondary
            warmgradient
            noborder
            disabled={!isAcceptableDeposit}
            onClick={callIncreaseLockAmountMultiple}
          >
            Make Deposits
          </Button>
        )}
        {!depositApproval && (
          <Button
            secondary
            warmgradient
            noborder
            disabled={!isAcceptableDeposit}
            onClick={() =>
              approveCPM('', selectedCoinContract.address, parseUnits(totalAmountToDeposit, selectedCoin.decimals))
            }
          >
            {`Approve Entered ${selectedCoin.symbol}`}
          </Button>
        )}
        {!depositApproval && (
          <Button secondary warmgradient noborder onClick={() => approveCPM('', selectedCoinContract.address)}>
            {`Approve MAX ${selectedCoin.symbol}`}
          </Button>
        )}
      </Flex>
    </Modal>
  )
}
